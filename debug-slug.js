const contentful = require('contentful');
require('dotenv').config({ path: '.env.local' });

const client = contentful.createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_PREVIEW_TOKEN,
  host: 'preview.contentful.com',
});

async function testSlugQuery() {
  const targetSlug = 'jerih-mo-yah-mah'; // Slug observed in browser test
  console.log(`Attempting to fetch hymn with slug: "${targetSlug}"`);

  try {
    const response = await client.getEntries({
      content_type: 'hymn',
      'fields.slug': targetSlug,
      limit: 1,
    });

    if (response.items.length === 0) {
      console.log('No entries found for this slug.');
    } else {
      const entry = response.items[0];
      console.log('Entry found!');
      console.log('Title:', entry.fields.title);
      console.log('Slug:', entry.fields.slug);
      console.log('ID:', entry.sys.id);
      
      if (entry.fields.slug !== targetSlug) {
        console.error('CRITICAL: Returned entry slug does NOT match requested slug!');
      } else {
        console.log('SUCCESS: Returned entry matches requested slug.');
      }
    }
  } catch (error) {
    console.error('Error executing query:', error);
  }
}

testSlugQuery();
