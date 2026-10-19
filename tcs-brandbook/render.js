// Renders the brand book: standalone HTML, mockup PNGs and one 2x PNG per plate (see README for the PDF step).
// Usage: node render.js [--preview out.png]
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PW || 'playwright');

const src = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const doc = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>${src}</body></html>`;

(async () => {
  const preview = process.argv.indexOf('--preview');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: preview > -1 ? 1 : 2 });
  await page.setContent(doc, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);

  if (preview > -1) {
    await page.screenshot({ path: process.argv[preview + 1], fullPage: true });
    if (process.argv[preview + 2]) {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(300);
      await page.screenshot({ path: process.argv[preview + 2], fullPage: true });
    }
    return browser.close();
  }

  fs.writeFileSync(path.join(__dirname, 'brandbook.html'), doc);
  const out = path.join(__dirname, 'exports');
  fs.mkdirSync(path.join(out, 'mockups'), { recursive: true });
  fs.mkdirSync(path.join(out, 'plates'), { recursive: true });

  for (const id of await page.$$eval('.fit', els => els.map(e => e.id))) {
    await page.locator('#' + id).screenshot({ path: path.join(out, 'mockups', id.replace(/^m-/, '') + '.png') });
  }
  await page.addStyleTag({ content: '.nav{display:none!important}' });
  const plates = await page.$$eval('.plate', els => els.map(e => e.id));
  for (const [i, id] of plates.entries()) {
    await page.locator('#' + id).screenshot({ path: path.join(out, 'plates', `${String(i + 1).padStart(2, '0')}-${id}.png`) });
  }
  await browser.close();
})();
