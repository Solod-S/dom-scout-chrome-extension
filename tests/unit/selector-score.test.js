import { describe, it, expect } from 'vitest';
import { isDynamicClass, filterSemanticClasses, analyzeSelectorQuality } from '../../src/content/selector-analyzer.js';

describe('Selector Analyzer & Quality Scorer', () => {
  describe('isDynamicClass heuristic', () => {
    it('detects Emotion / CSS-in-JS hashed classes', () => {
      expect(isDynamicClass('css-1xabc92')).toBe(true);
      expect(isDynamicClass('css-987654')).toBe(true);
    });

    it('detects Styled Components generated classes', () => {
      expect(isDynamicClass('sc-bdfBwQ')).toBe(true);
      expect(isDynamicClass('sc-abc1234')).toBe(true);
    });

    it('detects Material UI JSS classes', () => {
      expect(isDynamicClass('jss128')).toBe(true);
      expect(isDynamicClass('jss42')).toBe(true);
    });

    it('detects generic underscore-prefixed hashes', () => {
      expect(isDynamicClass('_3FHD92')).toBe(true);
    });

    it('identifies clean semantic classes as stable', () => {
      expect(isDynamicClass('news-card')).toBe(false);
      expect(isDynamicClass('article-title')).toBe(false);
      expect(isDynamicClass('product-image')).toBe(false);
      expect(isDynamicClass('btn-primary')).toBe(false);
    });
  });

  describe('filterSemanticClasses', () => {
    it('filters out dynamic and layout utility classes', () => {
      const raw = ['css-1xabc92', 'news-card', 'flex', 'hidden', 'article-title'];
      const filtered = filterSemanticClasses(raw);
      expect(filtered).toEqual(['news-card', 'article-title']);
    });
  });

  describe('analyzeSelectorQuality', () => {
    it('rates semantic class selector as Stable or Good', () => {
      const result = analyzeSelectorQuality({
        selector: 'article.news-card',
        matchCount: 20,
        containsSelectedElement: true,
        elementTag: 'article'
      });
      expect(result.score).toBeGreaterThanOrEqual(70);
      expect(['stable', 'good']).toContain(result.quality);
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    it('heavily penalizes dynamic classes and nth-child', () => {
      const result = analyzeSelectorQuality({
        selector: 'div.css-1xabc92 > div:nth-child(3)',
        matchCount: 1,
        containsSelectedElement: true,
        elementTag: 'div'
      });
      expect(result.score).toBeLessThan(50);
      expect(['fragile', 'veryFragile']).toContain(result.quality);
      expect(result.reasons.some((r) => r.type === 'negative')).toBe(true);
    });

    it('gives score 0 when 0 matches on page', () => {
      const result = analyzeSelectorQuality({
        selector: '.non-existent-element',
        matchCount: 0,
        containsSelectedElement: false
      });
      expect(result.score).toBe(0);
      expect(result.quality).toBe('veryFragile');
    });
  });
});
