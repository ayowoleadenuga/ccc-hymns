import { createClient } from 'contentful';

export const contentfulClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
});

export const contentfulPreviewClient = createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_PREVIEW_TOKEN!,
    host: 'preview.contentful.com',
});
