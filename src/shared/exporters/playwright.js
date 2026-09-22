export function generatePlaywright({ collectionSelector, fields }) {
  const sel = collectionSelector || 'article';

  const fieldLines = (fields || []).map((f) => {
    const fSel = f.selector ? JSON.stringify(f.selector) : '""';
    const type = f.extractType || 'text';

    if (type === 'href') {
      return `    ${f.name}: item.querySelector(${fSel})?.href ?? null,`;
    }
    if (type === 'src') {
      return `    ${f.name}: item.querySelector(${fSel})?.src ?? null,`;
    }
    if (type === 'attribute') {
      const attr = f.attribute ? JSON.stringify(f.attribute) : '"value"';
      return `    ${f.name}: item.querySelector(${fSel})?.getAttribute(${attr}) ?? null,`;
    }
    if (type === 'html') {
      return `    ${f.name}: item.querySelector(${fSel})?.innerHTML?.trim() ?? null,`;
    }
    return `    ${f.name}: item.querySelector(${fSel})?.textContent?.trim() ?? null,`;
  });

  return `// Playwright (Node.js)
const items = await page.locator(${JSON.stringify(sel)}).evaluateAll(
  (elements) =>
    elements.map((item) => ({
${fieldLines.join('\n')}
    }))
);

console.log(items);`;
}
