// Render brandbook/index.html to a PDF and per-slide PNG previews with Playwright.
// Usage: node brandbook/tools/export.js [--pdf] [--png] [--only 1,5,12] [--out dir]
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(opt('--out') || path.join(ROOT, 'export'));
const only = opt('--only') ? opt('--only').split(',').map(Number) : null;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.join(ROOT, 'index.html'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  if (flag('--png')) {
    await page.emulateMedia({ media: 'print' });
    const slides = await page.$$('.slide');
    for (let i = 0; i < slides.length; i++) {
      if (only && !only.includes(i + 1)) continue;
      await slides[i].screenshot({ path: path.join(OUT, `page-${String(i + 1).padStart(2, '0')}.png`) });
    }
    await page.emulateMedia({ media: 'screen' });
  }
  if (flag('--pdf')) {
    await page.pdf({
      path: path.join(OUT, 'Para-Elixea-Charte-Graphique-v2.pdf'),
      width: '1920px', height: '1080px', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  }
  await browser.close();
  console.log('done →', OUT);
})();
