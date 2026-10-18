// node shots.js page.html outdir scale [width height]  → one JPG per .slide (data-name)
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [,, file, outdir, scale = '1', w = '1920', h = '1080'] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: +scale });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + path.resolve(file), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  const els = await p.$$('.slide');
  for (let i = 0; i < els.length; i++) {
    const n = (await els[i].getAttribute('data-name')) || String(i + 1).padStart(2, '0');
    await els[i].screenshot({ path: path.join(outdir, n + '.jpg'), type: 'jpeg', quality: 88 });
  }
  console.log('rendered', els.length);
  await b.close();
})();
