import { describe, it, expect } from 'vitest';
import {
  generateConfigJson,
  generateVanillaJs,
  generateCheerio,
  generatePuppeteer,
  generatePlaywright
} from '../../src/shared/exporters/index.js';

describe('Scraper Code Exporters', () => {
  const mockParams = {
    domain: 'example.com',
    url: 'https://example.com/news',
    collectionSelector: 'article.news-card',
    fields: [
      { id: '1', name: 'title', selector: '.article-title', extractType: 'text' },
      { id: '2', name: 'url', selector: 'a.article-title', extractType: 'href', transform: 'absoluteUrl' },
      { id: '3', name: 'date', selector: 'time', extractType: 'attribute', attribute: 'datetime' }
    ]
  };

  it('generates valid Config JSON with collection and fields', () => {
    const jsonStr = generateConfigJson(mockParams);
    const parsed = JSON.parse(jsonStr);

    expect(parsed.domain).toBe('example.com');
    expect(parsed.collection.selector).toBe('article.news-card');
    expect(parsed.fields.title.selector).toBe('.article-title');
    expect(parsed.fields.url.extract).toBe('href');
    expect(parsed.fields.date.attribute).toBe('datetime');
  });

  it('generates correct Vanilla JS script with null checks and trimming', () => {
    const code = generateVanillaJs(mockParams);
    expect(code).toContain('document.querySelectorAll("article.news-card")');
    expect(code).toContain('item.querySelector(".article-title")?.textContent?.trim() ?? null');
    expect(code).toContain('item.querySelector("a.article-title")?.href ?? null');
    expect(code).toContain('item.querySelector("time")?.getAttribute("datetime") ?? null');
  });

  it('generates correct Cheerio script for Node.js', () => {
    const code = generateCheerio(mockParams);
    expect(code).toContain("require('cheerio')");
    expect(code).toContain('$("article.news-card").each');
    expect(code).toContain('$(el).find(".article-title").first().text().trim()');
    expect(code).toContain('$(el).find("a.article-title").first().attr(\'href\')');
  });

  it('generates correct Puppeteer script with page.$$eval', () => {
    const code = generatePuppeteer(mockParams);
    expect(code).toContain('await page.$$eval(');
    expect(code).toContain('"article.news-card"');
    expect(code).toContain('item.querySelector(".article-title")?.textContent?.trim() ?? null');
  });

  it('generates correct Playwright script with evaluateAll', () => {
    const code = generatePlaywright(mockParams);
    expect(code).toContain('await page.locator("article.news-card").evaluateAll(');
    expect(code).toContain('item.querySelector(".article-title")?.textContent?.trim() ?? null');
  });
});
