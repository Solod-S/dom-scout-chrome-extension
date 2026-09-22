/**
 * Selector Analyzer and Quality Scorer
 */

// Heuristic pattern to detect generated, hashed, or CSS-in-JS classes
const DYNAMIC_CLASS_PATTERNS = [
  /^css-[0-9a-zA-Z]{5,}$/i,                // Emotion / styled-components: css-1xabc92
  /^sc-[a-zA-Z0-9]{6,}$/i,                 // Styled Components: sc-bdfBwQ
  /^jss\d+$/i,                             // Material UI JSS: jss128
  /^_[0-9a-zA-Z]{5,}$/,                    // Generic hashed: _3FHD92
  /[a-zA-Z0-9_-]+__[a-zA-Z0-9_-]+--[0-9a-zA-Z]{5,}/, // CSS modules with hash
  /^[a-zA-Z0-9]{8,}$/                      // Long random hash without separator
];

/**
 * Checks if a class name looks dynamically generated or unstable
 */
export function isDynamicClass(className) {
  if (!className || typeof className !== 'string') return false;
  return DYNAMIC_CLASS_PATTERNS.some((pattern) => pattern.test(className));
}

/**
 * Filter out likely dynamic or utility classes to find semantic ones
 */
export function filterSemanticClasses(classes) {
  if (!Array.isArray(classes)) return [];
  return classes.filter((cls) => {
    if (isDynamicClass(cls)) return false;
    // Filter out common pure layout utility clutter if semantic exists
    if (['flex', 'block', 'hidden', 'relative', 'absolute'].includes(cls.toLowerCase())) {
      return false;
    }
    return true;
  });
}

/**
 * Compute Selector Quality Score (0 to 100) and stability breakdown
 */
export function analyzeSelectorQuality({
  selector,
  matchCount = 1,
  containsSelectedElement = true,
  elementTag = '',
  isXPath = false
}) {
  if (!selector) {
    return {
      score: 0,
      quality: 'veryFragile',
      reasons: [{ type: 'negative', text: 'No selector provided' }]
    };
  }

  let score = 70; // Base score
  const reasons = [];

  if (isXPath) {
    score = 65;
    reasons.push({ type: 'neutral', key: 'xpathSelector', text: 'XPath selector' });
    return {
      score,
      quality: 'good',
      reasons
    };
  }

  // 1. Check for stable IDs
  if (selector.startsWith('#') && !selector.includes(' ')) {
    const id = selector.slice(1);
    if (!isDynamicClass(id) && !/\d{5,}/.test(id)) {
      score += 25;
      reasons.push({ type: 'positive', key: 'usesStableId', text: 'Uses unique stable ID' });
    } else {
      score -= 20;
      reasons.push({ type: 'negative', key: 'idContainsDynamic', text: 'ID contains dynamic or generated tokens' });
    }
  }

  // 2. Check for data attributes (e.g. [data-testid], [data-id], [itemprop])
  if (/\[data-(testid|test|id|product-id|article-id)/i.test(selector)) {
    score += 20;
    reasons.push({ type: 'positive', key: 'usesDataAttr', text: 'Uses reliable data-* test/product attribute' });
  } else if (/\[itemprop/i.test(selector)) {
    score += 15;
    reasons.push({ type: 'positive', key: 'usesItemprop', text: 'Uses structured schema itemprop attribute' });
  }

  // 3. Check for dynamic / generated classes
  const classMatches = selector.match(/\.([a-zA-Z0-9_-]+)/g) || [];
  const classNames = classMatches.map((c) => c.slice(1));
  const hasDynamicClass = classNames.some(isDynamicClass);

  if (hasDynamicClass) {
    score -= 35;
    reasons.push({ type: 'negative', key: 'dynamicClass', text: 'Depends on generated-looking CSS class' });
  } else if (classNames.length > 0) {
    score += 10;
    reasons.push({
      type: 'positive',
      key: 'usesSemanticClass',
      params: { name: classNames[0] },
      text: `Uses semantic class (.${classNames[0]})`
    });
  }

  // 4. Path length & DOM depth
  const parts = selector.split(/\s*[\s>+~]\s*/);
  if (parts.length === 1 && !selector.includes(':nth-')) {
    score += 10;
    reasons.push({ type: 'positive', key: 'shortPath', text: 'Short and clear path' });
  } else if (parts.length > 4) {
    score -= 20;
    reasons.push({ type: 'negative', key: 'deepPath', text: 'Deep DOM path with multiple ancestors' });
  }

  // 5. nth-child / nth-of-type penalties
  if (/:nth-child|:nth-of-type/.test(selector)) {
    score -= 30;
    reasons.push({ type: 'negative', key: 'nthChild', text: 'Relies on fragile nth-child positional indexing' });
  }

  // 6. Match count evaluation
  if (matchCount === 0) {
    score = 0;
    reasons.push({ type: 'negative', key: 'zeroMatches', text: '0 matches on page' });
  } else if (matchCount === 1) {
    score += 5;
    reasons.push({ type: 'positive', key: 'uniqueTarget', text: 'Targets unique element' });
  } else {
    reasons.push({
      type: 'positive',
      key: 'consistentMatches',
      params: { count: matchCount },
      text: `${matchCount} consistent matches`
    });
  }

  // 7. Verify it matches target element
  if (containsSelectedElement) {
    reasons.push({
      type: 'positive',
      key: 'rightElementType',
      params: { tag: elementTag || 'element' },
      text: `Targets the right element type (<${elementTag || 'element'}>)`
    });
  } else {
    score -= 40;
    reasons.push({ type: 'negative', key: 'notMatchingSelected', text: 'Does not match the selected element' });
  }

  // Clamp score 0 - 100
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  let quality = 'stable';
  if (finalScore < 40) {
    quality = 'veryFragile';
  } else if (finalScore < 65) {
    quality = 'fragile';
  } else if (finalScore < 80) {
    quality = 'good';
  }

  return {
    score: finalScore,
    quality,
    reasons: reasons.slice(0, 5)
  };
}
