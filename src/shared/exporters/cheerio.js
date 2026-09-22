export function generateCheerio({ collectionSelector, fields }) {
  const sel = collectionSelector || 'article';

  const fieldLines = (fields || []).map((f) => {
    const fSel = f.selector ? JSON.stringify(f.selector) : '""';
    const type = f.extractType || 'text';

    if (type === 'href') {
      return `    const ${f.name} = $(el).find(${fSel}).first().attr('href') || null;`;
    }
    if (type === 'src') {
      return `    const ${f.name} = $(el).find(${fSel}).first().attr('src') || $(el).find(${fSel}).first().attr('data-src') || null;`;
    }
    if (type === 'attribute') {
      const attr = f.attribute ? JSON.stringify(f.attribute) : '"value"';
      return `    const ${f.name} = $(el).find(${fSel}).first().attr(${attr}) || null;`;
    }
    if (type === 'html') {
      return `    const ${f.name} = $(el).find(${fSel}).first().html()?.trim() || null;`;
    }
    return `    const ${f.name} = $(el).find(${fSel}).first().text().trim() || null;`;
  });

  const objFields = (fields || []).map((f) => f.name).join(', ');

  return `// Cheerio (Node.js)
const cheerio = require('cheerio');

async function scrape(html) {
  const $ = cheerio.load(html);
  const items = [];

  $(${JSON.stringify(sel)}).each((_, el) => {
${fieldLines.join('\n')}

    items.push({ ${objFields} });
  });

  return items;
}`;
}
