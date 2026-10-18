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

// A scene may set <meta name="render-scale" content="1,2"> to export at exact pixel sizes:
// the first scale keeps the plain name, later ones get an @Nx suffix. Default: one 1.5x render.
const browser = await playwright.chromium.launch();
for (const scene of scenes) {
  const url = pathToFileURL(join(src, scene)).href;
  const probe = await browser.newPage();
  await probe.goto(url);
  const meta = await probe.$eval('meta[name="render-scale"]', (m) => m.content).catch(() => null);
  await probe.close();
  const scales = meta ? meta.split(',').map(Number) : [1.5];

  for (const [i, scale] of scales.entries()) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: scale });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((im) => (im.complete ? null : new Promise((r) => { im.onload = im.onerror = r; }))));
    });
    const suffix = meta && i > 0 ? `@${scale}x` : '';
    for (const target of await page.$$('[data-out]')) {
      const name = await target.getAttribute('data-out') + suffix;
      const png = (await target.getAttribute('data-png')) !== null;
      const transparent = (await target.getAttribute('data-transparent')) !== null;
      const path = join(out, `${name}.${png || transparent ? 'png' : 'jpg'}`);
      await target.screenshot({ path, omitBackground: transparent, ...(png || transparent ? {} : { type: 'jpeg', quality: 92 }) });
      console.log('rendered', path);
    }
    await page.close();
  }
}
await browser.close();
