const { chromium } = require('playwright'); const path = require('path');
(async () => { const [,, f, out] = process.argv; const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(f), { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  await p.pdf({ path: out, width: '1920px', height: '1080px', printBackground: true, margin: { top: 0, bottom: 0, left: 0, right: 0 } }); await b.close(); })();
