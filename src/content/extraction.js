/**
 * Extract field values from collection items
 */

export function extractFieldValue(
  itemEl,
  field,
  baseUrl = (typeof window !== 'undefined' && window.location ? window.location.href : 'http://localhost')
) {
  if (!itemEl || !field) return null;

  try {
    let target = itemEl;
    if (field.selector && field.selector !== '.' && field.selector !== '&') {
      target = itemEl.querySelector(field.selector);
    }

    if (!target) return null;

    let value = null;
    const type = field.extractType || 'text';

    if (type === 'text') {
      value = target.textContent ? target.textContent.trim().replace(/\s+/g, ' ') : null;
    } else if (type === 'html') {
      value = target.innerHTML ? target.innerHTML.trim() : null;
    } else if (type === 'href') {
      const rawHref = target.getAttribute('href');
      if (rawHref) {
        try {
          value = new URL(rawHref, baseUrl).href;
        } catch (e) {
          value = rawHref;
        }
      }
    } else if (type === 'src') {
      // Check lazy loading attributes first
      const rawSrc = target.getAttribute('data-src') ||
                     target.getAttribute('data-original') ||
                     target.getAttribute('data-lazy-src') ||
                     target.getAttribute('src');
      if (rawSrc) {
        try {
          value = new URL(rawSrc, baseUrl).href;
        } catch (e) {
          value = rawSrc;
        }
      }
    } else if (type === 'attribute') {
      const attrName = field.attribute || 'value';
      value = target.getAttribute(attrName);
    }

    // Transforms
    if (value && typeof value === 'string') {
      if (field.transform === 'absoluteUrl') {
        try {
          value = new URL(value, baseUrl).href;
        } catch (e) {}
      } else if (field.transform === 'trim') {
        value = value.trim();
      }
    }

    return value;
  } catch (err) {
    return null;
  }
}

/**
 * Extract full collection preview & coverage analysis
 */
export function extractCollectionPreview(collectionSelector, fields, maxRows = 25) {
  try {
    const items = Array.from(document.querySelectorAll(collectionSelector));
    const totalItems = items.length;

    if (totalItems === 0) {
      return {
        totalItems: 0,
        rows: [],
        coverage: {},
        duplicates: {}
      };
    }

    const rows = [];
    const coverage = {};
    const fieldValues = {};

    fields.forEach((f) => {
      coverage[f.name] = { found: 0, total: totalItems, percentage: 0 };
      fieldValues[f.name] = [];
    });

    const previewLimit = maxRows === 0 ? totalItems : Math.min(items.length, maxRows);

    items.forEach((item, index) => {
      const row = { _index: index + 1 };

      fields.forEach((field) => {
        const val = extractFieldValue(item, field);
        if (index < previewLimit) {
          row[field.name] = val;
        }

        if (val !== null && val !== undefined && val !== '') {
          coverage[field.name].found++;
          fieldValues[field.name].push(val);
        }
      });

      if (index < previewLimit) {
        rows.push(row);
      }
    });

    // Compute percentages & duplicate metrics
    const duplicates = {};
    fields.forEach((f) => {
      const cov = coverage[f.name];
      cov.percentage = totalItems > 0 ? Math.round((cov.found / totalItems) * 100) : 0;

      const vals = fieldValues[f.name];
      const uniqueVals = new Set(vals);
      duplicates[f.name] = {
        unique: uniqueVals.size,
        total: vals.length,
        duplicateCount: vals.length - uniqueVals.size
      };
    });

    return {
      totalItems,
      rows,
      coverage,
      duplicates
    };
  } catch (err) {
    return {
      error: err.message,
      totalItems: 0,
      rows: [],
      coverage: {},
      duplicates: {}
    };
  }
}
