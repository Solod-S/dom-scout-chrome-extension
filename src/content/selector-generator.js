import { filterSemanticClasses, isDynamicClass, analyzeSelectorQuality } from './selector-analyzer.js';

/**
 * Validate CSS selector and count matches
 */
export function testCSSSelector(selector, targetEl = null, root = document) {
  try {
    const matchedNodes = Array.from(root.querySelectorAll(selector));
    const matchCount = matchedNodes.length;
    const containsSelectedElement = targetEl ? matchedNodes.includes(targetEl) : true;
    return {
      valid: true,
      matchCount,
      containsSelectedElement,
      elements: matchedNodes,
      error: null
    };
  } catch (err) {
    return {
      valid: false,
      matchCount: 0,
      containsSelectedElement: false,
      elements: [],
      error: err.message
    };
  }
}

/**
 * Validate XPath and count matches
 */
export function testXPath(xpath, targetEl = null, root = document) {
  try {
    const result = document.evaluate(
      xpath,
      root,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    const elements = [];
    for (let i = 0; i < result.snapshotLength; i++) {
      elements.push(result.snapshotItem(i));
    }
    const matchCount = elements.length;
    const containsSelectedElement = targetEl ? elements.includes(targetEl) : true;
    return {
      valid: true,
      matchCount,
      containsSelectedElement,
      elements,
      error: null
    };
  } catch (err) {
    return {
      valid: false,
      matchCount: 0,
      containsSelectedElement: false,
      elements: [],
      error: err.message
    };
  }
}

/**
 * Generate XPath for a given DOM element
 */
export function generateXPath(element) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) return '';

  const tag = element.tagName.toLowerCase();

  // If stable ID
  if (element.id && !isDynamicClass(element.id) && !/\d{5,}/.test(element.id)) {
    return `//${tag}[@id='${element.id}']`;
  }

  // Look for semantic classes
  const classes = element.className && typeof element.className === 'string'
    ? element.className.trim().split(/\s+/).filter((c) => !isDynamicClass(c))
    : [];

  if (classes.length > 0) {
    // Check if ancestor has a semantic container
    let parent = element.parentElement;
    let parentClause = '';
    while (parent && parent !== document.body) {
      const pClasses = parent.className && typeof parent.className === 'string'
        ? parent.className.trim().split(/\s+/).filter((c) => !isDynamicClass(c))
        : [];
      if (pClasses.length > 0) {
        parentClause = `//${parent.tagName.toLowerCase()}[contains(@class,'${pClasses[0]}')]`;
        break;
      }
      parent = parent.parentElement;
    }

    if (parentClause) {
      return `${parentClause}//${tag}[contains(@class,'${classes[0]}')]`;
    }
    return `//${tag}[contains(@class,'${classes[0]}')]`;
  }

  return `//${tag}`;
}

/**
 * Generate selector candidates for a selected element
 */
export function generateSelectorCandidates(element) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) return [];

  const tag = element.tagName.toLowerCase();
  const rawClasses = element.className && typeof element.className === 'string'
    ? element.className.trim().split(/\s+/).filter(Boolean)
    : [];
  const semanticClasses = filterSemanticClasses(rawClasses);
  const candidatesMap = new Map();

  const addCandidate = (sel, type = 'css') => {
    if (!sel || candidatesMap.has(sel)) return;
    try {
      const test = type === 'xpath'
        ? testXPath(sel, element)
        : testCSSSelector(sel, element);

      if (test.valid && test.matchCount > 0) {
        const quality = analyzeSelectorQuality({
          selector: sel,
          matchCount: test.matchCount,
          containsSelectedElement: test.containsSelectedElement,
          elementTag: tag,
          isXPath: type === 'xpath'
        });

        candidatesMap.set(sel, {
          selector: sel,
          type,
          matchCount: test.matchCount,
          containsSelectedElement: test.containsSelectedElement,
          score: quality.score,
          quality: quality.quality,
          reasons: quality.reasons
        });
      }
    } catch (e) {
      // Ignore invalid candidates
    }
  };

  // 1. Stable ID
  if (element.id && !isDynamicClass(element.id)) {
    addCandidate(`#${element.id}`);
  }

  // 2. Data attributes
  const dataTestAttrs = ['data-testid', 'data-test', 'data-id', 'data-product-id', 'data-article-id'];
  for (const attr of dataTestAttrs) {
    const val = element.getAttribute(attr);
    if (val) {
      addCandidate(`[${attr}="${val}"]`);
      addCandidate(`${tag}[${attr}="${val}"]`);
    }
  }

  // 3. Itemprop
  const itemprop = element.getAttribute('itemprop');
  if (itemprop) {
    addCandidate(`[itemprop="${itemprop}"]`);
    addCandidate(`${tag}[itemprop="${itemprop}"]`);
  }

  // 4. Semantic class directly on element
  if (semanticClasses.length > 0) {
    const mainClass = semanticClasses[0];
    addCandidate(`.${mainClass}`);
    addCandidate(`${tag}.${mainClass}`);

    if (semanticClasses.length > 1) {
      addCandidate(`.${semanticClasses.slice(0, 2).join('.')}`);
    }
  }

  // 5. Ancestor + Child combinations
  let ancestor = element.parentElement;
  let depth = 0;
  while (ancestor && ancestor !== document.body && depth < 3) {
    depth++;
    const aClasses = ancestor.className && typeof ancestor.className === 'string'
      ? filterSemanticClasses(ancestor.className.trim().split(/\s+/).filter(Boolean))
      : [];
    const aTag = ancestor.tagName.toLowerCase();

    if (ancestor.id && !isDynamicClass(ancestor.id)) {
      if (semanticClasses.length > 0) {
        addCandidate(`#${ancestor.id} .${semanticClasses[0]}`);
      } else {
        addCandidate(`#${ancestor.id} ${tag}`);
      }
    }

    if (aClasses.length > 0) {
      const aClass = aClasses[0];
      if (semanticClasses.length > 0) {
        addCandidate(`.${aClass} .${semanticClasses[0]}`);
        addCandidate(`${aTag}.${aClass} ${tag}.${semanticClasses[0]}`);
      } else {
        addCandidate(`${aTag}.${aClass} > ${tag}`);
        addCandidate(`.${aClass} ${tag}`);
      }
    } else if (['article', 'section', 'main', 'header', 'footer', 'nav'].includes(aTag)) {
      if (semanticClasses.length > 0) {
        addCandidate(`${aTag} .${semanticClasses[0]}`);
      } else {
        addCandidate(`${aTag} > ${tag}`);
      }
    }

    ancestor = ancestor.parentElement;
  }

  // 6. Name attribute (e.g. form inputs)
  const nameAttr = element.getAttribute('name');
  if (nameAttr) {
    addCandidate(`${tag}[name="${nameAttr}"]`);
  }

  // 7. XPath candidate
  const xpath = generateXPath(element);
  if (xpath) {
    addCandidate(xpath, 'xpath');
  }

  // Fallback: tag name
  if (candidatesMap.size === 0) {
    addCandidate(tag);
  }

  // Sort candidates by score descending
  const sorted = Array.from(candidatesMap.values()).sort((a, b) => b.score - a.score);

  return sorted;
}
