import { describe, it, expect } from 'vitest';
import {
  getSettings,
  saveSettings,
  getProjects,
  saveProject,
  deleteProject,
  getRecentSelectors,
  addRecentSelector,
  clearRecentSelectors
} from '../../src/shared/storage/index.js';

describe('Storage Manager & Schema', () => {
  it('loads default settings and updates them', async () => {
    const settings = await getSettings();
    expect(settings).toHaveProperty('language');
    expect(settings).toHaveProperty('autoHighlight');

    const updated = await saveSettings({ autoHighlight: false });
    expect(updated.autoHighlight).toBe(false);

    const reloaded = await getSettings();
    expect(reloaded.autoHighlight).toBe(false);
  });

  it('saves, retrieves, and deletes domain projects', async () => {
    const domain = 'test-shop.com';
    const project = {
      id: 'proj_123',
      name: 'Product Catalog',
      collectionSelector: '.product-card',
      fields: [{ id: 'f1', name: 'title', selector: '.title' }]
    };

    await saveProject(domain, project);
    const domainProjects = await getProjects(domain);
    expect(domainProjects.length).toBe(1);
    expect(domainProjects[0].name).toBe('Product Catalog');
    expect(domainProjects[0].collectionSelector).toBe('.product-card');

    await deleteProject(domain, 'proj_123');
    const remaining = await getProjects(domain);
    expect(remaining.length).toBe(0);
  });

  it('manages recent selectors with max limit and ordering', async () => {
    await clearRecentSelectors();
    let recents = await getRecentSelectors();
    expect(recents).toEqual([]);

    await addRecentSelector('article.news-card', 'Collection');
    await addRecentSelector('.article-title', 'Field');

    recents = await getRecentSelectors();
    expect(recents.length).toBe(2);
    expect(recents[0].selector).toBe('.article-title'); // most recent first
    expect(recents[1].selector).toBe('article.news-card');

    await clearRecentSelectors();
    recents = await getRecentSelectors();
    expect(recents).toEqual([]);
  });
});
