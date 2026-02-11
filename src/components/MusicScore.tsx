'use client';

import { useEffect, useRef } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

interface MusicScoreProps {
  fileUrl: string;
}

export default function MusicScore({ fileUrl }: MusicScoreProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);

  useEffect(() => {
    if (!containerRef.current || !fileUrl) return;

    // Initialize OSMD
    if (!osmdRef.current) {
        osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
            autoResize: true,
            backend: 'svg',
            drawingParameters: 'compacttight', // optimizes spacing
            drawTitle: false, // We already display title
            drawSubtitle: false,
        });
    }

    // Load and render
    const loadScore = async () => {
        try {
            // Prepend https: if missing
            const url = fileUrl.startsWith('//') ? `https:${fileUrl}` : fileUrl;
            
            await osmdRef.current?.load(url);
            osmdRef.current?.render();
        } catch (error) {
            console.error("Error loading music score:", error);
        }
    };

    loadScore();

    // Cleanup
    return () => {
       // osmdRef.current = null; // Basic cleanup
    };
  }, [fileUrl]);

  return (
    <div className="relative w-full min-h-[500px] bg-white dark:filter dark:invert dark:hue-rotate-180 transition-all duration-300 overflow-hidden">
        {/* Repeated Watermark Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden flex flex-wrap content-start justify-center gap-20 p-10 opacity-40">
            {Array.from({ length: 12 }).map((_, i) => ( // Render enough copies to cover typical sheet height
                <div key={i} className="flex items-center justify-center w-[300px] h-[300px] transform -rotate-45 select-none">
                     <p className="text-3xl font-black text-gray-300 dark:text-gray-600 whitespace-nowrap">
                        C.C.C. Central Choir W/W
                    </p>
                </div>
            ))}
        </div>
        
        <div ref={containerRef} className="relative z-20" />
    </div>
  );
}
