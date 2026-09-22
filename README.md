# DOM Scout

> **DOM Scout is a lightweight Chrome developer tool for inspecting page structures, generating and validating reliable selectors, detecting repeated collections, previewing extracted data, and exporting scraper-ready configurations and code.**

---

## 🚀 Overview

DOM Scout is a developer companion designed to streamline the preparatory phase of building web scrapers, data monitors, and automation bots (using Cheerio, Puppeteer, Playwright, or Vanilla JavaScript).

Instead of tediously navigating Elements in Chrome DevTools, copying fragile selectors, manually checking `document.querySelectorAll()`, and guessing collection boundaries, DOM Scout brings an all-in-one developer workspace into the **Chrome Side Panel**:

1. **Pick Element**: Point and click on any element with real-time dimensions and tag tooltips.
2. **Inspect & Validate Selectors**: Automatically generates recommended and alternative selectors, calculates stability scores (0–100), detects dynamic/hashed CSS classes, and validates match counts in the live DOM.
3. **Detect Collections**: Finds repeated parent container patterns (e.g., news cards, e-commerce product listings) and scopes fields relatively.
4. **Data Preview & Coverage**: Automatically suggests fields (`title`, `url`, `date`, `image`, `price`, `sku`), computes field coverage percentages, and identifies duplicate records.
5. **Page Analyzer**: Extracts metadata, Open Graph, Twitter Cards, and parses `<script type="application/ld+json">` into an interactive tree.
6. **Production Export**: One-click code generation for **Config JSON**, **Vanilla JS**, **Cheerio (Node.js)**, **Puppeteer**, and **Playwright**.

---

## 🛠 Tech Stack & Architecture

- **Manifest**: Chrome Extension Manifest V3
- **User Interface**: React 18, Vite, Lucide Icons, Modular CSS with custom design tokens
- **Language**: Pure JavaScript (ES Modules for Side Panel & Service Worker, IIFE for Content Script)
- **Localization**: Full runtime translation for **English (EN)**, **Русский (RU)**, and **Українська (UK)** with system language auto-detection
- **Storage**: Versioned local persistence via `chrome.storage.local` with fallback for non-extension environments
- **Testing**: Vitest for unit test suite

```text
dom-scout-chrome-extension/
├── public/
│   ├── icons/                    # Extension icons (16, 48, 128)
│   └── manifest.json             # Manifest V3 source
├── src/
│   ├── background/
│   │   └── service-worker.js     # Side panel registration & lifecycle
│   ├── content/
│   │   ├── index.js              # Content script message dispatcher
│   │   ├── inspector.js          # Hover inspection, selection, key handling
│   │   ├── highlighter.js        # Non-intrusive Shadow DOM overlay
│   │   ├── selector-generator.js # CSS & XPath candidate generation
│   │   ├── selector-analyzer.js  # Quality scoring (0-100) & dynamic class heuristics
│   │   ├── collection-detector.js# Ancestor repeated structures detection
│   │   ├── extraction.js         # Relative data extraction & coverage analysis
│   │   └── page-analyzer.js      # Metadata, OpenGraph & JSON-LD parser
│   ├── sidepanel/
│   │   ├── index.html            # Side panel HTML
│   │   ├── main.jsx              # React root mount
│   │   ├── App.jsx               # Application controller & state
│   │   ├── components/           # Reusable UI (Header, Tabs, Badge, Toast, ScoreMeter)
│   │   ├── features/             # InspectTab, CollectionTab, AnalyzeTab, ExportTab, SettingsModal
│   │   └── styles/               # Tokens, global layout, and feature stylesheets
│   └── shared/
│       ├── constants/            # Message types & extraction constants
│       ├── i18n/                 # Dictionaries (en, ru, uk) & translation helper
│       ├── storage/              # Versioned Chrome Storage wrapper
│       └── exporters/            # Code generators (JSON, Vanilla, Cheerio, Puppeteer, Playwright)
├── tests/
│   ├── fixtures/                 # HTML test fixtures (news-list.html, product-list.html, etc.)
│   └── unit/                     # Vitest unit test suite
├── scripts/
│   ├── build.js                  # Multi-entry build orchestrator
│   └── generate-icons.js         # Pure Node.js icon generator
├── package.json
└── vite.config.js
```

---

## 🔒 Permissions & Privacy

DOM Scout requests only the minimum permissions required for operation:

- `sidePanel`: Required to render the primary developer UI in Chrome's modern Side Panel.
- `activeTab`: Grants temporary access to inspect DOM elements on the active tab upon user activation.
- `scripting`: Enables safe programmatic injection of the content script when opening the side panel on previously opened pages.
- `storage`: Saves user preferences (language, preview rows limit) and user scraper projects locally in `chrome.storage.local`.

### Privacy Policy
DOM Scout analyzes page structures **strictly locally** inside your browser. No page content, scraped data, or browsing history is uploaded to any remote server or third-party service.

---

## 📦 Installation & Developer Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Google Chrome (or Chromium-based browser)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Solod-S/dom-scout-chrome-extension.git
cd dom-scout-chrome-extension
npm install
```

### 2. Build the Extension
```bash
npm run build
```
The compiled extension will be placed in the `dist/` directory.

### 3. Load Unpacked in Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** in the top right corner.
3. Click **Load unpacked** in the top left.
4. Select the `dist/` directory inside this repository.
5. Click the **DOM Scout** icon in the Chrome toolbar (or press `Alt + Shift + D` / `⌥ + ⇧ + D`) to open the Side Panel.

### 4. Running Unit Tests
```bash
npm run test
```

---

## 🧭 User Guide & Workflow

### 1. Inspecting Elements
- Click **Inspect element** (or press `⌥ + ⇧ + I`).
- Hover over any element on the page to view real-time outline and dimension badge (`tag.class W × H`).
- Click on the target element (page link navigation is prevented).
- Review **Recommended** and **Alternative** selectors with real-time DOM match counts.
- Inspect the **Selector quality score** (Stable, Good, Fragile, Very fragile) and read the **"Why this selector?"** rationale.

### 2. Working with Collections
- When selecting an item inside a card, DOM Scout automatically detects repeating parent containers (e.g. `article.news-card` with 20 items).
- Click **Use collection** to activate container scoping.
- Click **Auto-detect fields** to automatically locate title, url, price, date, or image selectors.
- Verify the **Data Preview** table and check the **Field coverage** indicator (e.g., detecting missing fields or duplicates).

### 3. Analyzing Page Metadata
- Switch to the **Analyze** tab to view page URL, canonical URL, Open Graph tags, and structured JSON-LD entities.
- Click on any JSON-LD entity (`NewsArticle`, `Product`, `BreadcrumbList`) to expand its structured tree and copy paths or raw JSON.

### 4. Exporting Scraper Code
- Switch to the **Export** tab.
- Choose your desired target format: **JSON**, **Vanilla JS**, **Cheerio**, **Puppeteer**, or **Playwright**.
- Click **Copy code** or **Download config** to save the configuration file.
- Click **Save project** to persist your scraper schema for future visits to this domain.

---

## 🗺 Roadmap

### Phase 2 (Post-MVP)
- Chrome DevTools Network Inspector panel for capturing background Fetch/XHR endpoints.
- Auto-detection of API candidates (JSON / GraphQL).
- Mutation Monitor (`MutationObserver` tracking live price/DOM updates).
- Selector Health checks across saved domain projects.
- Advanced pagination and infinite scroll heuristics.

### Phase 3
- Optional local AI selector repair for broken selectors after website layout changes.

---

## 📄 License
MIT License.
