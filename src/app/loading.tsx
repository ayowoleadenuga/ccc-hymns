export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-gray-950 font-sans">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
             <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Hero Skeleton */}
      <div className="px-4 py-12 text-center bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent">
        <div className="h-10 w-64 mx-auto bg-gray-200 dark:bg-gray-800 rounded mb-4 animate-pulse"></div>
        <div className="h-4 w-96 mx-auto bg-gray-200 dark:bg-gray-800 rounded mb-8 animate-pulse"></div>
        
        {/* Search Bar Skeleton */}
        <div className="max-w-2xl mx-auto w-full flex gap-4">
            <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
            <div className="w-32 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse hidden md:block"></div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="max-w-5xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-3">
               <div className="flex justify-between items-center">
                  <div className="h-6 w-20 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-5 w-16 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
               </div>
               <div className="h-6 w-3/4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse mt-2"></div>
               <div className="h-6 w-1/2 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
