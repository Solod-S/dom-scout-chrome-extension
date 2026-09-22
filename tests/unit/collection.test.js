import { describe, it, expect } from 'vitest';
import { extractFieldValue } from '../../src/content/extraction.js';

describe('Collection & Field Extraction Helpers', () => {
  // Mock element structure
  const createMockElement = () => {
    return {
      querySelector: (sel) => {
        if (sel === '.title') {
          return {
            textContent: '  Sample Article Title  ',
            getAttribute: () => null
          };
        }
        if (sel === 'a.link') {
          return {
            getAttribute: (attr) => (attr === 'href' ? '/news/sample-post' : null)
          };
        }
        if (sel === 'img.lazy') {
          return {
            getAttribute: (attr) => {
              if (attr === 'data-src') return 'https://example.com/images/full.jpg';
              if (attr === 'src') return 'placeholder.jpg';
              return null;
            }
          };
        }
        if (sel === 'time') {
          return {
            getAttribute: (attr) => (attr === 'datetime' ? '2026-09-19T10:00:00Z' : null),
            textContent: '2 hours ago'
          };
        }
        return null;
      }
    };
  };

  it('extracts and trims text content correctly', () => {
    const el = createMockElement();
    const field = { name: 'title', selector: '.title', extractType: 'text' };
    const val = extractFieldValue(el, field);
    expect(val).toBe('Sample Article Title');
  });

  it('transforms relative URL to absolute URL for href type', () => {
    const el = createMockElement();
    const field = { name: 'url', selector: 'a.link', extractType: 'href', transform: 'absoluteUrl' };
    const val = extractFieldValue(el, field, 'https://example.com/catalog/');
    expect(val).toBe('https://example.com/news/sample-post');
  });

  it('extracts lazy image url preferring data-src', () => {
    const el = createMockElement();
    const field = { name: 'image', selector: 'img.lazy', extractType: 'src' };
    const val = extractFieldValue(el, field, 'https://example.com');
    expect(val).toBe('https://example.com/images/full.jpg');
  });

  it('extracts custom attribute datetime', () => {
    const el = createMockElement();
    const field = { name: 'date', selector: 'time', extractType: 'attribute', attribute: 'datetime' };
    const val = extractFieldValue(el, field);
    expect(val).toBe('2026-09-19T10:00:00Z');
  });

  it('returns null when selector is not found', () => {
    const el = createMockElement();
    const field = { name: 'nonexistent', selector: '.missing', extractType: 'text' };
    const val = extractFieldValue(el, field);
    expect(val).toBeNull();
  });
});
