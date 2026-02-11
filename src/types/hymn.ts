import { Entry, Asset, EntrySkeletonType } from 'contentful';
import { Document } from '@contentful/rich-text-types';

export interface HymnCategoryFields extends EntrySkeletonType {
  fields: {
    english: string;
    yoruba: string;
    french?: string;
    egun?: string;
  };
  contentTypeId: 'hymnCategory';
}

export interface HymnFields extends EntrySkeletonType {
  fields: {
    title: string;
    hymnNumber: number;
    slug: string;
    category: Entry<HymnCategoryFields>;
    description?: Document;
    englishLyrics?: Document;
    yorubaLyrics?: Document;
    frenchLyrics?: Document;
    egunLyrics?: Document;
    musicFile?: Asset; // PDF
    musicXmlFile?: Asset;
    midiFile?: Asset;
  };
  contentTypeId: 'hymn';
}

export type HymnEntry = Entry<HymnFields>;
