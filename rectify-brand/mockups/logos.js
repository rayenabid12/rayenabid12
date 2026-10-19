// Exports the master logo files (SVG + transparent PNG) and the logo-system diagrams.
const fs = require('fs');
const path = require('path');
const { C, symbol, wordmark, lockup, hlockup, render } = require('./lib');
const P = require('../logo/paths.json');

const root = path.join(__dirname, '..');
const logoDir = path.join(root, 'logo');
const out = path.join(__dirname, 'png');
const src = path.join(__dirname, 'src');

// ---- Master SVG files -------------------------------------------------------
const g = (list, fill) => `<g fill="${fill}">${list.map((d) => `<path d="${d}"/>`).join('')}</g>`;
const svgFile = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>\n`;
const colorways = { orange: C.orange, white: C.white, ink: C.ink, coral: C.coral };
for (const [name, fill] of Object.entries(colorways)) {
  fs.writeFileSync(path.join(logoDir, `rectify-symbol-${name}.svg`), svgFile('578 109 244 349', g(P.sym, fill)));
  fs.writeFileSync(path.join(logoDir, `rectify-wordmark-${name}.svg`), svgFile('407 505 586 173', g(P.word, fill)));
  fs.writeFileSync(path.join(logoDir, `rectify-lockup-vertical-${name}.svg`), svgFile('401 103 598 577', g(P.sym, fill) + g(P.word, fill)));
  // Horizontal: symbol (h 349) + wordmark scaled to 0.46h, gap 0.3h.
  const s = (349 * 0.46) / 173;
  const wx = 244 + 349 * 0.3;
  const wy = (349 - 173 * s) / 2 + 349 * 0.08;
  fs.writeFileSync(
    path.join(logoDir, `rectify-lockup-horizontal-${name}.svg`),
    svgFile(`0 0 ${Math.ceil(wx + 586 * s)} 349`,
      `<g transform="translate(-578 -109)">${g(P.sym, fill)}</g><g transform="translate(${wx} ${wy}) scale(${s}) translate(-407 -505)">${g(P.word, fill)}</g>`)
  );
}

// ---- Transparent PNG logos for the deck --------------------------------------
const pad = (inner, w, h) => `<div style="width:${w}px;height:${h}px;display:flex;align-items:center;justify-content:center">${inner}</div>`;
const pngs = [];
for (const [name, fill] of Object.entries(colorways)) {
  pngs.push({ name: `logo-lockup-${name}`, w: 620, h: 600, transparent: true, body: pad(lockup(fill, 577), 620, 600) });
  pngs.push({ name: `logo-symbol-${name}`, w: 260, h: 360, transparent: true, body: pad(symbol(fill, 349), 260, 360) });
  pngs.push({ name: `logo-horizontal-${name}`, w: 1000, h: 360, transparent: true, body: pad(hlockup(fill, 330), 1000, 360) });
}

// ---- Clear space & minimum size ---------------------------------------------
// x = stem width of the R (≈ 49 of 244 symbol units → 0.2 × symbol width).
const LH = 420; // lockup height in px
const unit = (LH / 577) * 49;
const dash = `border:2px dashed ${C.coral}`;
const clear = {
  name: 'diagram-clearspace',
  w: 1600, h: 900,
  body: `<div style="width:1600px;height:900px;background:${C.cream};display:flex;align-items:center;justify-content:space-around;padding:0 80px">
  <div style="position:relative;padding:${unit * 2}px;${dash};border-radius:4px">
    ${lockup(C.orange, LH)}
    ${['top:0;left:0', 'top:0;right:0', 'bottom:0;left:0', 'bottom:0;right:0'].map((p) =>
      `<div style="position:absolute;${p};width:${unit * 2}px;height:${unit * 2}px;background:${C.peach};display:flex;align-items:center;justify-content:center;font:700 22px Fredoka;color:${C.deep}">2x</div>`).join('')}
    <div style="position:absolute;left:${unit * 2 + (LH / 577) * (582 - 401)}px;top:${unit * 2 - 34}px;width:${unit}px;border-top:3px solid ${C.ink}"></div>
    <div style="position:absolute;left:${unit * 2 + (LH / 577) * (582 - 401) + unit / 2 - 8}px;top:${unit * 2 - 70}px;font:700 24px Fredoka">x</div>
  </div>
  <div style="display:flex;flex-direction:column;gap:46px;font-size:22px">
    <div style="display:flex;align-items:flex-end;gap:36px">
      ${lockup(C.ink, 120)}${hlockup(C.ink, 56)}${symbol(C.ink, 40)}
    </div>
    <div style="display:flex;align-items:flex-end;gap:36px">
      ${lockup(C.ink, 60)}${hlockup(C.ink, 28)}${symbol(C.ink, 20)}
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,auto);gap:10px 40px;font-weight:700">
      <span>Vertical lockup</span><span>Horizontal lockup</span><span>Symbol</span>
      <span style="font-weight:400">min. 60 px · 18 mm</span><span style="font-weight:400">min. 28 px · 8 mm</span><span style="font-weight:400">min. 20 px · 6 mm</span>
    </div>
  </div></div>`,
};

// ---- App icons -------------------------------------------------------------
const icon = (bg, fg, s, r = 0.225) =>
  `<div style="width:${s}px;height:${s}px;border-radius:${s * r}px;background:${bg};display:flex;align-items:center;justify-content:center;box-shadow:0 ${s * 0.06}px ${s * 0.16}px rgba(35,26,21,.18)">${symbol(fg, s * 0.62, `transform:translateX(${s * 0.03}px)`)}</div>`;
const icons = {
  name: 'diagram-appicons',
  w: 1600, h: 900,
  body: `<div style="width:1600px;height:900px;background:${C.peach};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:70px">
  <div style="display:flex;gap:70px;align-items:flex-end">
    ${[[C.orange, C.white, 'Primary'], [C.cream, C.orange, 'Light'], [C.ink, C.orange, 'Dark'], [C.coral, C.white, 'Seasonal']].map(([bg, fg, l]) =>
      `<div style="display:flex;flex-direction:column;align-items:center;gap:24px">${icon(bg, fg, 240)}<span class="f" style="font-size:28px;font-weight:600">${l}</span></div>`).join('')}
  </div>
  <div style="display:flex;gap:40px;align-items:flex-end">
    ${[180, 120, 87, 58, 40].map((s) => `<div style="display:flex;flex-direction:column;align-items:center;gap:14px">${icon(C.orange, C.white, s)}<span style="font-size:20px;font-weight:700">${s}px</span></div>`).join('')}
    <div style="display:flex;flex-direction:column;align-items:center;gap:14px">${icon(C.orange, C.white, 32, 0.5)}<span style="font-size:20px;font-weight:700">favicon</span></div>
  </div></div>`,
};

// ---- Misuse grid ------------------------------------------------------------
const tile = (inner, label, bg = C.white) => `<div style="display:flex;flex-direction:column;gap:16px">
  <div style="position:relative;height:250px;border-radius:20px;background:${bg};display:flex;align-items:center;justify-content:center;overflow:hidden">${inner}
    <div style="position:absolute;top:16px;right:16px;width:44px;height:44px;border-radius:22px;background:${C.ink};color:${C.white};font:700 26px Fredoka;display:flex;align-items:center;justify-content:center">✕</div></div>
  <span style="font-size:24px;font-weight:700">${label}</span></div>`;
const misuse = {
  name: 'diagram-misuse',
  w: 1600, h: 900,
  body: `<div style="width:1600px;height:900px;background:${C.cream};padding:60px 70px;display:grid;grid-template-columns:repeat(4,1fr);gap:40px 36px">
  ${tile(hlockup(C.orange, 70, "transform:scaleX(1.35)"), 'Don’t stretch or squash')}
  ${tile(hlockup('#7B4FD6', 90), 'Don’t use off-palette colors')}
  ${tile(hlockup(C.orange, 90, 'transform:rotate(-14deg)'), 'Don’t rotate')}
  ${tile(hlockup(C.orange, 90, 'filter:drop-shadow(8px 10px 6px rgba(0,0,0,.45))'), 'Don’t add shadows or effects')}
  ${tile(`<div style="display:flex;align-items:center;gap:26px">${symbol(C.orange, 90)}<span style="font:700 54px Arial;color:${C.orange}">Rectify</span></div>`, 'Don’t retype the wordmark')}
  ${tile(`<div style="display:flex;align-items:center;gap:26px">${wordmark(C.orange, 42)}${symbol(C.orange, 90)}</div>`, 'Don’t rearrange the elements')}
  ${tile(hlockup(C.orange, 90), 'Don’t place on low contrast', C.coral)}
  ${tile(hlockup(C.white, 90), 'Don’t place on busy images', `repeating-linear-gradient(45deg,${C.sky} 0 18px,${C.sun} 18px 36px,${C.leaf} 36px 54px)`)}
  </div>`,
};

// ---- Pattern ----------------------------------------------------------------
const patternTile = (fg, bg, size, rows, cols, w, h) => {
  let cells = '';
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      cells += `<div style="position:absolute;left:${c * size * 0.95 + (r % 2 ? size * 0.47 : 0) - size * 0.3}px;top:${r * size * 1.12 - size * 0.4}px;opacity:${(r + c) % 3 ? 1 : 0.55}">${symbol(fg, size)}</div>`;
  return `<div style="position:relative;width:${w}px;height:${h}px;background:${bg};overflow:hidden;border-radius:28px">${cells}</div>`;
};
const pattern = {
  name: 'diagram-pattern',
  w: 1600, h: 900,
  body: `<div style="width:1600px;height:900px;background:${C.cream};padding:50px;display:grid;grid-template-columns:1.3fr 1fr;gap:40px">
  ${patternTile(C.orange, C.peach, 150, 6, 9, 830, 800)}
  <div style="display:grid;grid-template-rows:1fr 1fr;gap:40px">
    ${patternTile(C.white, C.coral, 90, 7, 8, 630, 380)}
    ${patternTile('#3A2C24', C.ink, 90, 7, 8, 630, 380)}
  </div></div>`,
};

render([...pngs, clear, icons, misuse, pattern], out, src).catch((e) => { console.error(e); process.exit(1); });
