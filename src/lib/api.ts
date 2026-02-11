import { contentfulPreviewClient } from './contentful';
import { HymnEntry, HymnFields } from '@/types/hymn';
import { Entry } from 'contentful';

export async function getHymns(
  limit = 100, 
  skip = 0, 
  query?: string, 
  categoryId?: string
): Promise<HymnEntry[]> {
  const queryParams: any = {
    content_type: 'hymn',
    limit,
    skip,
    order: ['fields.hymnNumber'] as any,
  };

  if (query) {
    const trimmedQuery = query.trim();
    // Check if the query is a specific number (e.g. "5", "120")
    if (/^\d+$/.test(trimmedQuery)) {
      queryParams['fields.hymnNumber'] = parseInt(trimmedQuery, 10);
    } else {
      // Otherwise perform full-text search
      queryParams['query'] = trimmedQuery;
    }
  }

  if (categoryId) {
    queryParams['fields.category.sys.id'] = categoryId;
  }

  const response = await contentfulPreviewClient.getEntries<HymnFields>(queryParams);
  return response.items as unknown as HymnEntry[];
}

import { HymnCategoryFields } from '@/types/hymn';

export async function getCategories(): Promise<Entry<HymnCategoryFields>[]> {
  const response = await contentfulPreviewClient.getEntries<HymnCategoryFields>({
    content_type: 'hymnCategory',
    order: ['fields.english'] as any,
  });
  return response.items;
}

export async function getHymnBySlug(slug: string): Promise<HymnEntry | null> {
  const response = await contentfulPreviewClient.getEntries<HymnFields>({
    content_type: 'hymn',
    'fields.slug': slug,
    limit: 1,
    include: 2,
  } as any);

  return (response.items[0] as unknown as HymnEntry) || null;
}
