'use client';

import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-2">
        <li>
          <div>
            <Link href="/" className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300">
              <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="sr-only">Home</span>
            </Link>
          </div>
        </li>
        {items.map((item, index) => (
          <li key={item.label}>
            <div className="flex items-center">
              <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-300 dark:text-gray-600" aria-hidden="true" />
              {item.href ? (
                <Link
                  href={item.href}
                  className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200" aria-current="page">
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
