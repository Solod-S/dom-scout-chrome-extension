# Changelog

All notable changes to DOM Scout will be documented in this file.

## [1.0.0] - 2026-09-19

### Initial Release
- **Chrome Extension Manifest V3** architecture.
- **Chrome Side Panel** user interface built with React 18, Vite, and custom developer design tokens.
- **Content Script Inspector**:
  - Isolated Shadow DOM overlay with zero page CSS disruption.
  - Hover outline with floating dimension badge (`W × H`) and tag name.
  - Non-intrusive element picking preventing default page navigation.
  - Keyboard shortcut support (`Esc` to cancel, `⌥⇧I` / `⌘⇧I` to inspect).
- **Selector Engine & Quality Analyzer**:
  - Automated generation of Recommended, Alternative, Strict, and XPath selectors.
  - Real-time DOM validation and match counts.
  - Quality score calculation (0–100) with classification (`Stable`, `Good`, `Fragile`, `Very fragile`).
  - Heuristic detection of CSS-in-JS, styled-components, and hashed dynamic classes.
  - Transparent "Why this selector?" rationale breakdown.
  - Live Selector Tester for instant CSS and XPath verification.
- **Collection Detector & Data Preview**:
  - Ancestor pattern matching to detect repeated container elements.
  - Relative field selectors scoped to individual collection items.
  - Auto-detection of common fields (`title`, `url`, `price`, `oldPrice`, `date`, `image`, `sku`).
  - Data Preview table with pagination and horizontal scrolling.
  - Field coverage percentage and duplicate value detection.
  - Support for lazy-loaded image extraction (`data-src`, `data-original`).
- **Page Analyzer**:
  - Metadata inspection (Title, Description, Canonical URL).
  - Open Graph and Twitter Card tags.
  - JSON-LD structured data parser with interactive expandable tree view.
  - Heuristic detection of news article and e-commerce product entities.
- **Multi-Format Code Exporters**:
  - DOM Scout Config JSON.
  - Vanilla JavaScript (`document.querySelectorAll`).
  - Cheerio (`$(...).each(...)`).
  - Puppeteer (`page.$$eval(...)`).
  - Playwright (`page.locator(...).evaluateAll(...)`).
  - One-click clipboard copy and config file download.
- **Storage & Settings**:
  - Versioned storage schema (`schemaVersion: 1`).
  - Domain-scoped project saving and management.
  - Recent selectors history tracking with timestamps.
  - Multilingual support for English, Russian, and Ukrainian with auto-detection.
- **Test Suite**:
  - Vitest unit tests for scoring, dynamic class heuristics, URL normalization, extraction helpers, and storage.
  - HTML test fixtures (`news-list.html`, `product-list.html`, `dynamic-classes.html`).
