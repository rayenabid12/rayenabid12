// Renders the Rectify Behance case-study panels (1400px wide, exported at 2x).
const fs = require('fs');
const path = require('path');
const { C, symbol, wordmark, lockup, hlockup } = require('../mockups/lib');
const P = require('../logo/paths.json');

const OUT = path.join(__dirname, 'png');
const SRC = path.join(__dirname, 'src');
const W = 1400;
const ph = (name) => `../photos/ph-${name}.jpg`;

// ---- Building blocks --------------------------------------------------------
const g = (list, fill) => list.map((d) => `<path d="${d}" fill="${fill}"/>`).join('');

// The symbol with swappable pupils: the mascot "Specs".
const LENS = [{ x: 669.9, y: 213.4 }, { x: 728.5, y: 213.4 }];
const pupil = {
  curious: () => null,
  happy: (c, f) => `<path d="M${c.x - 10} ${c.y + 6} Q${c.x} ${c.y - 12} ${c.x + 10} ${c.y + 6}" fill="none" stroke="${f}" stroke-width="7" stroke-linecap="round"/>`,
  wow: (c, f) => `<ellipse cx="${c.x}" cy="${c.y}" rx="9.5" ry="15" fill="${f}"/>`,
  thinking: (c, f) => `<circle cx="${c.x + 3}" cy="${c.y - 10}" r="8.5" fill="${f}"/>`,
  sleepy: (c, f) => `<path d="M${c.x - 8} ${c.y + 2} H${c.x + 8}" stroke="${f}" stroke-width="5.5" stroke-linecap="round"/>`,
  star: (c, f) => {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const r = i % 2 ? 5.6 : 13, a = (Math.PI / 5) * i - Math.PI / 2;
      return `${(c.x + r * Math.cos(a)).toFixed(1)},${(c.y + r * Math.sin(a)).toFixed(1)}`;
    }).join(' ');
    return `<polygon points="${pts}" fill="${f}" stroke="${f}" stroke-width="2" stroke-linejoin="round"/>`;
  },
};
const face = (fill, h, mood = 'curious', right = mood, style = '') => {
  const base = mood === 'curious' && right === 'curious' ? P.sym : [P.sym[0], P.sym[1], P.sym[3], P.sym[5]];
  const eyes = base === P.sym ? '' : pupil[mood](LENS[0], fill) + pupil[right](LENS[1], fill);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="578 109 244 349" style="height:${h}px;width:${(h * 244) / 349}px;display:block;overflow:visible;${style}">${g(base, fill)}${eyes}</svg>`;
};
const glassesOnly = (fill, h) =>
  `<svg viewBox="598 172 160 84" style="height:${h}px;width:${(h * 160) / 84}px;display:block">${g([P.sym[2], P.sym[3], P.sym[4], P.sym[5]], fill)}</svg>`;

const reg = (color, size) => `<span style="font:600 ${size}px Nunito;color:${color};vertical-align:top;margin-left:6px">®</span>`;
const micro = (t, color = C.ink, extra = '') => `<span style="font:800 12px Nunito;letter-spacing:.18em;text-transform:uppercase;color:${color};${extra}">${t}</span>`;
const grain = `<div style="position:absolute;inset:0;pointer-events:none;opacity:.10;mix-blend-mode:overlay;background-image:url(&quot;data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>&quot;)"></div>`;
const photo = (name, pos = 'center', extra = '') =>
  `<img src="${ph(name)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${pos};filter:saturate(1.08) contrast(1.04) sepia(.10);${extra}">`;
const pill = (t, color, border = color, bg = 'transparent') =>
  `<span style="display:inline-block;padding:7px 18px;border-radius:999px;border:1.5px solid ${border};color:${color};background:${bg};font:700 14px Nunito;letter-spacing:.04em">${t}</span>`;
const panel = (name, h, body) => ({ name, w: W, h, body: `<div style="position:relative;width:${W}px;height:${h}px;overflow:hidden">${body}</div>` });

const panels = [];

// 01 — Hero ---------------------------------------------------------------------
panels.push(panel('01-hero', 880, `
  ${photo('desk', '55% 30%')}
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(28,21,17,.55),rgba(28,21,17,.25) 35%,rgba(28,21,17,.35) 60%,rgba(28,21,17,.75))"></div>
  ${grain}
  <div style="position:absolute;left:56px;right:56px;top:40px;display:flex;justify-content:space-between">${micro('Rectify® — Brand identity', C.cream)}${micro('Kids learning platform', C.cream)}${micro('Tunis · 2026', C.cream)}</div>
  <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px">
    <div style="display:flex;align-items:flex-start">${wordmark(C.cream, 200)}${reg(C.cream, 30)}</div>
    <div style="font:800 15px Nunito;letter-spacing:.22em;color:${C.cream};text-align:center">LEARN. LAUGH. LOOK CLOSER.</div>
    ${pill('2026', C.cream)}
  </div>`));

// 02 — Intro --------------------------------------------------------------------
const meta = [['Client', 'Rectify'], ['Industry', 'EdTech · Kids 6–12'], ['Scope', 'Identity · Product · Campaign'], ['Year', '2026']];
panels.push(panel('02-intro', 520, `
  <div style="position:absolute;inset:0;background:${C.cream};padding:100px 120px 70px;display:flex;flex-direction:column;justify-content:space-between">
    <div style="display:grid;grid-template-columns:300px 1fr;gap:60px">
      <div style="display:flex;align-items:flex-start;gap:4px">${wordmark(C.orange, 44)}${reg(C.orange, 16)}</div>
      <p style="font:500 30px/1.45 Nunito;color:${C.ink}">Rectify is a learning platform that brings education and entertainment together. Short videos and playful activities help kids explore <span style="color:${C.deep};font-weight:800">math, language and science</span>, at their own pace, with a friend who wears glasses.</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);border-top:1.5px solid ${C.ink}">
      ${meta.map(([k, v]) => `<div style="padding-top:18px;display:flex;flex-direction:column;gap:6px">${micro(k, '#8a7a6e')}<span style="font:700 18px Nunito">${v}</span></div>`).join('')}
    </div>
  </div>`));

// 03 — Concept: R + glasses = Rectify -------------------------------------------
const op = (t) => `<div class="f" style="font-size:90px;font-weight:400;color:${C.deep}">${t}</div>`;
const cap = (n, t) => `<div style="display:flex;flex-direction:column;align-items:center;gap:6px">${micro(n, C.deep)}<span style="font:700 20px Nunito">${t}</span></div>`;
panels.push(panel('03-concept', 820, `
  <div style="position:absolute;inset:0;background:${C.peach};padding:90px 120px;display:flex;flex-direction:column;justify-content:space-between">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      ${micro('01 — Concept', C.deep)}
      <p class="f" style="font-size:40px;font-weight:500;line-height:1.15;width:760px;color:${C.ink}">To <i>rectify</i> is to make something right. Our R puts on its glasses and takes a closer look.</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr auto 1fr auto 1fr;align-items:center;justify-items:center;gap:30px">
      <div class="f" style="font-size:330px;font-weight:600;line-height:.8;color:${C.ink}">R</div>${op('+')}
      <div style="padding:40px 0">${glassesOnly(C.ink, 120)}</div>${op('=')}
      ${symbol(C.orange, 290)}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr">${cap('A', 'The letter R')}${cap('B', 'A pair of glasses')}${cap('C', 'A curious learner')}</div>
  </div>`));

// 04 — Construction -------------------------------------------------------------
const guidesY = [113, 189, 213, 238, 314, 454];
const guidesX = [582, 631, 655, 670, 728.5, 743, 818];
const outline = P.sym.map((d) => `<path d="${d}" fill="none" stroke="${C.cream}" stroke-width="1.1"/>`).join('');
panels.push(panel('04-construction', 900, `
  <div style="position:absolute;inset:0;background:#1C1511"></div>
  <svg viewBox="350 58 700 450" style="position:absolute;inset:0;width:100%;height:100%">
    ${guidesY.map((y) => `<line x1="350" x2="1050" y1="${y}" y2="${y}" stroke="#6b5a4e" stroke-width=".6" stroke-dasharray="3 3"/>`).join('')}
    ${guidesX.map((x) => `<line y1="58" y2="508" x1="${x}" x2="${x}" stroke="#6b5a4e" stroke-width=".6" stroke-dasharray="3 3"/>`).join('')}
    <circle cx="717.5" cy="213.4" r="100.4" fill="none" stroke="${C.orange}" stroke-width=".8"/>
    <circle cx="717.5" cy="213.4" r="56.3" fill="none" stroke="${C.orange}" stroke-width=".8"/>
    ${LENS.map((l) => `<ellipse cx="${l.x}" cy="${l.y}" rx="20" ry="30" fill="none" stroke="${C.orange}" stroke-width=".8"/>`).join('')}
    <circle cx="606.6" cy="137.5" r="24.5" fill="none" stroke="${C.orange}" stroke-width=".8"/>
    <circle cx="737" cy="430" r="24.5" fill="none" stroke="${C.orange}" stroke-width=".8"/>
    ${outline}
  </svg>
  <div style="position:absolute;left:56px;top:48px">${micro('02 — Construction', C.orange)}</div>
  <div style="position:absolute;right:56px;bottom:48px;width:360px;text-align:right;font:500 16px/1.6 Nunito;color:#cdbdb0">One stroke width, round terminals, and two lenses sharing the bowl’s centre. Geometry keeps it calm; the eyes keep it alive.</div>`));

// 05 — Wordmark -----------------------------------------------------------------
panels.push(panel('05-wordmark', 700, `
  <div style="position:absolute;inset:0;background:${C.orange}"></div>${grain}
  <div style="position:absolute;left:56px;right:56px;top:44px;display:flex;justify-content:space-between">${micro('03 — Wordmark', C.ink)}${micro('Custom lettering', C.ink)}</div>
  <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><div style="display:flex;align-items:flex-start">${wordmark(C.ink, 290)}${reg(C.ink, 40)}</div></div>
  <div style="position:absolute;left:56px;bottom:44px;width:420px;font:600 17px/1.55 Nunito;color:${C.ink}">Rounded terminals and open counters. Lettering built to be read by a six-year-old and trusted by their parents.</div>`));

// 06 — Palette over photo ---------------------------------------------------------
const chips = [
  ['Ink', '#231A15', '35, 26, 21', '0, 26, 40, 86'],
  ['Rectify Orange', '#F57C00', '245, 124, 0', '0, 49, 100, 4'],
  ['Coral', '#FF6F61', '255, 111, 97', '0, 56, 62, 0'],
  ['Sun', '#FFC23D', '255, 194, 61', '0, 24, 76, 0'],
  ['Peach', '#FFE2C7', '255, 226, 199', '0, 11, 22, 0'],
  ['Cream', '#FFF7EE', '255, 247, 238', '0, 3, 7, 0'],
];
panels.push(panel('06-palette', 900, `
  ${photo('couch', '50% 35%')}
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(28,21,17,.1),rgba(28,21,17,.35))"></div>${grain}
  <div style="position:absolute;left:56px;top:44px">${micro('04 — Color', C.cream)}</div>
  <div style="position:absolute;left:56px;right:56px;bottom:56px;display:grid;grid-template-columns:repeat(6,1fr);gap:16px">
    ${chips.map(([n, hex, rgb, cmyk]) => `<div style="background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,.25)">
      <div style="height:150px;background:${hex};${hex === '#FFF7EE' ? 'border-bottom:1px solid #eadbcb' : ''}"></div>
      <div style="padding:14px 14px 16px;display:flex;flex-direction:column;gap:6px;font-size:11.5px">
        <span style="font:800 13px Nunito;text-transform:uppercase;letter-spacing:.06em">${n}</span>
        <span><b>HEX</b>&nbsp;&nbsp;${hex.slice(1)}</span><span><b>RGB</b>&nbsp;&nbsp;${rgb}</span><span><b>CMYK</b>&nbsp;${cmyk}</span></div></div>`).join('')}
  </div>`));

// 07 — Typography ---------------------------------------------------------------
const weights = [['Light', 300], ['Regular', 400], ['Medium', 500], ['SemiBold', 600], ['Bold', 700]];
panels.push(panel('07-typography', 720, `
  <div style="position:absolute;inset:0;background:${C.cream};padding:90px 120px;display:grid;grid-template-columns:300px 1fr;gap:120px">
    <div style="display:flex;flex-direction:column">
      ${weights.map(([n, w]) => `<div style="display:flex;justify-content:space-between;align-items:flex-end;padding:16px 0 10px;border-bottom:1.5px solid ${C.ink}">
        <div style="display:flex;flex-direction:column;font-size:13px"><span>${n}</span><span style="color:#8a7a6e">${w}</span></div>
        <span class="f" style="font-size:44px;font-weight:${w};line-height:1">Aa</span></div>`).join('')}
    </div>
    <div style="display:flex;flex-direction:column;gap:26px">
      <div>${pill('Typography', C.ink)}</div>
      <div class="f" style="font-size:96px;font-weight:600;line-height:1">Fredoka</div>
      <p style="font:500 19px/1.6 Nunito;width:560px;color:#4a3e37">A rounded display face that echoes the soft terminals of the wordmark. Friendly at poster size, clear on a phone. Free on Google Fonts.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:20px">
        <div style="border-top:1.5px solid ${C.ink};padding-top:16px;display:flex;flex-direction:column;gap:8px">${micro('Text', '#8a7a6e')}<span style="font:800 34px Nunito">Nunito</span><span style="font:400 15px/1.5 Nunito;color:#4a3e37">ABCDEFGHIJKLM<br>abcdefghijklm 0123456789</span></div>
        <div style="border-top:1.5px solid ${C.ink};padding-top:16px;display:flex;flex-direction:column;gap:8px">${micro('Arabic', '#8a7a6e')}<span class="ar" style="font-size:34px;font-weight:700;line-height:1.2">Cairo — كايرو</span><span class="ar" style="font-size:17px;line-height:1.5;color:#4a3e37">تعلّم، العب، وانظر عن قرب<br>٠١٢٣٤٥٦٧٨٩</span></div>
      </div>
    </div>
  </div>`));

// 08 — Symbol + app icons split ---------------------------------------------------
const appIcon = (bg, fg, s, border = '') => `<div style="width:${s}px;height:${s}px;border-radius:${s * 0.24}px;background:${bg};${border};display:flex;align-items:center;justify-content:center">${symbol(fg, s * 0.6, `transform:translateX(${s * 0.03}px)`)}</div>`;
panels.push(panel('08-symbol-icons', 700, `
  <div style="position:absolute;left:0;top:0;width:700px;height:700px;background:${C.cream};display:flex;align-items:center;justify-content:center">
    <div style="position:relative;width:380px;height:380px;border:1px solid #b9a899">
      <svg viewBox="0 0 380 380" style="position:absolute;inset:0"><line x1="0" y1="0" x2="380" y2="380" stroke="#b9a899"/><line x1="380" y1="0" x2="0" y2="380" stroke="#b9a899"/><circle cx="190" cy="190" r="170" fill="none" stroke="#b9a899"/></svg>
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">${symbol(C.ink, 270)}</div>
    </div>
  </div>
  <div style="position:absolute;left:700px;top:0;width:700px;height:700px;background:#1C1511;display:flex;align-items:center;justify-content:center;gap:34px">
    ${appIcon(C.cream, C.orange, 150)}${appIcon('#1C1511', C.orange, 150, `border:1.5px solid ${C.cream}`)}${appIcon(C.orange, C.cream, 150)}
  </div>
  <div style="position:absolute;left:56px;top:44px">${micro('05 — Symbol', C.ink)}</div>
  <div style="position:absolute;left:756px;top:44px">${micro('App icon', C.cream)}</div>`));

// 09 — Mascot: Meet Specs ---------------------------------------------------------
const moods = [
  ['curious', 'curious', 'Curious', C.orange, C.cream],
  ['happy', 'happy', 'Happy', C.coral, C.cream],
  ['wow', 'wow', 'Wow!', C.sun, C.ink],
  ['thinking', 'thinking', 'Thinking', '#2F80ED', C.cream],
  ['happy', 'thinking', 'Wink', '#1FA67A', C.cream],
  ['star', 'star', 'Proud', C.ink, C.orange],
];
panels.push(panel('09-mascot', 1000, `
  <div style="position:absolute;inset:0;background:${C.cream};padding:90px 120px;display:flex;flex-direction:column;gap:56px">
    <div style="display:flex;justify-content:space-between;align-items:flex-end">
      <div style="display:flex;flex-direction:column;gap:18px">${micro('06 — New: mascot', C.deep)}<div class="f" style="font-size:84px;font-weight:600;line-height:1">Meet Specs.</div></div>
      <p style="font:500 19px/1.6 Nunito;width:520px;color:#4a3e37">The symbol already has eyes, so we let them move. Specs reacts to every answer in the app, so feedback feels like a friend cheering you on, not a grade.</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;flex:1">
      ${moods.map(([l, r, n, bg, fg]) => `<div style="position:relative;border-radius:28px;background:${bg};display:flex;align-items:center;justify-content:center">
        ${face(fg, 230, l, r)}<span style="position:absolute;left:24px;bottom:20px;font:800 15px Nunito;letter-spacing:.08em;text-transform:uppercase;color:${fg}">${n}</span></div>`).join('')}
    </div>
  </div>`));

// 10 — The Lens device ---------------------------------------------------------------
panels.push(panel('10-lens', 900, `
  <svg width="0" height="0" style="position:absolute"><clipPath id="lens" clipPathUnits="objectBoundingBox">
    <ellipse cx=".25" cy=".5" rx=".25" ry=".5"/><ellipse cx=".75" cy=".5" rx=".25" ry=".5"/><rect x=".45" y=".44" width=".1" height=".12"/></clipPath></svg>
  <div style="position:absolute;inset:0;background:${C.orange}"></div>${grain}
  <div style="position:absolute;left:56px;top:44px">${micro('07 — New: the Lens', C.ink)}</div>
  <div style="position:absolute;left:150px;top:150px;width:1100px;height:520px;clip-path:url(#lens);overflow:hidden">
    <img src="${ph('girl-glasses')}" style="width:100%;height:100%;object-fit:cover;object-position:50% 30%;filter:saturate(1.1) contrast(1.05)">
  </div>
  <div style="position:absolute;left:56px;right:56px;bottom:52px;display:flex;justify-content:space-between;align-items:flex-end">
    <div class="f" style="font-size:44px;font-weight:600;line-height:1.05;color:${C.ink}">Look closer.</div>
    <p style="font:600 17px/1.55 Nunito;width:460px;color:${C.ink};text-align:right">A signature frame cut from the logo’s glasses. Any photo dropped inside becomes a pair of lenses: a reminder to look closer.</p>
  </div>`));

// 11 — Values word list + photo split -----------------------------------------------
const words = ['Wonder', 'Play', 'Discover', 'Look closer', 'Learn', 'Grow', 'Share'];
panels.push(panel('11-values', 800, `
  <div style="position:absolute;left:0;top:0;width:700px;height:800px;background:${C.cream};padding:70px 70px;display:flex;flex-direction:column;justify-content:center;gap:4px">
    ${words.map((w, i) => {
      const d = Math.abs(i - 3);
      return `<div class="f" style="font-size:62px;font-weight:500;line-height:1.12;color:${d === 0 ? C.ink : d === 1 ? '#6b5d54' : d === 2 ? '#a89a90' : '#d3c8be'}">${d === 0 ? `<span style="color:${C.orange}">+</span> ` : ''}${w}</div>`;
    }).join('')}
  </div>
  <div style="position:absolute;left:700px;top:0;width:700px;height:800px;overflow:hidden">
    ${photo('science', '38% 50%')}
    <div style="position:absolute;inset:0;background:linear-gradient(0deg,rgba(28,21,17,.55),rgba(28,21,17,0) 55%)"></div>
    <div style="position:absolute;right:50px;bottom:50px">${face(C.cream, 190, 'wow')}</div>
  </div>`));

// 12 — Lesson card over photo -----------------------------------------------------
const stat = (k, v) => `<div style="display:flex;flex-direction:column;gap:2px"><span style="font:800 16px Nunito">${k}</span><span style="font:500 15px Nunito;color:#4a3e37">${v}</span></div>`;
panels.push(panel('12-lesson-card', 900, `
  ${photo('girls-tablet', '50% 40%', 'filter:blur(3px) saturate(1) brightness(.75)')}
  <div style="position:absolute;inset:0;background:rgba(28,21,17,.25)"></div>${grain}
  <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:640px;background:${C.cream};padding:18px;box-shadow:0 40px 80px rgba(0,0,0,.4)">
    <div style="position:relative;height:340px;overflow:hidden">
      ${photo('desk', '50% 25%')}
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(28,21,17,.35),rgba(28,21,17,.1))"></div>
      <div style="position:absolute;left:18px;top:16px">${symbol(C.cream, 40)}</div>
      <svg viewBox="0 0 604 340" preserveAspectRatio="none" style="position:absolute;inset:0"><path d="M40 250 C120 250 110 170 190 175 S280 240 330 160 S420 60 480 70" fill="none" stroke="${C.cream}" stroke-width="3" stroke-dasharray="1 9" stroke-linecap="round"/>
      ${[[40, 250], [190, 175], [330, 160]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="${C.orange}" stroke="${C.cream}" stroke-width="3"/>`).join('')}<circle cx="480" cy="70" r="10" fill="${C.cream}"/></svg>
    </div>
    <div style="padding:26px 12px 10px;display:grid;grid-template-columns:repeat(3,1fr);gap:22px 18px">
      ${stat('Subject', 'Science')}${stat('Lesson', '3 of 12')}${stat('Watched', '4 min 12 s')}${stat('Quiz', '5 / 5')}${stat('Stars', '★ ★ ★')}${stat('Streak', '7 days')}
    </div>
  </div>
  <div style="position:absolute;left:56px;top:44px">${micro('08 — Learning path', C.cream)}</div>`));

// 13 — Social split ---------------------------------------------------------------
panels.push(panel('13-social-split', 800, `
  <div style="position:absolute;left:0;top:0;width:700px;height:800px;background:#3B2A1F;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:90px 60px">
    ${hlockup(C.orange, 56, '', C.cream)}
    <div class="f" style="font-size:54px;font-weight:500;line-height:1.12;color:${C.cream};text-align:center">Look closer<br>at the stars.</div>
    ${pill('@rectify.tn', C.cream)}
  </div>
  <div style="position:absolute;left:700px;top:0;width:700px;height:800px;background:${C.sun};display:flex;align-items:center;justify-content:center">
    <div style="width:390px;background:${C.cream};box-shadow:0 30px 60px rgba(60,30,10,.25)">
      <div style="position:relative;height:380px;overflow:hidden">${photo('yellow-boy', '50% 0%', 'transform:scale(1.6);transform-origin:55% 12%')}</div>
      <div style="padding:26px 24px;display:flex;justify-content:space-between;align-items:center">${wordmark(C.ink, 50)}${face(C.orange, 60, 'happy')}</div>
    </div>
  </div>`));

// 14 — Stories ----------------------------------------------------------------------
const storyFrame = (inner) => `<div style="position:relative;width:320px;height:660px;border-radius:30px;overflow:hidden;box-shadow:0 30px 60px rgba(60,30,10,.25)">${inner}
  <div style="position:absolute;left:14px;right:14px;top:12px;display:flex;gap:4px">${[1, 0, 0].map((a) => `<div style="flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,${a ? 1 : 0.45})"></div>`).join('')}</div>
  <div style="position:absolute;left:14px;top:24px;display:flex;align-items:center;gap:8px"><div style="width:30px;height:30px;border-radius:15px;background:${C.orange};display:flex;align-items:center;justify-content:center">${symbol(C.cream, 19)}</div><span style="font:700 12px Nunito;color:#fff">rectify.tn</span><span style="font:500 12px Nunito;color:rgba(255,255,255,.7)">2h</span></div>
  <div style="position:absolute;left:14px;right:14px;bottom:16px;display:flex;align-items:center;gap:10px"><div style="flex:1;height:40px;border-radius:20px;border:1.5px solid rgba(255,255,255,.7);color:#fff;font:500 13px Nunito;display:flex;align-items:center;padding-left:16px">Send message</div><span style="color:#fff;font-size:20px">♡</span></div></div>`;
panels.push(panel('14-stories', 1000, `
  <div style="position:absolute;inset:0;background:${C.cream};display:flex;align-items:center;justify-content:center;gap:40px">
  ${storyFrame(`${photo('science', '62% 50%')}<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(28,21,17,.2),rgba(28,21,17,.75))"></div>
    <div style="position:absolute;left:22px;right:22px;bottom:90px;display:flex;flex-direction:column;gap:12px">
      <span style="align-self:flex-start;padding:5px 12px;border-radius:8px;background:${C.sun};font:800 12px Nunito;letter-spacing:.08em">QUIZ TIME</span>
      <span class="f" style="font-size:30px;font-weight:600;line-height:1.1;color:#fff">What happens when we mix the two liquids?</span>
      ${['It turns blue', 'It bubbles', 'Nothing'].map((t, i) => `<div style="padding:11px 16px;border-radius:14px;background:${i === 1 ? C.orange : 'rgba(255,255,255,.92)'};font:800 14px Nunito;color:${C.ink}">${t}</div>`).join('')}
    </div>`)}
  ${storyFrame(`${photo('girl-glasses', '50% 30%')}<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(28,21,17,.55),rgba(28,21,17,0) 40%,rgba(28,21,17,.5))"></div>
    <div style="position:absolute;left:0;right:0;top:80px;display:flex;justify-content:center">${wordmark(C.cream, 66)}</div>
    <div style="position:absolute;left:0;right:0;top:160px;text-align:center;font:800 11px Nunito;letter-spacing:.2em;color:${C.cream}">LEARN · LAUGH · LOOK CLOSER</div>`)}
  ${storyFrame(`<div style="position:absolute;inset:0;background:${C.orange}"></div>
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;padding:30px">
      ${face(C.cream, 190, 'star')}
      <span class="f" style="font-size:40px;font-weight:600;color:${C.ink}">You did it!</span>
      <span style="font:700 16px/1.4 Nunito;color:${C.ink};text-align:center">5 out of 5 correct.<br>New badge: Sky Spotter</span>
    </div>`)}
  </div>`));

// 15 — Posters ------------------------------------------------------------------------
const poster = (inner, bg) => `<div style="position:relative;width:380px;height:540px;background:${bg};overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.4)">${inner}</div>`;
panels.push(panel('15-posters', 1000, `
  <div style="position:absolute;inset:0;background:#1C1511;display:flex;align-items:center;justify-content:center;gap:34px">
  ${poster(`${photo('desk', '55% 30%')}
    <div style="position:absolute;left:24px;right:24px;top:150px;background:${C.cream};padding:22px">
      ${wordmark(C.ink, 46)}
      <div style="font:800 12px Nunito;letter-spacing:.12em;margin-top:14px">LOOK CLOSER.</div>
      <div style="font:500 11.5px/1.5 Nunito;margin-top:8px;color:#4a3e37">Short videos and playful activities in math, language and science.</div>
      <div style="display:flex;justify-content:space-between;margin-top:16px;padding-top:10px;border-top:1px solid ${C.ink};font:700 11px Nunito"><span>@rectify.tn</span><span>2026</span></div>
    </div>`, C.ink)}
  ${poster(`<div style="position:absolute;left:-60px;top:250px">${symbol(C.cream, 520)}</div>
    <div style="position:absolute;left:28px;top:30px;right:28px;display:flex;justify-content:space-between">${wordmark(C.ink, 30)}<span style="font:800 11px Nunito;letter-spacing:.12em">2026</span></div>
    <div class="f" style="position:absolute;left:28px;right:28px;top:84px;font-size:38px;font-weight:600;line-height:1.05;color:${C.ink}">Every question is a good question.</div>`, C.orange)}
  ${poster(`<div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:space-between;padding:30px 28px">
      <div style="display:flex;justify-content:space-between">${micro('Science · Lesson 3', C.ink)}${micro('4 min', C.ink)}</div>
      <div style="align-self:center">${face(C.coral, 230, 'wow')}</div>
      <div><div class="f" style="font-size:40px;font-weight:600;line-height:1.02;color:${C.ink}">Why is the sky blue?</div>
      <div style="margin-top:14px;display:flex;justify-content:space-between;align-items:center"><span style="font:800 12px Nunito">Find out on Rectify →</span>${wordmark(C.coral, 22)}</div></div>
    </div>`, C.cream)}
  </div>`));

// 16 — Merch -----------------------------------------------------------------------------
const pin = (bg, inner, s) => `<div style="width:${s}px;height:${s}px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center;box-shadow:inset 0 -6px 0 rgba(0,0,0,.18),inset 0 4px 0 rgba(255,255,255,.35),0 14px 24px rgba(60,30,10,.3)">${inner}</div>`;
panels.push(panel('16-merch', 900, `
  <div style="position:absolute;inset:0;background:${C.peach}"></div>${grain}
  <div style="position:absolute;left:120px;top:110px;width:520px;height:700px">
    <div style="position:absolute;left:140px;top:0;width:240px;height:260px;border:22px solid #e9dcc8;border-bottom:none;border-radius:120px 120px 0 0"></div>
    <div style="position:absolute;left:0;top:190px;width:520px;height:510px;background:linear-gradient(160deg,#f6eee2,#e9dcc8);box-shadow:0 40px 60px rgba(60,30,10,.25);overflow:hidden">
      <div style="position:absolute;left:50px;top:60px">${face(C.orange, 220, 'happy')}</div>
      <div class="f" style="position:absolute;left:250px;top:90px;font-size:44px;font-weight:600;line-height:1.02;color:${C.ink};transform:rotate(90deg);transform-origin:left top;left:470px">LOOK<br>CLOSER.</div>
      <div style="position:absolute;left:50px;bottom:50px;display:flex;align-items:center;gap:14px">${wordmark(C.ink, 38)}<span style="font:800 10px Nunito;letter-spacing:.14em">LEARN · LAUGH</span></div>
      ${grain}
    </div>
  </div>
  <div style="position:absolute;left:760px;top:150px;display:grid;grid-template-columns:repeat(2,220px);gap:40px">
    ${pin(C.orange, face(C.cream, 130, 'curious'), 220)}${pin(C.ink, face(C.orange, 130, 'star'), 220)}
    ${pin(C.coral, face(C.cream, 130, 'happy', 'thinking'), 220)}${pin(C.sun, face(C.ink, 130, 'wow'), 220)}
  </div>
  <div style="position:absolute;left:56px;top:44px">${micro('09 — Merch', C.ink)}</div>
  <div style="position:absolute;right:56px;bottom:44px">${micro('Tote bag · Enamel pins', C.ink)}</div>`));

// 17 — Closing -----------------------------------------------------------------------------
panels.push(panel('17-closing', 760, `
  <div style="position:absolute;inset:0;background:#1C1511;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px">
    ${face(C.orange, 220, 'happy', 'thinking')}
    <div class="f" style="font-size:72px;font-weight:600;color:${C.cream}">Thank you.</div>
    <div style="font:500 14px/1.7 Nunito;color:#a89a90;text-align:center">Photography: Unsplash — Vitaly Gariev, Fernando Galdamez, Ryan Collins, Naeem Ad<br>Typefaces: Fredoka, Nunito, Cairo (Google Fonts)</div>
  </div>`));

// ---- Render -------------------------------------------------------------------------------
async function main() {
  const only = process.argv.slice(2);
  const { chromium } = require('/opt/node22/lib/node_modules/playwright');
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const s of panels.filter((p) => !only.length || only.some((o) => p.name.startsWith(o)))) {
    const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&family=Nunito:ital,wght@0,400..900;1,400..900&family=Cairo:wght@400..800&display=swap">
<style>*{box-sizing:border-box;margin:0;padding:0}html,body{width:${s.w}px;height:${s.h}px;overflow:hidden}body{font-family:Nunito,sans-serif;color:${C.ink};-webkit-font-smoothing:antialiased}.f{font-family:Fredoka,sans-serif}.ar{font-family:Cairo,sans-serif}</style></head><body>${s.body}</body></html>`;
    const src = path.join(SRC, `${s.name}.html`);
    fs.writeFileSync(src, html);
    const p = await browser.newPage({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 2 });
    await p.goto('file://' + src);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(OUT, `${s.name}.jpg`), type: 'jpeg', quality: 88 });
    await p.close();
    console.log('rendered', s.name);
  }
  await browser.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
