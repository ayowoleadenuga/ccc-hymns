import Link from 'next/link';
import Image from 'next/image';
import { getHymns, getCategories } from '@/lib/api';
import HymnListControls from '@/components/HymnListControls';
import ThemeToggle from '@/components/ThemeToggle';

export const revalidate = 0; // Disable static optimization for search to work or use URL search params with client side if using static

// Actually, utilizing searchParams means this page should be dynamic or revalidated on navigation
// Next.js 15+ 16 usually handles searchParams in page props

interface HomeProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
}

const getCategoryName = (hymn: any): string | null => {
  try {
    return hymn.fields?.category?.fields?.english || null;
  } catch {
    return null;
  }
};

export default async function Home(props: HomeProps) {
  const searchParams = await props.searchParams;
  const search = searchParams?.q || '';
  const categoryId = searchParams?.category || '';

  const [hymns, categories] = await Promise.all([
    getHymns(100, 0, search, categoryId),
    getCategories()
  ]);

  return (
    <main className="min-h-screen bg-[#FDFBF7] dark:bg-gray-950 text-slate-900 dark:text-slate-100 font-sans">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="contents">
                <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 flex-shrink-0">
                        <Image 
                            src="/logo.png" 
                            alt="CCC Logo" 
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-blue-900 dark:text-blue-100 hidden sm:block">CCC Hymns</h1>
                </div>
            </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero / Search Area */}
      <div className="px-4 py-12 text-center bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent">
        <h2 className="text-4xl font-serif font-bold text-blue-900 dark:text-blue-100 mb-4">Worship in Truth & Spirit</h2>
        <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-8">
          Access the complete collection of Celestial Church of Christ hymns in multiple languages.
        </p>
        
        <HymnListControls categories={categories} />
      </div>

      {/* Hymn Grid */}
      <div className="max-w-5xl mx-auto px-4 pb-24">
        {hymns.length === 0 ? (
             <div className="text-center py-20 px-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
                    <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No hymns found</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    We couldn't find any hymns matching "{search}". Try searching for a different number, title, or keywords from the lyrics.
                </p>
                {/* Reset button could go here if we had client-side logic to clear params easily, 
                    but pure server component makes it slightly trickier without a client wrapper. 
                    The user can just clear the input box. */}
             </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {hymns.map((hymn) => {
                const categoryName = getCategoryName(hymn);
                const safeTitle = String(hymn.fields.title || 'Untitled');
                
                if (!hymn.fields.slug) return null;

                return (
                <Link 
                href={`/hymn/${hymn.fields.slug}`} 
                key={hymn.sys.id}
                className="group bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500 transition-all duration-200 flex flex-col gap-3"
                >
                <div className="flex flex-wrap justify-between items-start gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">
                    Hymn {String(hymn.fields.hymnNumber)}
                    </span>
                    {categoryName && (
                    <span className="text-[10px] text-gray-400 dark:text-gray-400 uppercase tracking-widest font-semibold bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                        {categoryName}
                    </span>
                    )}
                </div>
                <h3 className="font-serif text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-800 dark:group-hover:text-blue-300 line-clamp-2 uppercase">
                    {safeTitle}
                </h3>
                </Link>
            )})}
            </div>
        )}
      </div>
    </main>
  );
}
