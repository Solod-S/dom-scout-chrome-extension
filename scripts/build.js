import { build } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

async function buildAll() {
  console.log('🚀 Starting DOM Scout build...');

  // Ensure dist directory is clean
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }

  // 1. Build Sidepanel (HTML + React + CSS)
  console.log('📦 Building Sidepanel...');
  await build({
    root: path.resolve(rootDir, 'src/sidepanel'),
    plugins: [react()],
    base: './',
    publicDir: path.resolve(rootDir, 'public'),
    build: {
      outDir: path.resolve(distDir, 'sidepanel'),
      emptyOutDir: false,
      rollupOptions: {
        input: {
          index: path.resolve(rootDir, 'src/sidepanel/index.html')
        }
      }
    }
  });

  // Move manifest.json and icons from dist/sidepanel/ to dist/ root
  const copiedPublicFiles = ['manifest.json', 'icons', '_locales'];
  for (const item of copiedPublicFiles) {
    const srcPath = path.resolve(distDir, 'sidepanel', item);
    const destPath = path.resolve(distDir, item);
    if (fs.existsSync(srcPath)) {
      if (fs.existsSync(destPath)) {
        fs.rmSync(destPath, { recursive: true, force: true });
      }
      fs.renameSync(srcPath, destPath);
    }
  }

  // Also ensure _locales from root is copied to dist/_locales if exists
  const rootLocales = path.resolve(rootDir, '_locales');
  const distLocales = path.resolve(distDir, '_locales');
  if (fs.existsSync(rootLocales)) {
    fs.cpSync(rootLocales, distLocales, { recursive: true });
  }

  // 2. Build Content Script (IIFE - standalone, zero imports)
  console.log('📦 Building Content Script (IIFE)...');
  await build({
    configFile: false,
    build: {
      outDir: path.resolve(distDir, 'content'),
      emptyOutDir: false,
      lib: {
        entry: path.resolve(rootDir, 'src/content/index.js'),
        name: 'DOMScoutContent',
        formats: ['iife'],
        fileName: () => 'content.js'
      },
      rollupOptions: {
        output: {
          extend: true
        }
      }
    }
  });

  // 3. Build Background Service Worker (ES module)
  console.log('📦 Building Background Service Worker...');
  await build({
    configFile: false,
    build: {
      outDir: path.resolve(distDir, 'background'),
      emptyOutDir: false,
      lib: {
        entry: path.resolve(rootDir, 'src/background/service-worker.js'),
        formats: ['es'],
        fileName: () => 'service-worker.js'
      }
    }
  });

  console.log('✅ DOM Scout build completed successfully!');
}

buildAll().catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
