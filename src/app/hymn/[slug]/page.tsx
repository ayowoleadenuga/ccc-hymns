import { getHymnBySlug } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import HymnViewer from '@/components/HymnViewer';
import ThemeToggle from '@/components/ThemeToggle';

export const revalidate = 60;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const getCategoryName = (hymn: any): string | null => {
  try {
    return hymn.fields?.category?.fields?.english || null;
  } catch {
    return null;
  }
};


export default async function HymnDetail(props: PageProps) {
  const params = await props.params;
  const hymn = await getHymnBySlug(params.slug);

  if (!hymn) {
    notFound();
  }

  const categoryName = getCategoryName(hymn);
  const safeTitle = String(hymn.fields.title || 'Untitled');

  return (
    <main className="min-h-screen bg-[#FDFBF7] dark:bg-gray-950 text-slate-900 dark:text-slate-100 font-sans pb-20">

       {/* Header */}
       <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                <div className="relative w-8 h-8">
                     <Image 
                        src="/logo.png" 
                        alt="CCC Logo" 
                        fill
                        className="object-contain"
                    />
                </div>
                <span className="font-medium hidden sm:inline">Back to Hymns</span>
            </Link>
          <div className="flex items-center gap-3">
             <span className="font-bold text-blue-900 dark:text-blue-100">Hymn {String(hymn.fields.hymnNumber)}</span>
             <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
            {categoryName && (
                <span className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2 block">
                {categoryName}
                </span>
            )}
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-4">{safeTitle}</h1>
        </div>

        <HymnViewer hymn={hymn} />
      </div>
    </main>
  );
}
