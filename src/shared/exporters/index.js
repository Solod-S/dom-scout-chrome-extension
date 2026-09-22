import { generateConfigJson } from './config-json.js';
import { generateVanillaJs } from './vanilla-js.js';
import { generateCheerio } from './cheerio.js';
import { generatePuppeteer } from './puppeteer.js';
import { generatePlaywright } from './playwright.js';

export const EXPORT_FORMATS = {
  JSON: 'JSON',
  VANILLA: 'Vanilla JS',
  CHEERIO: 'Cheerio',
  PUPPETEER: 'Puppeteer',
  PLAYWRIGHT: 'Playwright'
};

export function generateScraperCode(format, params) {
  switch (format) {
    case EXPORT_FORMATS.JSON:
      return generateConfigJson(params);
    case EXPORT_FORMATS.VANILLA:
      return generateVanillaJs(params);
    case EXPORT_FORMATS.CHEERIO:
      return generateCheerio(params);
    case EXPORT_FORMATS.PUPPETEER:
      return generatePuppeteer(params);
    case EXPORT_FORMATS.PLAYWRIGHT:
      return generatePlaywright(params);
    default:
      return generateConfigJson(params);
  }
}

export {
  generateConfigJson,
  generateVanillaJs,
  generateCheerio,
  generatePuppeteer,
  generatePlaywright
};
