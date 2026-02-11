'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Entry } from 'contentful';
import { HymnCategoryFields } from '@/types/hymn';
import clsx from 'clsx';
import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

// Simple debounce hook implementation inline for now if no lib/hooks exists
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface HymnListControlsProps {
  categories: Entry<HymnCategoryFields>[];
}

export default function HymnListControls({ categories }: HymnListControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  
  // Combobox state
  const initialCategory = useMemo(() => {
      const catId = searchParams.get('category');
      return categories.find(c => c.sys.id === catId) || null;
  }, [searchParams, categories]);

  const [selectedCategory, setSelectedCategory] = useState<Entry<HymnCategoryFields> | null>(initialCategory);
  const [query, setQuery] = useState('');

  const debouncedSearch = useDebounceValue(search, 300);

  const filteredCategories =
    query === ''
      ? categories
      : categories.filter((category) => {
          const name = String(category.fields.english || '').toLowerCase();
          return name.includes(query.toLowerCase());
        });

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    let hasChanged = false;
    
    const currentQ = params.get('q') || '';
    if (debouncedSearch !== currentQ) {
      if (debouncedSearch) {
        params.set('q', debouncedSearch);
      } else {
        params.delete('q');
      }
      hasChanged = true;
    }

    const currentCategory = params.get('category') || '';
    const newCategory = selectedCategory ? selectedCategory.sys.id : '';

    if (newCategory !== currentCategory) {
      if (newCategory) {
        params.set('category', newCategory);
      } else {
        params.delete('category');
      }
      hasChanged = true;
    }

    if (hasChanged) {
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [debouncedSearch, selectedCategory, pathname, router, searchParams]);

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 max-w-2xl mx-auto w-full">
      {/* Search Input */}
      <div className="relative flex-1">
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by number, title, or lyrics..." 
          className="w-full px-5 py-3 pl-12 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        />
        <svg className="absolute left-4 top-3.5 text-gray-400 dark:text-gray-500 w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      </div>

      {/* Category Filter (Combobox) */}
      <div className="relative md:w-64 z-20 text-left">
        <Combobox value={selectedCategory} onChange={setSelectedCategory} nullable>
            <div className="relative mt-1">
            <div className="relative w-full cursor-pointer overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                <Combobox.Input
                className="w-full border-none py-3 pl-4 pr-10 text-sm leading-5 text-gray-700 dark:text-gray-200 bg-transparent font-medium focus:ring-0 outline-none cursor-pointer placeholder-gray-500 dark:placeholder-gray-400"
                displayValue={(category: Entry<HymnCategoryFields>) => String(category?.fields?.english || '')}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="All Categories"
                />
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400 dark:text-gray-500"
                    aria-hidden="true"
                />
                </Combobox.Button>
            </div>
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50 border border-gray-100 dark:border-gray-700">
                {filteredCategories.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-400">
                    Nothing found.
                </div>
                ) : (
                filteredCategories.map((category) => (
                    <Combobox.Option
                    key={category.sys.id}
                    className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-gray-100'
                        }`
                    }
                    value={category}
                    >
                    {({ selected, active }) => (
                        <>
                        <span
                            className={`block truncate ${
                            selected ? 'font-medium' : 'font-normal'
                            }`}
                        >
                            {String(category.fields.english || 'Untitled')}
                        </span>
                        {selected ? (
                            <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                active ? 'text-white' : 'text-blue-600 dark:text-blue-400'
                            }`}
                            >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                        ) : null}
                        </>
                    )}
                    </Combobox.Option>
                ))
                )}
            </Combobox.Options>
            </div>
        </Combobox>
      </div>
    </div>
  );
}
