/**
 * Page Analyzer: Scrapes metadata, Open Graph, JSON-LD, and page structure
 */

export function analyzePage() {
  const url = window.location.href;
  const canonicalEl = document.querySelector('link[rel="canonical"]');
  const canonicalUrl = canonicalEl ? canonicalEl.href : url;

  // 1. Meta information
  const metaDescEl = document.querySelector('meta[name="description"]');
  const metaDescription = metaDescEl ? metaDescEl.getAttribute('content') || '' : '';

  // Open Graph
  const openGraphTags = [];
  const ogElements = document.querySelectorAll('meta[property^="og:"]');
  ogElements.forEach((el) => {
    const prop = el.getAttribute('property');
    const content = el.getAttribute('content');
    if (prop && content) {
      openGraphTags.push({ property: prop, content });
    }
  });

  // Twitter Cards
  const twitterTags = [];
  const twitterElements = document.querySelectorAll('meta[name^="twitter:"]');
  twitterElements.forEach((el) => {
    const name = el.getAttribute('name');
    const content = el.getAttribute('content');
    if (name && content) {
      twitterTags.push({ name, content });
    }
  });

  // 2. Structured Data (JSON-LD)
  const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
  const structuredData = [];

  jsonLdScripts.forEach((script, idx) => {
    try {
      const parsed = JSON.parse(script.textContent);
      const items = Array.isArray(parsed) ? parsed : (parsed['@graph'] || [parsed]);

      items.forEach((item) => {
        if (item && item['@type']) {
          structuredData.push({
            id: `jsonld_${idx}_${Math.random().toString(36).slice(2, 6)}`,
            type: Array.isArray(item['@type']) ? item['@type'].join(', ') : item['@type'],
            data: item
          });
        }
      });
    } catch (e) {
      // Ignore malformed JSON-LD
    }
  });

  // 3. Detected Content (Article or Product heuristics)
  let headline = document.title;
  let publicationDate = '';
  let author = '';
  let articleBodyLength = 0;
  let mainImage = '';

  // Check JSON-LD first for article/product
  const articleSchema = structuredData.find((s) => /Article|NewsArticle/i.test(s.type));
  if (articleSchema && articleSchema.data) {
    headline = articleSchema.data.headline || headline;
    publicationDate = articleSchema.data.datePublished || '';
    if (typeof articleSchema.data.author === 'string') {
      author = articleSchema.data.author;
    } else if (articleSchema.data.author && articleSchema.data.author.name) {
      author = articleSchema.data.author.name;
    }
    if (articleSchema.data.image) {
      mainImage = typeof articleSchema.data.image === 'string'
        ? articleSchema.data.image
        : articleSchema.data.image.url || '';
    }
  }

  // Fallbacks from DOM if not in JSON-LD
  if (!headline) {
    const h1 = document.querySelector('h1');
    if (h1) headline = h1.textContent.trim();
  }

  if (!publicationDate) {
    const timeEl = document.querySelector('time[datetime], [itemprop="datePublished"]');
    if (timeEl) {
      publicationDate = timeEl.getAttribute('datetime') || timeEl.textContent.trim();
    }
  }

  if (!author) {
    const authorEl = document.querySelector('[itemprop="author"], [rel="author"], .author');
    if (authorEl) author = authorEl.textContent.trim();
  }

  if (!mainImage) {
    const ogImg = openGraphTags.find((t) => t.property === 'og:image');
    if (ogImg) {
      mainImage = ogImg.content;
    } else {
      const firstImg = document.querySelector('article img, main img, img');
      if (firstImg && firstImg.src) mainImage = firstImg.src;
    }
  }

  const articleEl = document.querySelector('article, main, .article-content, .post-content');
  if (articleEl) {
    articleBodyLength = articleEl.textContent ? articleEl.textContent.trim().length : 0;
  }

  return {
    page: {
      url,
      canonicalUrl,
      contentType: document.contentType || 'text/html',
      statusCode: 200,
      title: document.title
    },
    meta: {
      title: document.title,
      description: metaDescription,
      openGraph: openGraphTags,
      twitter: twitterTags
    },
    structuredData,
    detectedContent: {
      headline,
      publicationDate,
      author,
      articleBodyLength,
      mainImage
    }
  };
}
