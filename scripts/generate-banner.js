import fs from 'node:fs';
import path from 'node:path';

const svgBanner = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 440" width="1280" height="440">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080c16" />
      <stop offset="50%" stop-color="#0c1427" />
      <stop offset="100%" stop-color="#05070d" />
    </linearGradient>

    <!-- Glow Orbs -->
    <radialGradient id="nebulaIndigo" cx="30%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.38" />
      <stop offset="60%" stop-color="#2563eb" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="nebulaCyan" cx="70%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.32" />
      <stop offset="60%" stop-color="#3b82f6" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <!-- Diamond Emblem Gradient -->
    <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="50%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#2563eb" />
    </linearGradient>

    <linearGradient id="badgeBorder" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.22)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0.06)" />
    </linearGradient>

    <!-- Drop Shadow Filter -->
    <filter id="glowShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="8" stdDeviation="22" flood-color="#4f46e5" flood-opacity="0.55" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="1280" height="440" fill="url(#bgGrad)" />

  <!-- Ambient Nebulae -->
  <rect width="1280" height="440" fill="url(#nebulaIndigo)" />
  <rect width="1280" height="440" fill="url(#nebulaCyan)" />

  <!-- Grid overlay -->
  <g stroke="rgba(255,255,255,0.03)" stroke-width="1">
    <line x1="0" y1="80" x2="1280" y2="80" />
    <line x1="0" y1="160" x2="1280" y2="160" />
    <line x1="0" y1="240" x2="1280" y2="240" />
    <line x1="0" y1="320" x2="1280" y2="320" />
    <line x1="0" y1="400" x2="1280" y2="400" />
    <line x1="160" y1="0" x2="160" y2="440" />
    <line x1="320" y1="0" x2="320" y2="440" />
    <line x1="480" y1="0" x2="480" y2="440" />
    <line x1="640" y1="0" x2="640" y2="440" />
    <line x1="800" y1="0" x2="800" y2="440" />
    <line x1="960" y1="0" x2="960" y2="440" />
    <line x1="1120" y1="0" x2="1120" y2="440" />
  </g>

  <!-- Central Emblem (DOM Scout Diamond) -->
  <g transform="translate(640, 105)" filter="url(#glowShadow)">
    <!-- Outer Diamond -->
    <path d="M 0 -54 L 54 0 L 0 54 L -54 0 Z" fill="url(#diamondGrad)" stroke="rgba(255,255,255,0.3)" stroke-width="2" />
    <!-- Inner Accent Ring -->
    <path d="M 0 -44 L 44 0 L 0 44 L -44 0 Z" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" stroke-dasharray="3 3" />
    <!-- Center Code Brackets < / > -->
    <path d="M -18 0 L -8 -11 M -18 0 L -8 11" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 18 0 L 8 -11 M 18 0 L 8 11" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
    <line x1="-3" y1="12" x2="3" y2="-12" stroke="rgba(255,255,255,0.85)" stroke-width="3" stroke-linecap="round" />
  </g>

  <!-- Typography -->
  <g text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif">
    <!-- Title -->
    <text x="640" y="228" font-size="44" font-weight="800" fill="#ffffff" letter-spacing="-1">DOM Scout</text>

    <!-- Subtitle -->
    <text x="640" y="268" font-size="19" font-weight="400" fill="#94a3b8" letter-spacing="0">
      Developer Toolkit for Inspecting DOM Structures &amp; Building Reliable Web Scrapers
    </text>
  </g>

  <!-- Feature Badges -->
  <g transform="translate(640, 335)" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600">
    <!-- Badge 1: Element Inspector -->
    <g transform="translate(-420, 0)">
      <rect x="-85" y="-18" width="170" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="url(#badgeBorder)" stroke-width="1" />
      <text x="0" y="5" fill="#e2e8f0">🎯 Live DOM Inspector</text>
    </g>

    <!-- Badge 2: Selector Quality -->
    <g transform="translate(-252, 0)">
      <rect x="-78" y="-18" width="156" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="url(#badgeBorder)" stroke-width="1" />
      <text x="0" y="5" fill="#e2e8f0">📊 Quality Score (0–100)</text>
    </g>

    <!-- Badge 3: Collection Detector -->
    <g transform="translate(-84, 0)">
      <rect x="-82" y="-18" width="164" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="url(#badgeBorder)" stroke-width="1" />
      <text x="0" y="5" fill="#e2e8f0">🧩 Collection Detector</text>
    </g>

    <!-- Badge 4: Data Preview -->
    <g transform="translate(84, 0)">
      <rect x="-80" y="-18" width="160" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="url(#badgeBorder)" stroke-width="1" />
      <text x="0" y="5" fill="#e2e8f0">📋 Preview &amp; Coverage</text>
    </g>

    <!-- Badge 5: Code Exporter -->
    <g transform="translate(252, 0)">
      <rect x="-78" y="-18" width="156" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="url(#badgeBorder)" stroke-width="1" />
      <text x="0" y="5" fill="#e2e8f0">⚡ Multi-Stack Export</text>
    </g>

    <!-- Badge 6: 100% Local -->
    <g transform="translate(420, 0)">
      <rect x="-85" y="-18" width="170" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="url(#badgeBorder)" stroke-width="1" />
      <text x="0" y="5" fill="#e2e8f0">🛡️ 100% Local &amp; Private</text>
    </g>
  </g>
</svg>`;

const outDir = path.resolve('assets');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const outPath = path.join(outDir, 'banner.svg');
fs.writeFileSync(outPath, svgBanner, 'utf-8');
console.log('Successfully generated assets/banner.svg');
