const contentful = require('contentful');
require('dotenv').config({ path: '.env.local' });

const client = contentful.createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_PREVIEW_TOKEN, // Use preview to see draft content
  host: 'preview.contentful.com',
});

async function fetchEntry() {
  try {
    const entries = await client.getEntries({
      content_type: 'hymn',
      limit: 1,
    });

    if (entries.items.length > 0) {
      console.log('Fetched Hymn Entry Fields:');
      console.log(JSON.stringify(entries.items[0].fields, null, 2));
    } else {
      console.log('No hymns found.');
    }
  } catch (error) {
    console.error('Error fetching entry:', error);
  }
}

fetchEntry();
