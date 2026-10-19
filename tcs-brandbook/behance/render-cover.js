// Builds the Behance cover (808 × 632) from cover.tpl.html, reusing the brand book's SVG symbols.
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PW || 'playwright');

const book = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const start = book.indexOf('<svg width="0" height="0"');
const defs = book.slice(start, book.indexOf('</svg>', book.indexOf('</defs>')) + 6);
const html = fs.readFileSync(path.join(__dirname, 'cover.tpl.html'), 'utf8').replace('%%DEFS%%', defs);
fs.writeFileSync(path.join(__dirname, 'cover.html'), html);

(async () => {
  const browser = await chromium.launch();
  for (const scale of [1, 3]) {
    const page = await browser.newPage({ viewport: { width: 808, height: 632 }, deviceScaleFactor: scale });
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(__dirname, scale === 1 ? 'behance-cover-808x632.png' : 'behance-cover-2424x1896.png') });
  }
  await browser.close();
})();
