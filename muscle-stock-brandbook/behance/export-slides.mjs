// Renders the brand-book slides (Slides-artifact HTML, one <section> per file) to 1920x1080 JPGs
// for a Behance upload. /_blob/<id> image refs are mapped to the local asset files.
// Usage: node export-slides.mjs <deck-project-dir> [scale]  (scale 2 = 3840x2160 for Retina)
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch { playwright = require('/opt/node22/lib/node_modules/playwright'); }

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const deckDir = process.argv[2];
const scale = Number(process.argv[3] || 1);
const blobs = JSON.parse(readFileSync(join(here, 'blob-map.json'), 'utf8'));
const deck = JSON.parse(readFileSync(join(deckDir, 'deck.json'), 'utf8'));
const out = join(here, 'slides');
mkdirSync(out, { recursive: true });

const fonts = Object.values(deck.faces).map((f) => `<link rel="stylesheet" href="${f.href}">`).join('');
const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: scale });
for (const [i, id] of deck.order.entries()) {
  let html = readFileSync(join(deckDir, 'slides', `${id}.html`), 'utf8');
  html = html.replace(/\/_blob\/([0-9a-f]{32})/g, (m, b) => {
    if (!blobs[b]) throw new Error(`no local file for blob ${b} in ${id}`);
    return pathToFileURL(join(root, blobs[b])).href;
  });
  const tmp = join(out, '.slide.html');
  writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8">${fonts}<style>
    *{margin:0;box-sizing:border-box} body{width:1920px;height:1080px;overflow:hidden}
    section{position:relative;width:1920px;height:1080px;overflow:hidden}
    aside{display:none} h1,h2,h3{font-weight:600} table{border-collapse:collapse;width:100%}
    th,td{padding:.35em .6em;border-bottom:1px solid rgba(128,128,128,.35)} ul,ol{padding-left:1.2em}
    /* the Slides runtime paints flow content above pinned backdrops */
    section>*{position:relative;z-index:1} section>[style*="position:absolute"]{z-index:0}
  </style></head><body>${html}</body></html>`);
  await page.goto(pathToFileURL(tmp).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const path = join(out, `${String(i + 1).padStart(2, '0')}-${id}.jpg`);
  await page.screenshot({ path, type: 'jpeg', quality: 90 });
  console.log('exported', path);
}
rmSync(join(out, '.slide.html'), { force: true });
await browser.close();
