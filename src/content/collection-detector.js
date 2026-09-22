import { filterSemanticClasses, isDynamicClass } from './selector-analyzer.js';
import { testCSSSelector } from './selector-generator.js';

/**
 * Detect repeated collection containers from a selected child element
 */
export function detectCollectionCandidates(element) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) return [];

  const candidates = [];
  let current = element.parentElement;
  let depth = 0;

  while (current && current !== document.body && depth < 6) {
    depth++;
    const tag = current.tagName.toLowerCase();
    const rawClasses = current.className && typeof current.className === 'string'
      ? current.className.trim().split(/\s+/).filter(Boolean)
      : [];
    const semanticClasses = filterSemanticClasses(rawClasses);

    // Build potential container selectors
    const testSelectors = [];

    if (semanticClasses.length > 0) {
      testSelectors.push(`.${semanticClasses[0]}`);
      testSelectors.push(`${tag}.${semanticClasses[0]}`);
    }

    if (['article', 'li', 'tr'].includes(tag)) {
      testSelectors.push(tag);
      if (current.parentElement && current.parentElement.className) {
        const pClasses = filterSemanticClasses(
          current.parentElement.className.trim().split(/\s+/).filter(Boolean)
        );
        if (pClasses.length > 0) {
          testSelectors.push(`.${pClasses[0]} > ${tag}`);
        }
      }
    }

    // Evaluate each selector
    for (const sel of testSelectors) {
      const test = testCSSSelector(sel, current);
      if (test.valid && test.matchCount >= 2) {
        // Compute ranking score for collection container
        let score = 50;

        // Semantic tag boost
        if (['article', 'li', 'tr', 'figure'].includes(tag)) score += 20;

        // Container-like naming boost (card, item, product, row, article, post, entry)
        if (/card|item|product|row|article|post|entry|result|story/i.test(sel)) {
          score += 25;
        }

        // Penalty for generic tags without classes
        if (sel === 'div' || sel === 'span') score -= 40;

        // Reasonable count range (e.g. 3 to 100 is great for scrapers)
        if (test.matchCount >= 3 && test.matchCount <= 200) {
          score += 15;
        }

        candidates.push({
          selector: sel,
          matchCount: test.matchCount,
          score,
          sampleElement: current
        });
      }
    }

    current = current.parentElement;
  }

  // Deduplicate by selector and sort by score descending
  const unique = new Map();
  for (const c of candidates) {
    if (!unique.has(c.selector) || unique.get(c.selector).score < c.score) {
      unique.set(c.selector, c);
    }
  }

  return Array.from(unique.values()).sort((a, b) => b.score - a.score);
}

/**
 * Auto-detect fields within a collection item element
 */
export function autoDetectFields(collectionSelector) {
  const items = Array.from(document.querySelectorAll(collectionSelector));
  if (items.length === 0) return [];

  const sample = items[0];
  const fields = [];

  const addField = (name, selector, extractType = 'text', attribute = '') => {
    if (fields.some((f) => f.name === name)) return;
    try {
      const match = sample.querySelector(selector);
      if (match) {
        fields.push({
          id: `field_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name,
          selector,
          extractType,
          attribute,
          transform: extractType === 'href' ? 'absoluteUrl' : 'trim'
        });
      }
    } catch (e) {}
  };

  // 1. Title / Headline
  const titleSelectors = [
    'h1 a', 'h2 a', 'h3 a',
    '.product-title', '.article-title', '.title', '.name',
    'h1', 'h2', 'h3', 'h4',
    '[class*="title"]', '[class*="headline"]'
  ];
  for (const sel of titleSelectors) {
    if (sample.querySelector(sel)) {
      addField('title', sel, 'text');
      break;
    }
  }

  // 2. URL
  const linkSelectors = [
    'h2 a', 'h1 a', 'h3 a',
    'a.title', '.product-title a', '.article-title a',
    'a[href]:not([href^="#"])', 'a'
  ];
  for (const sel of linkSelectors) {
    const a = sample.querySelector(sel);
    if (a && a.getAttribute('href')) {
      addField('url', sel, 'href');
      break;
    }
  }

  // 3. Price
  const priceSelectors = [
    '.price .current', '.price', '[class*="price"]:not([class*="old"])',
    '[itemprop="price"]', '.amount'
  ];
  for (const sel of priceSelectors) {
    if (sample.querySelector(sel)) {
      addField('price', sel, 'text');
      break;
    }
  }

  // 4. Old Price
  const oldPriceSelectors = [
    '.price .old', '.price-old', 'del', 's', '.old-price', '[class*="old-price"]'
  ];
  for (const sel of oldPriceSelectors) {
    if (sample.querySelector(sel)) {
      addField('oldPrice', sel, 'text');
      break;
    }
  }

  // 5. Date
  const dateSelectors = [
    'time', '[datetime]', '.date', '.published', '[class*="date"]', '[class*="time"]'
  ];
  for (const sel of dateSelectors) {
    const el = sample.querySelector(sel);
    if (el) {
      if (el.hasAttribute('datetime')) {
        addField('date', sel, 'attribute', 'datetime');
      } else {
        addField('date', sel, 'text');
      }
      break;
    }
  }

  // 6. Image
  const imgSelectors = [
    'img', '.image img', '.thumb img', '[class*="image"] img'
  ];
  for (const sel of imgSelectors) {
    const img = sample.querySelector(sel);
    if (img) {
      // Check lazy loading attributes
      if (img.hasAttribute('data-src')) {
        addField('image', sel, 'src', 'data-src');
      } else if (img.hasAttribute('data-original')) {
        addField('image', sel, 'src', 'data-original');
      } else {
        addField('image', sel, 'src', 'src');
      }
      break;
    }
  }

  // 7. SKU
  const skuSelectors = ['[data-sku]', '.sku', '[itemprop="sku"]'];
  for (const sel of skuSelectors) {
    const el = sample.querySelector(sel);
    if (el) {
      if (el.hasAttribute('data-sku')) {
        addField('sku', sel, 'attribute', 'data-sku');
      } else {
        addField('sku', sel, 'text');
      }
      break;
    }
  }

  return fields;
}
