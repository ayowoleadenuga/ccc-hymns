'use client';

import { useState } from 'react';
import { HymnEntry } from '@/types/hymn';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS } from '@contentful/rich-text-types';
import dynamic from 'next/dynamic';
import clsx from 'clsx';

// Dynamically import OSMD wrapper to avoid SSR issues with canvas/window
const MusicScore = dynamic(() => import('@/components/MusicScore'), { 
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center bg-gray-50 text-gray-400">Loading Music Score...</div>
});

import Breadcrumbs from './Breadcrumbs';

const MidiPlayer = dynamic(() => import('@/components/MidiPlayer'), {
    ssr: false, // Tone.js relies on window/AudioContext
    loading: () => <div className="h-24 flex items-center justify-center bg-gray-50 text-gray-400">Loading Player...</div>
});

interface HymnViewerProps {
  hymn: HymnEntry;
}

const RICHTEXT_OPTIONS = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: any, children: any) => (
      <p className="mb-4 text-lg leading-relaxed text-slate-700 font-serif">{children}</p>
    ),
  },
};

type Language = 'english' | 'yoruba' | 'french' | 'egun';

export default function HymnViewer({ hymn }: HymnViewerProps) {
  // console.log('HymnViewer received hymn:', hymn); 
  const [activeTab, setActiveTab] = useState<Language>('yoruba');
  const [showScore, setShowScore] = useState(false);
  const [fontSize, setFontSize] = useState(1.125); // 1.125rem = text-lg

  const getLyricsField = (lang: Language) => {
    switch (lang) {
        case 'english': return hymn.fields.englishLyrics;
        case 'yoruba': return hymn.fields.yorubaLyrics;
        case 'french': return hymn.fields.frenchLyrics;
        case 'egun': return hymn.fields.egunLyrics;
        default: return undefined;
    }
  };

  const hasLanguage = (lang: Language) => !!getLyricsField(lang);

  const increaseFont = () => setFontSize(prev => Math.min(prev + 0.125, 2.5));
  const decreaseFont = () => setFontSize(prev => Math.max(prev - 0.125, 0.875));

  return (
    <div className="flex flex-col gap-6">
        {/* Breadcrumbs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <Breadcrumbs items={[
                { label: `Hymn ${hymn.fields.hymnNumber}`, href: '#' } // Current page usually doesn't need link, but consistency
            ]} />
        </div>

    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Controls / Tabs */}
        <div className="border-b border-gray-100 dark:border-gray-700 p-4 flex flex-wrap gap-2 justify-between items-center bg-gray-50/50 dark:bg-gray-900/30">
            <div className="flex gap-2">
                {[
                    { id: 'english', label: 'English' },
                    { id: 'yoruba', label: 'Yoruba' },
                    { id: 'french', label: 'Français' },
                    { id: 'egun', label: 'Egun' }
                ].map((lang) => {
                    const isAvailable = hasLanguage(lang.id as Language);
                    return (
                        <button
                            key={lang.id}
                            onClick={() => isAvailable && setActiveTab(lang.id as Language)}
                            disabled={!isAvailable}
                            className={clsx(
                                "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group overflow-hidden",
                                activeTab === lang.id 
                                    ? "bg-white dark:bg-gray-700 text-blue-900 dark:text-blue-100 shadow-sm border border-gray-200 dark:border-gray-600" 
                                    : isAvailable 
                                        ? "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                                        : "text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-70 bg-gray-50 dark:bg-gray-900/20"
                            )}
                            title={!isAvailable ? "Coming Soon" : ""}
                        >
                            {lang.label}
                            {!isAvailable && (
                                <span className="absolute inset-0 flex items-center justify-center bg-gray-100/10 backdrop-blur-[1px] text-[8px] font-bold uppercase tracking-widest text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Soon
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="flex gap-2 items-center">
                 {/* Font Size Controls */}
                 <div className="flex items-center gap-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-1 mr-2">
                    <button 
                        onClick={decreaseFont}
                        className="w-8 h-8 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded hover:text-slate-700 dark:hover:text-slate-100 transition-colors"
                        title="Decrease Font Size"
                        aria-label="Decrease Font Size"
                    >
                        <span className="text-xs font-bold">A-</span>
                    </button>
                    <div className="w-px h-4 bg-gray-200 dark:bg-gray-600"></div>
                    <button 
                        onClick={increaseFont}
                        className="w-8 h-8 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded hover:text-slate-700 dark:hover:text-slate-100 transition-colors"
                        title="Increase Font Size"
                        aria-label="Increase Font Size"
                    >
                        <span className="text-lg font-bold leading-none">A+</span>
                    </button>
                 </div>

                 {/* Score Toggle */}
                 {hymn.fields.musicXmlFile && (
                    <button
                        onClick={() => setShowScore(!showScore)}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                            showScore
                                ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                                : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                        )}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                        {showScore ? 'Hide Score' : 'Show Score'}
                    </button>
                 )}
            </div>
        </div>

        {showScore && hymn.fields.musicXmlFile && (
            <div className="border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-950 p-4 overflow-x-auto min-h-[400px]">
                 {/* Pass the URL of the MusicXML file */}
                <MusicScore fileUrl={(hymn.fields.musicXmlFile as any).fields.file.url} />
            </div>
        )}

        {/* Lyrics Section */}
        <div className="p-8 md:p-12 min-h-[300px]">
             {/* Header for Lyrics */}
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    Lyrics 
                    <span className="text-gray-300 dark:text-gray-600">•</span> 
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h3>
            </div>
            
            <div className="prose prose-lg max-w-none text-slate-800 dark:text-slate-200 transition-all duration-200" style={{ fontSize: `${fontSize}rem` }}>
                {getLyricsField(activeTab) ? (
                    documentToReactComponents(getLyricsField(activeTab) as any, {
                        renderNode: {
                          [BLOCKS.PARAGRAPH]: (node: any, children: any) => (
                            <p className="mb-4 leading-relaxed text-slate-700 dark:text-slate-300 font-serif" style={{ fontSize: '1em' }}>{children}</p>
                          ),
                        },
                      })
                ) : (
                    <p className="italic text-gray-400 text-base">Lyrics not available in this language.</p>
                )}
            </div>
        </div>

        {/* Audio Player */}
        {hymn.fields.midiFile && (
             <MidiPlayer midiUrl={(hymn.fields.midiFile as any).fields.file.url} />
        )}
    </div>
    </div>
  );
}
