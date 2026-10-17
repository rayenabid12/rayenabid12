// Renders every mockup scene in src/ to out/.
// Each element carrying data-out="name" becomes out/name.jpg (or .png with data-png,
// transparent background with data-transparent).
// Usage: node render.mjs [scene-file-substring]
import { createRequire } from 'node:module';
import { readdirSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch { playwright = require('/opt/node22/lib/node_modules/playwright'); }

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, 'src');
const out = join(here, 'out');
mkdirSync(out, { recursive: true });

const filter = process.argv[2] || '';
const scenes = readdirSync(src).filter((f) => f.endsWith('.html') && f.includes(filter));

const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1.5 });
for (const scene of scenes) {
  await page.goto(pathToFileURL(join(src, scene)).href, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
  });
  for (const target of await page.$$('[data-out]')) {
    const name = await target.getAttribute('data-out');
    const png = (await target.getAttribute('data-png')) !== null;
    const transparent = (await target.getAttribute('data-transparent')) !== null;
    const path = join(out, `${name}.${png || transparent ? 'png' : 'jpg'}`);
    await target.screenshot({ path, omitBackground: transparent, ...(png || transparent ? {} : { type: 'jpeg', quality: 90 }) });
    console.log('rendered', path);
  }
}
await browser.close();
