// Shared helpers for rendering Rectify brand assets and mockups.
const fs = require('fs');
const path = require('path');
const P = require('../logo/paths.json');

const C = {
  orange: '#F57C00',
  coral: '#FF6F61',
  deep: '#A84B00',
  ink: '#231A15',
  cream: '#FFF7EE',
  peach: '#FFE2C7',
  white: '#FFFFFF',
  sun: '#FFC23D',
  leaf: '#1FA67A',
  sky: '#2F80ED',
};

const paths = (list, fill) => `<g fill="${fill}">${list.map((d) => `<path d="${d}"/>`).join('')}</g>`;

// Symbol: the R + eyeglasses mark. Aspect 244 x 349.
const symbol = (fill, h, style = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="578 109 244 349" style="height:${h}px;width:${(h * 244) / 349}px;display:block;${style}">${paths(P.sym, fill)}</svg>`;

// Wordmark: custom-drawn "Rectify". Aspect 586 x 173.
const wordmark = (fill, h, style = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="407 505 586 173" style="height:${h}px;width:${(h * 586) / 173}px;display:block;${style}">${paths(P.word, fill)}</svg>`;

// Vertical (primary) lockup. Aspect 598 x 577.
const lockup = (fill, h, style = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="401 103 598 577" style="height:${h}px;width:${(h * 598) / 577}px;display:block;${style}">${paths(P.sym, fill)}${paths(P.word, fill)}</svg>`;

// Horizontal lockup: symbol height h, wordmark at 0.46h, gap 0.3h.
const hlockup = (fill, h, style = '', wordFill = fill) =>
  `<div style="display:flex;align-items:center;gap:${h * 0.3}px;${style}">${symbol(fill, h)}${wordmark(wordFill, h * 0.46, `margin-top:${h * 0.08}px`)}</div>`;

const page = (w, h, body, extraCss = '') => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400..700&family=Nunito:ital,wght@0,400..900;1,400..900&family=Cairo:wght@400..800&display=swap">
<style>*{box-sizing:border-box;margin:0;padding:0}html,body{width:${w}px;height:${h}px;overflow:hidden}
body{font-family:Nunito,sans-serif;color:${C.ink};-webkit-font-smoothing:antialiased}
.f{font-family:Fredoka,sans-serif}.ar{font-family:Cairo,sans-serif}${extraCss}</style></head><body>${body}</body></html>`;

async function render(scenes, outDir, srcDir, { scale = 2 } = {}) {
  const { chromium } = require('/opt/node22/lib/node_modules/playwright');
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const s of scenes) {
    const html = page(s.w, s.h, s.body, s.css || '');
    const src = path.join(srcDir, `${s.name}.html`);
    fs.writeFileSync(src, html);
    const p = await browser.newPage({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: s.scale || scale });
    await p.goto('file://' + src);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(outDir, `${s.name}.png`), omitBackground: !!s.transparent });
    await p.close();
    console.log('rendered', s.name);
  }
  await browser.close();
}

module.exports = { C, symbol, wordmark, lockup, hlockup, render };
