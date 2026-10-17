// Muscle Stock mockup kit: small builders for packaging used across scenes.
const LOGO = '../../assets/logo/';
const LINES = {
  performance: { accent: '#BC3333', lid: '#BC3333', name: 'Performance' },
  recovery:    { accent: '#2F55C9', lid: '#1F3A93', name: 'Recovery' },
  essentials:  { accent: '#F2EEE7', lid: '#E7E2D9', name: 'Essentials' },
};

function el(tag, attrs = {}, html = '') {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'style' && typeof v === 'object') {
      for (const [prop, val] of Object.entries(v)) {
        if (prop.startsWith('--')) n.style.setProperty(prop, val);
        else n.style[prop] = val;
      }
    }
    else n.setAttribute(k, v);
  }
  n.innerHTML = html;
  return n;
}

// A matte black supplement tub. w = width in px; height follows the 1 : 1.32 tub ratio
// (short = true gives a squat creatine jar).
function tub(parent, { x, y, w, line = 'performance', product = 'WHEY', variant = 'ISOLATE', flavour = 'CHOCOLAT', weight = '2,27 KG', short = false }) {
  const L = LINES[line];
  const h = Math.round(w * (short ? 1.0 : 1.32));
  const s = w / 360; // type scale relative to the 360px design
  const dark = line === 'essentials' ? '#1D1D1B' : '#F2EEE7';
  const t = el('div', { class: 'tub', style: { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px', '--lid': L.lid, '--body': '#161615', '--accent': L.accent } });
  t.innerHTML = `
    <div class="lid"><div class="cyl-shade soft" style="border-radius:14px 14px 8px 8px"></div></div>
    <div class="neck"></div>
    <div class="body">
      <div class="band" style="top:76%;height:12%"></div>
      <div class="band thin" style="top:91%"></div>
      <div class="label" style="padding-top:${(short ? 2 : 4) * s}px">
        <img src="${LOGO}icon-color.png" style="width:${(short ? 70 : 92) * s}px;height:auto">
        <img src="${LOGO}wordmark-white.png" style="width:${170 * s}px;height:auto;margin-top:${12 * s}px;opacity:.95">
        <div class="eyebrow" style="font-size:${9.5 * s}px;color:${L.accent === '#F2EEE7' ? '#cfc9bf' : L.accent};margin-top:${(short ? 8 : 14) * s}px;letter-spacing:.3em">${L.name}</div>
        <div class="display" style="font-size:${(short ? 52 : 74) * s}px;color:#F2EEE7;margin-top:${4 * s}px">${product}</div>
        <div class="display" style="font-size:${(short ? 26 : 34) * s}px;color:#F2EEE7;opacity:.9">${variant}</div>
      </div>
      <div class="abs display" style="left:0;right:0;top:${short ? 77.5 : 78.2}%;text-align:center;font-size:${(short ? 22 : 26) * s}px;color:${dark};transform:skewY(-7deg)">${flavour}</div>
      <div class="abs" style="left:0;right:0;bottom:2.2%;text-align:center;font:700 ${10 * s}px Roboto;letter-spacing:.24em;color:#bdb8ae">${weight}</div>
      <div class="cyl-shade"></div>
    </div>`;
  parent.appendChild(t);
  return { el: t, h };
}

function shadowUnder(parent, x, y, w, k = 0.22) {
  parent.appendChild(el('div', { class: 'contact-shadow', style: { left: (x - w * 0.12) + 'px', top: (y - w * k * 0.5) + 'px', width: (w * 1.24) + 'px', height: (w * k) + 'px' } }));
}

// Mirror an element below itself for a glossy floor reflection.
function reflect(parent, node, x, y, h, opacity = 0.16) {
  const r = node.cloneNode(true);
  r.style.left = x + 'px';
  r.style.top = (y + 2 * h) + 'px';
  r.style.transform = 'scaleY(-1)';
  r.style.transformOrigin = 'top';
  r.style.opacity = opacity;
  r.style.webkitMaskImage = 'linear-gradient(0deg, rgba(0,0,0,0) 55%, rgba(0,0,0,1) 100%)';
  r.style.maskImage = r.style.webkitMaskImage;
  parent.insertBefore(r, parent.firstChild.nextSibling);
}

function pouch(parent, { x, y, w, product = 'CRÉATINE', variant = 'MONOHYDRATE', weight = '500 G', line = 'performance' }) {
  const L = LINES[line];
  const h = Math.round(w * 1.45), s = w / 320;
  const p = el('div', { class: 'pouch', style: { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px', '--body': '#EDE8E0' } });
  p.innerHTML = `
    <div class="bag">
      <div class="seal"></div><div class="zip"></div>
      <div class="abs" style="left:-10%;right:-10%;top:52%;height:20%;background:${L.accent};transform:skewY(-7deg)"></div>
      <div class="abs" style="left:0;right:0;top:14%;display:flex;flex-direction:column;align-items:center;text-align:center">
        <img src="${LOGO}icon-color.png" style="width:${84 * s}px">
        <img src="${LOGO}wordmark-black.png" style="width:${160 * s}px;margin-top:${12 * s}px">
        <div class="eyebrow" style="font-size:${9 * s}px;color:${L.accent};margin-top:${16 * s}px;letter-spacing:.3em">${L.name}</div>
      </div>
      <div class="abs display" style="left:0;right:0;top:54.5%;text-align:center;font-size:${66 * s}px;color:#F2EEE7;transform:skewY(-7deg)">${product}</div>
      <div class="abs display" style="left:0;right:0;top:76%;text-align:center;font-size:${30 * s}px;color:#1D1D1B">${variant}</div>
      <div class="abs" style="left:0;right:0;bottom:6%;text-align:center;font:700 ${11 * s}px Roboto;letter-spacing:.24em;color:#55524c">${weight} · POUDRE PURE</div>
      <div class="shade"></div>
    </div>`;
  parent.appendChild(p);
  return { el: p, h };
}

function stick(parent, { x, y, w, h, rot = 0, line = 'performance', label = 'PRE-WORKOUT' }) {
  const L = LINES[line];
  const st = el('div', { class: 'stick', style: { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px', '--body': '#161615', transform: `rotate(${rot}deg)`, boxShadow: '0 18px 30px rgba(0,0,0,.5)' } });
  st.innerHTML = `
    <div class="abs" style="left:0;right:0;top:12%;bottom:12%;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:${w * 0.18}px 0">
      <img src="${LOGO}icon-color.png" style="width:${w * 0.62}px">
      <div class="display" style="writing-mode:vertical-rl;transform:rotate(180deg);font-size:${w * 0.36}px;color:#F2EEE7;font-style:italic">${label}</div>
      <div style="width:100%;height:${w * 0.16}px;background:${L.accent}"></div>
    </div>
    <div class="cyl-shade soft"></div>`;
  parent.appendChild(st);
}
