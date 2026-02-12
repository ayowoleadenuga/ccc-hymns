'use client';

import { useEffect, useState, useRef } from 'react';
import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';
import clsx from 'clsx';

interface MidiPlayerProps {
  midiUrl: string;
}

interface TrackControl {
  name: string;
  isMuted: boolean;
  volume: number; // -60 to 0
  instrument: string;
}

export default function MidiPlayer({ midiUrl }: MidiPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  // const [progress, setProgress] = useState(0); // Unused
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const [instrument, setInstrument] = useState<'piano' | 'organ' | 'choir'>('organ');
  
  // Advanced features state
  const [transpose, setTranspose] = useState(0); // Semitones
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [metronomeSound, setMetronomeSound] = useState<'click' | 'woodblock' | 'beep'>('click');

  // Track state
  const [tracks, setTracks] = useState<TrackControl[]>([]);

  // Refs for audio context and synths
  // We use a union type for refs because we might switch between Sampler and PolySynth
  const synths = useRef<(Tone.Sampler | Tone.PolySynth)[]>([]);
  const parts = useRef<Tone.Part[]>([]);
  const transportSchedule = useRef<number | null>(null);
  
  // Metronome refs
  const metronomePlayer = useRef<Tone.MembraneSynth | Tone.MetalSynth | Tone.Synth | null>(null);
  const metronomeLoop = useRef<Tone.Loop | null>(null);

  // Initialize Metronome Synth
  useEffect(() => {
    if (metronomeSound === 'woodblock') {
         metronomePlayer.current = new Tone.MetalSynth({
            frequency: 200,
            envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 4000,
            octaves: 1.5,
            volume: -12
        }).toDestination();
    } else if (metronomeSound === 'beep') {
        metronomePlayer.current = new Tone.Synth({
            oscillator: { type: "sine" },
            envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
            volume: -10
        }).toDestination();
    } else {
        // Default Click
        metronomePlayer.current = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 4,
            oscillator: { type: "sine" },
            envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 0.5 },
            volume: -10
        }).toDestination();
    }

    return () => {
        metronomePlayer.current?.dispose();
    };
  }, [metronomeSound]);

  // Handle Metronome Toggle
  useEffect(() => {
    if (isMetronomeOn) {
        if (!metronomeLoop.current) {
            metronomeLoop.current = new Tone.Loop((time) => {
                const note = metronomeSound === 'beep' ? "C6" : metronomeSound === 'woodblock' ? "200" : "C5";
                metronomePlayer.current?.triggerAttackRelease(note, "32n", time);
            }, "4n").start(0);
        }
    } else {
        if (metronomeLoop.current) {
            metronomeLoop.current.stop();
            metronomeLoop.current.dispose();
            metronomeLoop.current = null;
        }
    }
    
    return () => {
        if (metronomeLoop.current) {
            metronomeLoop.current.dispose();
            metronomeLoop.current = null;
        }
    };
  }, [isMetronomeOn, metronomeSound]);


  const createSynth = (inst: string): Tone.Sampler | Tone.PolySynth => {
      const pianoSamples = {
          'C4': 'C4.mp3',
          'D#4': 'Ds4.mp3',
          'F#4': 'Fs4.mp3',
          'A4': 'A4.mp3',
      };
      const baseUrl = "https://tonejs.github.io/audio/salamander/";
      
      const detuneValue = transpose * 100;

      if (inst === 'piano') {
          const s = new Tone.Sampler({
            urls: pianoSamples,
            baseUrl: baseUrl,
            volume: -5,
          }).toDestination();
          return s;
      } else if (inst === 'organ') {
          const s = new Tone.PolySynth(Tone.Synth, {
              oscillator: { type: 'fatsawtooth', count: 3, spread: 30 },
              envelope: { attack: 0.1, decay: 0.3, sustain: 1, release: 1.2 },
              volume: -8,
              detune: detuneValue
          }).toDestination();
          return s;
      } else { // choir
          const s = new Tone.PolySynth(Tone.Synth, {
              oscillator: { type: 'fatcustom', partials: [0.2, 1, 0, 0.5, 0.1], spread: 40, count: 3 },
              envelope: { attack: 0.5, decay: 0.5, sustain: 1, release: 1.5 },
              volume: -10,
              detune: detuneValue
          }).toDestination();
          return s;
      }
  };

  // Speed scaling effect
  useEffect(() => {
     // Triggering a reload of parts/midi when rate changes is necessary for accurate duration/scheduling
     // This is handled by the dependency in the main loadMidi effect
  }, [playbackRate]);

  // Transposition Effect
  useEffect(() => {
      const detuneValue = transpose * 100;
      synths.current.forEach(synth => {
          try {
            // Apply to all
            synth.set({ detune: detuneValue });
          } catch (e) { console.warn("Could not detune synth", e); }
      });
  }, [transpose]);

  // Instrument Change Effect (No reload)
  useEffect(() => {
    if (!isReady || synths.current.length === 0) return;

    // Swap synths for each track
    const newSynths = synths.current.map((oldSynth, index) => {
        const newSynth = createSynth(instrument);
        // Apply current transposition immediately
        newSynth.set({ detune: transpose * 100 });
        
        // Preserve mute/volume state
        if (tracks[index]?.isMuted) {
             newSynth.volume.value = -Infinity;
        }

        // Dispose old
        oldSynth.dispose();
        return newSynth;
    });

    synths.current = newSynths;
    
    // Update tracks state to reflect new instrument name (visual only)
    setTracks(prev => prev.map(t => ({ ...t, instrument })));

  }, [instrument]);

  useEffect(() => {
    // Initial setup
    const loadMidi = async () => {
      try {
        setIsReady(false);
        if (isPlaying) stop(); // Stop current playback if any

        const midi = await Midi.fromUrl(midiUrl);
        setDuration(midi.duration / playbackRate); // Adjusted duration

        // Reset existing resources
        synths.current.forEach(s => s.dispose());
        parts.current.forEach(p => p.dispose());
        synths.current = [];
        parts.current = [];

        // Setup tracks
        const newTrackControls: TrackControl[] = [];
        
        await Promise.all(midi.tracks.map(async (track, index) => {
          // Initial synth creation using current instrument
          // Note: We use the REF value for instrument to avoid dependency issues if we wanted, 
          // but here we just use the initial state 'instrument' is fine as this runs on mount/url change
          const synth = createSynth(instrument);
          synths.current.push(synth);

          // Create part
          const notes = track.notes.map(note => ({
            time: note.time / playbackRate, // Scale time
            note: note.name,
            duration: Math.max(note.duration / playbackRate, 0.1), // Scale duration
            velocity: note.velocity
          }));

          const part = new Tone.Part((time, value) => {
            // CRITICAL CHANGE: Look up the synth dynamically from the ref
            // This allows us to swap the synth instance in synths.current without recreating the Part
            const currentSynth = synths.current[index];
            if (currentSynth && !currentSynth.disposed) {
                currentSynth.triggerAttackRelease(value.note, value.duration, time, value.velocity);
            }
          }, notes).start(0);

          parts.current.push(part);

          // Track Meta
          let name = track.name || `Track ${index + 1}`;
          if (index === 0) name = "Soprano";
          if (index === 1) name = "Alto";
          if (index === 2) name = "Tenor";
          if (index === 3) name = "Bass";

          newTrackControls.push({
            name,
            isMuted: false,
            volume: 0,
            instrument: instrument
          });
        }));

        setTracks(newTrackControls);
        
        // Wait for buffers if using sampler
        await Tone.loaded();
        setIsReady(true);

      } catch (error) {
        console.error("Error loading MIDI:", error);
      }
    };

    if (midiUrl) {
      // Ensure we start fresh when url changes
      Tone.Transport.stop();
      Tone.Transport.seconds = 0;
      setCurrentTime(0);
      setIsPlaying(false);
      loadMidi();
    }

    // Interval for UI updates matches scaled duration logic
    const interval = setInterval(() => {
        if (Tone.Transport.state === 'started') {
            const now = Tone.Transport.seconds;
            setCurrentTime(now); 
            
             // Check for end of song (use adjusted duration)
            if (duration > 0 && now >= (duration)) { 
               stop();
            }
        }
    }, 100);

    return () => {
        clearInterval(interval);
        releaseAllNotes();
        // STOP and RESET Transport on unmount
        Tone.Transport.stop();
        Tone.Transport.seconds = 0;
        
        synths.current.forEach(s => s.dispose());
        parts.current.forEach(p => p.dispose());
        
        if (transportSchedule.current !== null) {
            Tone.Transport.clear(transportSchedule.current);
        }
    };
  }, [midiUrl, playbackRate]); // REMOVED instrument dependency 

  const releaseAllNotes = () => {
    synths.current.forEach(synth => {
        try {
            synth.releaseAll();
        } catch (e) {
            // ignore
        }
    });
  };

  const togglePlay = async () => {
    await Tone.start();
    
    if (isPlaying) {
      Tone.Transport.pause();
      releaseAllNotes();
      setIsPlaying(false);
    } else {
      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  const stop = () => {
    Tone.Transport.stop();
    Tone.Transport.seconds = 0;
    setCurrentTime(0);
    setIsPlaying(false);
    releaseAllNotes();
  };

  const replay = async () => {
    await Tone.start();
    stop();
    setTimeout(() => {
        Tone.Transport.start();
        setIsPlaying(true);
    }, 10);
  };

  const toggleMute = (index: number) => {
    const newTracks = [...tracks];
    newTracks[index].isMuted = !newTracks[index].isMuted;
    setTracks(newTracks);

    // Apply to synth
    if (synths.current[index]) {
        if (newTracks[index].isMuted) {
            synths.current[index].volume.value = -Infinity;
        } else {
            synths.current[index].volume.value = newTracks[index].volume; // Ideally use value from track state if we had slider
        }
    }
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  // 3.0 might be too fast/glitchy for web audio, stick to 2.0 max for safety or add 3 if requested explicitly. 
  // User asked for 3.0x explicitly.
  const extendedSpeeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0];

  if (!isReady) return (
      <div className="bg-slate-50 dark:bg-gray-900 p-8 border-t border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-500">Loading Instrument...</span>
      </div>
  );

  return (
    <div className="bg-slate-50 dark:bg-gray-900 p-6 border-t border-gray-200 dark:border-gray-800 rounded-b-2xl">
        {/* Main Controls Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            
            {/* Transport */}
            <div className="flex items-center gap-4">
                 <button 
                    onClick={stop}
                    className="w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    title="Stop"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="6" width="12" height="12"/></svg>
                </button>

                <button 
                    onClick={togglePlay}
                    className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 shadow-xl shadow-blue-200/50 dark:shadow-blue-900/20 hover:scale-105 transform transition-all active:scale-95"
                >
                    {isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    )}
                </button>

                <button 
                    onClick={replay}
                    className="w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Replay"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                </button>
            </div>

            {/* Settings (Speed & Instrument) */}
            <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                 
                  {/* Instrument Selector */}
                 <div className="flex items-center gap-2 px-2 border-r border-gray-100 dark:border-gray-700 pr-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inst:</span>
                    <select 
                        value={instrument}
                        onChange={(e) => setInstrument(e.target.value as any)}
                        className="bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                    >
                        <option value="piano">Piano (Grand)</option>
                        <option value="organ">Organ (Pipe)</option>
                        <option value="choir">Choir (Synth)</option>
                    </select>
                 </div>

                 {/* Transposition Controls */}
                 <div className="flex items-center gap-2 px-2 border-r border-gray-100 dark:border-gray-700 pr-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Key:</span>
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => setTranspose(prev => prev - 1)}
                            className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-xs font-bold"
                            title="Transpose Down"
                        >
                            -
                        </button>
                        <span className="text-sm font-bold min-w-[1.5rem] text-center">
                            {transpose > 0 ? `+${transpose}` : transpose}
                        </span>
                        <button 
                            onClick={() => setTranspose(prev => prev + 1)}
                            className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-xs font-bold"
                            title="Transpose Up"
                        >
                            +
                        </button>
                    </div>
                 </div>

                 {/* Metronome Toggle */}
                 <div className="flex items-center gap-2 px-2 border-r border-gray-100 dark:border-gray-700 pr-4">
                    <button 
                        onClick={() => setIsMetronomeOn(!isMetronomeOn)}
                        className={clsx(
                            "flex items-center gap-2 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors",
                            isMetronomeOn 
                                ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/20" 
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                        title="Toggle Metronome"
                    >
                        <div className={clsx("w-2 h-2 rounded-full", isMetronomeOn ? "bg-blue-500 animate-pulse" : "bg-slate-300")}></div>
                        Metro
                    </button>
                    
                    {/* Metronome Sound Selector */}
                    {isMetronomeOn && (
                       <select 
                        value={metronomeSound}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setMetronomeSound(e.target.value as any)}
                        className="bg-transparent text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 outline-none cursor-pointer w-16"
                        title="Metronome Sound"
                        >
                            <option value="click">Click</option>
                            <option value="woodblock">Wood</option>
                            <option value="beep">Beep</option>
                        </select>
                    )}
                 </div>

                 {/* Speed Selector */}
                 <div className="flex items-center gap-2 px-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rate:</span>
                     <select 
                        value={playbackRate}
                        onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                        className="bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                    >
                        {extendedSpeeds.map(speed => (
                            <option key={speed} value={speed}>{speed}x</option>
                        ))}
                    </select>
                 </div>
            </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
            <div className="flex justify-between text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">
                    <span>Playback ({instrument})</span>
                    <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
            <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden cursor-pointer">
                <div 
                    className="absolute top-0 left-0 h-full bg-blue-500 dark:bg-blue-500 rounded-full transition-all duration-100 ease-linear shadow-lg shadow-blue-500/30"
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                ></div>
            </div>
        </div>

        {/* Mixer / Tracks */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tracks.map((track, idx) => (
                <div key={idx} 
                    onClick={() => toggleMute(idx)}
                    className={clsx(
                    "relative overflow-hidden group p-3 rounded-xl border cursor-pointer select-none transition-all duration-200",
                    track.isMuted 
                        ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60" 
                        : "bg-white dark:bg-gray-800 border-blue-100 dark:border-gray-700 shadow-md shadow-blue-100/20 dark:shadow-none hover:border-blue-300 dark:hover:border-blue-500"
                )}>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className={clsx(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors shadow-sm",
                            track.isMuted 
                                ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500" 
                                : "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300"
                        )}>
                            {track.name.charAt(0)}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{track.name}</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                                {track.isMuted ? 'Muted' : 'Active'}
                            </span>
                        </div>
                    </div>
                    {/* Visual active indicator background */}
                    {!track.isMuted && isPlaying && (
                         <div className="absolute bottom-0 left-0 h-0.5 bg-blue-500 w-full animate-pulse opacity-50"></div>
                    )}
                </div>
            ))}
        </div>
    </div>
  );
}
