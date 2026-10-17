/* RAYEN motion kit.
   A video is one TIMELINE object (see README.md). Kit.mount(TIMELINE) builds the stage;
   window.render(t) draws the frame at time t (seconds). compose.mjs drives it frame by frame. */
(function(){
  var FPS = 25;
  var SVG_NS = 'http://www.w3.org/2000/svg';

  /* ---------- helpers ---------- */
  function clamp(x){ return Math.max(0, Math.min(1, x)); }
  function ease(x){ x = clamp(x); return 1 - Math.pow(1 - x, 3); }
  function easeIO(x){ x = clamp(x); return x < .5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3) / 2; }
  function lerp(a, b, p){ return a + (b - a) * p; }
  function emph(s){ return String(s).replace(/\*(.+?)\*/g, '<em>$1</em>'); }
  function h(html){ var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
  /* guide motion: fade + small rise over 6 frames, no bounce */
  function enter(el, since, rise){
    var p = ease(since / (6 / FPS));
    el.style.opacity = since < 0 ? 0 : p;
    el.style.transform = 'translateY(' + ((1 - p) * (rise == null ? 24 : rise)) + 'px)';
  }
  function draw(path, p){ var L = path.__len || (path.__len = path.getTotalLength()); path.style.strokeDasharray = L; path.style.strokeDashoffset = L * (1 - clamp(p)); }

  var CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var ICONS = {
    logo:  '<svg viewBox="0 0 120 120"><circle cx="48" cy="60" r="34" fill="none" stroke="#93A3FF" stroke-width="5"/><rect x="58" y="26" width="40" height="68" rx="6" fill="#E9E8E3"/></svg>',
    color: '<svg viewBox="0 0 120 120"><circle cx="60" cy="40" r="24" fill="#E9E8E3"/><circle cx="40" cy="76" r="24" fill="#2D4BF0"/><circle cx="80" cy="76" r="24" fill="none" stroke="#93A3FF" stroke-width="5"/></svg>',
    type:  '<svg viewBox="0 0 120 120"><text x="60" y="84" text-anchor="middle" font-family="Alexandria" font-weight="800" font-size="72" fill="#E9E8E3">أب</text></svg>',
    voice: '<svg viewBox="0 0 120 120"><rect x="18" y="26" width="84" height="56" rx="14" fill="none" stroke="#E9E8E3" stroke-width="5"/><path d="M40 82 L34 100 L58 82" fill="#E9E8E3"/><rect x="34" y="46" width="52" height="6" rx="3" fill="#93A3FF"/><rect x="34" y="58" width="34" height="6" rx="3" fill="#93A3FF"/></svg>',
    target:'<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="44" fill="none" stroke="#E9E8E3" stroke-width="5"/><circle cx="60" cy="60" r="24" fill="none" stroke="#93A3FF" stroke-width="5"/><circle cx="60" cy="60" r="8" fill="#2D4BF0"/></svg>',
    price: '<svg viewBox="0 0 120 120"><path d="M20 90 L46 62 L64 76 L100 34" fill="none" stroke="#93A3FF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M80 34 H100 V54" fill="none" stroke="#E9E8E3" stroke-width="6" stroke-linecap="round"/></svg>'
  };

  /* ---------- components: each returns {el, update(local, dur)} ---------- */
  var C = {};

  /* card: variant title | tiles | solid | end */
  C.card = function(o){
    var v = o.variant || 'title', el, parts = [];
    if (v === 'title') {
      el = h('<div class="center c-title">' + (o.tag ? '<span class="pill"><i></i>' + o.tag + '</span>' : '') +
        '<h2>' + o.title.match(/\*[^*]+\*|\S+/g).map(function(w){ return '<span>' + emph(w) + '</span>'; }).join(' ') + '</h2>' +
        (o.sub ? '<p>' + emph(o.sub) + '</p>' : '') + '</div>');
      return { el: el, update: function(t){
        var pill = el.querySelector('.pill'); if (pill) enter(pill, t, 16);
        var ws = el.querySelectorAll('h2 span');
        ws.forEach(function(w, i){ enter(w, t - 0.12 - i * 0.09, 30); });
        var p = el.querySelector('p'); if (p) enter(p, t - 0.25 - ws.length * 0.09, 16);
      }};
    }
    if (v === 'tiles') {
      el = h('<div class="center c-tiles">' + (o.tag ? '<span class="pill"><i></i>' + o.tag + '</span>' : '') + '<div class="row">' +
        o.items.map(function(it){ return '<div class="tile' + (it.hi ? ' hi' : '') + '">' + (ICONS[it.icon] || '') + '<b>' + it.label + '</b></div>'; }).join('') + '</div></div>');
      return { el: el, update: function(t){
        var pill = el.querySelector('.pill'); if (pill) enter(pill, t, 16);
        var step = o.step || 0.35;
        el.querySelectorAll('.tile').forEach(function(tl, i){ enter(tl, t - 0.15 - i * step, 40); });
      }};
    }
    /* solid + end share the cobalt panel */
    el = h('<div class="c-solid"><div class="panel">' + (o.tag ? '<div class="tag">' + o.tag + '</div>' : '') +
      '<h2>' + emph(o.title) + '</h2>' + (o.by ? '<p class="by">' + o.by + '</p>' : '') + (v === 'end' ? '<div class="mark">RAYEN</div>' : '') + '</div></div>');
    return { el: el, update: function(t){
      var panel = el.querySelector('.panel'), p = ease(t / 0.3);
      panel.style.opacity = p; panel.style.transform = 'scale(' + lerp(.94, 1, p) + ')';
      enter(el.querySelector('h2'), t - 0.15, 30);
      var by = el.querySelector('.by'); if (by) enter(by, t - 0.45, 16);
      var mk = el.querySelector('.mark'); if (mk) enter(mk, t - 0.7, 16);
    }};
  };

  /* grid: construction lines → two circles → the mark fills in (logo built in front of the viewer) */
  C.grid = function(o){
    var r = 150, d = 120, half = Math.sqrt(r*r - (d/2)*(d/2));
    var cx = 450, cy = 290, lines = '';
    for (var x = 30; x <= 870; x += 60) lines += '<line class="gl" x1="' + x + '" y1="40" x2="' + x + '" y2="540"/>';
    for (var y = 50; y <= 530; y += 60) lines += '<line class="gl" x1="0" y1="' + y + '" x2="900" y2="' + y + '"/>';
    var lens = 'M0 ' + (-half) + ' A' + r + ' ' + r + ' 0 0 1 0 ' + half + ' A' + r + ' ' + r + ' 0 0 1 0 ' + (-half) + ' Z';
    var el = h('<div class="c-grid"><svg viewBox="0 0 900 600">' +
      '<g class="lines">' + lines + '</g>' +
      '<g transform="translate(' + cx + ' ' + cy + ') rotate(-38)">' +
        '<path class="ax a1" d="M-300 0 H300"/><path class="ax a2" d="M0 -230 V230"/>' +
        '<path class="cc c1" d="M' + (-d/2 + r) + ' 0 A' + r + ' ' + r + ' 0 1 1 ' + (-d/2 - r) + ' 0 A' + r + ' ' + r + ' 0 1 1 ' + (-d/2 + r) + ' 0"/>' +
        '<path class="cc c2" d="M' + (d/2 - r) + ' 0 A' + r + ' ' + r + ' 0 1 0 ' + (d/2 + r) + ' 0 A' + r + ' ' + r + ' 0 1 0 ' + (d/2 - r) + ' 0"/>' +
        '<path class="lens" d="' + lens + '"/>' +
        '<circle class="pt p1" cx="0" cy="' + (-half) + '" r="9"/><circle class="pt p2" cx="0" cy="' + half + '" r="9"/>' +
      '</g></svg>' + (o.tag ? '<span class="pill"><i></i>' + o.tag + '</span>' : '') + (o.label ? '<div class="lab">' + emph(o.label) + '</div>' : '') + '</div>');
    return { el: el, update: function(t, dur){
      var k = Math.min(1, (dur || 6) / 5.5); /* compress the build into short scenes */
      el.querySelector('.lines').style.opacity = ease(t / (0.4 * k)) ;
      draw(el.querySelector('.a1'), (t - 0.3*k) / (0.6*k)); draw(el.querySelector('.a2'), (t - 0.45*k) / (0.6*k));
      draw(el.querySelector('.c1'), (t - 0.7*k) / (0.9*k)); draw(el.querySelector('.c2'), (t - 1.1*k) / (0.9*k));
      var pts = ease((t - 2.0*k) / (0.25*k));
      el.querySelectorAll('.pt').forEach(function(p){ p.style.opacity = pts; });
      var lp = ease((t - 2.3*k) / (0.5*k)), lens = el.querySelector('.lens');
      lens.style.opacity = lp; lens.style.transform = 'scale(' + lerp(.6, 1, lp) + ')';
      var dim = ease((t - 3.0*k) / (0.5*k));
      el.querySelectorAll('.cc,.ax').forEach(function(c){ c.style.opacity = 1 - dim * .6; });
      var pill = el.querySelector('.pill'); if (pill) enter(pill, t, 16);
      var lab = el.querySelector('.lab'); if (lab) enter(lab, t - 3.0*k, 16);
    }};
  };

  /* counter: number counts up, tiles light up with it */
  C.counter = function(o){
    var n = o.tiles == null ? Math.min(o.to, 40) : o.tiles;
    var el = h('<div class="center c-count">' + (o.tag ? '<span class="pill"><i></i>' + o.tag + '</span>' : '') +
      '<div class="num">' + (o.prefix ? '<em>' + o.prefix + '</em>' : '') + '<span>0</span>' + (o.suffix ? '<em>' + o.suffix + '</em>' : '') + '</div>' +
      (o.label ? '<div class="lab">' + emph(o.label) + '</div>' : '') +
      (n ? '<div class="tiles">' + new Array(n + 1).join('<i></i>') + '</div>' : '') + '</div>');
    return { el: el, update: function(t){
      var pill = el.querySelector('.pill'); if (pill) enter(pill, t, 16);
      enter(el.querySelector('.num'), t, 30);
      var p = easeIO((t - 0.2) / (o.time || 1.4)), from = o.from || 0;
      el.querySelector('.num span').textContent = Math.round(lerp(from, o.to, p));
      var lab = el.querySelector('.lab'); if (lab) enter(lab, t - 0.2, 16);
      var tiles = el.querySelectorAll('.tiles i'), lit = Math.round(tiles.length * p);
      tiles.forEach(function(tl, i){ tl.classList.toggle('on', i < lit); });
      var tw = el.querySelector('.tiles'); if (tw) enter(tw, t - 0.1, 16);
    }};
  };

  /* compare: mode "text" (two columns) or "wipe" (before image, cobalt bar reveals after) */
  C.compare = function(o){
    var tag = o.tag ? '<div class="head"><span class="pill"><i></i>' + o.tag + '</span></div>' : '';
    if (o.mode === 'wipe') {
      function layer(x){ return x.src ? '<img src="' + x.src + '" alt="">' : x.html; }
      var el = h('<div class="c-wipe">' + tag + '<div class="frame">' +
        '<div class="layer before">' + layer(o.before) + '</div><div class="layer after">' + layer(o.after) + '</div>' +
        '<div class="bar"></div><span class="lbl b">' + (o.before.label || 'قبل') + '</span><span class="lbl a">' + (o.after.label || 'بعد') + '</span></div></div>');
      return { el: el, update: function(t, dur){
        var head = el.querySelector('.head'); if (head) enter(head, t, 16);
        var at = o.revealAt == null ? (dur || 4) * 0.45 : o.revealAt, p = easeIO((t - at) / 0.6);
        var w = 900 * p; /* reveal from the right edge (RTL reading start) */
        el.querySelector('.after').style.clipPath = 'inset(0 0 0 ' + (900 - w) + 'px)';
        var bar = el.querySelector('.bar'); bar.style.left = (900 - w - 3) + 'px'; bar.style.opacity = p > 0 && p < 1 ? 1 : 0;
        el.querySelector('.lbl.a').style.opacity = ease((t - at - 0.5) / 0.2);
        el.querySelector('.lbl.b').style.opacity = 1 - ease((t - at) / 0.2);
        var f = el.querySelector('.frame'), fp = ease(t / 0.25); f.style.opacity = fp; f.style.transform = 'scale(' + lerp(.96, 1, fp) + ')';
      }};
    }
    function col(c, cls){ return '<div class="col ' + cls + '"><h3>' + c.label + '</h3>' + c.items.map(function(it){
      return '<div class="it"><span class="mk">' + (cls === 'after' ? CHECK : '') + '</span>' + emph(it) + (cls === 'before' ? '<span class="x"></span>' : '') + '</div>'; }).join('') + '</div>'; }
    var el2 = h('<div class="c-cmp">' + tag + '<div class="cols">' + col(o.before, 'before') + col(o.after, 'after') + '</div></div>');
    return { el: el2, update: function(t, dur){
      var head = el2.querySelector('.head'); if (head) enter(head, t, 16);
      var at = o.afterAt == null ? (dur || 5) * 0.4 : o.afterAt;
      var b = el2.querySelector('.before'), a = el2.querySelector('.after');
      enter(b, t, 30); enter(a, t - at, 30);
      b.querySelectorAll('.it').forEach(function(it, i){
        enter(it, t - 0.15 - i * 0.2, 12);
        it.querySelector('.x').style.width = (ease((t - at + 0.1 - i * 0.12) / 0.3) * 260) + 'px';
      });
      a.querySelectorAll('.it').forEach(function(it, i){ enter(it, t - at - 0.15 - i * 0.25, 12); });
    }};
  };

  /* method: steps on a line; the active step is cobalt and named large below */
  C.method = function(o){
    var n = o.steps.length, x0 = 820, x1 = 80, y = 70;
    var xs = o.steps.map(function(_, i){ return n === 1 ? 450 : x0 + (x1 - x0) * i / (n - 1); });
    var nodes = o.steps.map(function(s, i){
      return '<g class="node" transform="translate(' + xs[i] + ' ' + y + ')"><circle r="52"/><text>' + (s.n || ('0' + (i + 1))) + '</text><text class="nm" y="100">' + s.name + '</text></g>'; }).join('');
    var el = h('<div class="c-method">' + (o.tag ? '<span class="pill"><i></i>' + o.tag + '</span>' : '') +
      '<svg viewBox="0 0 900 220"><line class="base" x1="' + x0 + '" y1="' + y + '" x2="' + x1 + '" y2="' + y + '"/><line class="prog" x1="' + x0 + '" y1="' + y + '" x2="' + x0 + '" y2="' + y + '"/>' + nodes + '</svg>' +
      '<div class="big"><b></b><p></p></div></div>');
    return { el: el, update: function(t, dur){
      var pill = el.querySelector('.pill'); if (pill) enter(pill, t, 16);
      var at = o.steps.map(function(s, i){ return s.at != null ? s.at : (dur || 8) * i / n; });
      var cur = -1; at.forEach(function(a, i){ if (t >= a) cur = i; });
      var gs = el.querySelectorAll('.node');
      gs.forEach(function(g, i){
        g.classList.toggle('on', i === cur); g.classList.toggle('done', i < cur);
        var s = i === cur ? lerp(1.25, 1.12, ease((t - at[i]) / 0.25)) : 1;
        g.setAttribute('transform', 'translate(' + xs[i] + ' ' + y + ') scale(' + s + ')');
        g.style.opacity = ease((t - i * 0.08) / 0.2);
      });
      var px = cur < 0 ? x0 : lerp(cur > 0 ? xs[cur - 1] : x0, xs[cur], ease((t - at[cur]) / 0.3));
      el.querySelector('.prog').setAttribute('x2', px);
      var big = el.querySelector('.big');
      if (cur >= 0) {
        if (big.dataset.k !== String(cur)) { big.querySelector('b').textContent = o.steps[cur].name; big.querySelector('p').textContent = o.steps[cur].desc || ''; big.dataset.k = cur; }
        enter(big, t - at[cur], 30);
      } else big.style.opacity = 0;
    }};
  };

  /* ---------- layouts ---------- */
  var LAYOUT = {
    split:   { card: {x:90, y:830,  w:900,  h:910,  r:44}, zone: {cy:510, s:1,    o:1}, sub: 1390 },
    full:    { card: {x:0,  y:0,    w:1080, h:1920, r:0 }, zone: {cy:510, s:1,    o:0}, sub: 1260 },
    graphic: { card: {x:90, y:1990, w:900,  h:910,  r:44}, zone: {cy:860, s:1.18, o:1}, sub: 1330 },
    pip:     { card: {x:90, y:1130, w:340,  h:420,  r:34}, zone: {cy:620, s:1.08, o:1}, sub: 1260, subLeft: 470 }
  };
  var MOVE = 0.32; /* seconds to animate between layouts */

  function geomAt(tl, t){
    var L = tl.layout || [[0, 'split']], i = 0;
    for (var k = 0; k < L.length; k++) if (t >= L[k][0]) i = k;
    var cur = LAYOUT[L[i][1]], prev = i > 0 ? LAYOUT[L[i - 1][1]] : cur, p = easeIO((t - L[i][0]) / MOVE);
    function mix(a, b){ var o = {}; for (var key in b) o[key] = lerp(a[key], b[key], p); return o; }
    return { card: mix(prev.card, cur.card), zone: mix(prev.zone, cur.zone), sub: p < .5 ? prev : cur, name: L[i][1] };
  }

  /* ---------- mount ---------- */
  window.Kit = { mount: function(TL){
    var stage = document.getElementById('stage');
    stage.innerHTML = '<div class="bg"><div class="grid"></div><div class="glow"></div></div><div class="zone"></div>' +
      '<div class="card"><div class="inner"><div class="ph"><div class="lamp"></div><div class="back"></div>' +
      '<svg viewBox="0 0 100 140"><circle cx="50" cy="30" r="15"/><path d="M4 140 C6 78 28 54 50 54 C72 54 94 78 96 140 Z"/></svg><span class="slate">● A-ROLL</span></div></div></div>' +
      '<div class="subs"></div>';
    var zone = stage.querySelector('.zone'), card = stage.querySelector('.card'), inner = card.querySelector('.inner'), subs = stage.querySelector('.subs');
    /* footage = a frame-pattern like 'frames/f_{n}.jpg' (compose.mjs sets it when you pass --footage) */
    var footage = window.__FOOTAGE || TL.footage, img = null;
    if (footage) { img = document.createElement('img'); inner.innerHTML = ''; inner.appendChild(img); }

    var G = (TL.graphics || []).map(function(g){
      var c = C[g.type](g); c.el.classList.add('g'); zone.appendChild(c.el); c.def = g; return c;
    });

    window.render = function(t){
      var geo = geomAt(TL, t), c = geo.card, z = geo.zone;
      card.style.left = c.x + 'px'; card.style.top = c.y + 'px'; card.style.width = c.w + 'px'; card.style.height = c.h + 'px'; card.style.borderRadius = c.r + 'px';
      /* the footage is a 1080×1920 frame scaled to cover the card; punch-ins scale it further */
      var zoom = 1; (TL.zoom || []).forEach(function(zz){ if (t >= zz[0]) zoom = zz[1]; });
      var cover = Math.max(c.w / 1080, c.h / 1920) * zoom;
      inner.style.transform = 'translate(-50%,-50%) scale(' + cover + ')';
      inner.style.transformOrigin = '50% 40%';
      zone.style.top = (z.cy - 300) + 'px'; zone.style.opacity = z.o; zone.style.transform = 'scale(' + z.s + ')';

      G.forEach(function(g){
        var on = t >= g.def.t0 && t < g.def.t1;
        g.el.classList.toggle('on', on);
        if (on) g.update(t - g.def.t0, g.def.t1 - g.def.t0);
      });

      var cue = null; (TL.subs || []).forEach(function(s){ if (t >= s[0] && t < s[1]) cue = s; });
      var sp = geo.sub;
      subs.style.top = sp.sub + 'px';
      subs.style.left = (sp.subLeft || 120) + 'px'; subs.style.textAlign = sp.subLeft ? 'right' : 'center';
      if (!cue) { subs.innerHTML = ''; subs.dataset.k = ''; }
      else {
        if (subs.dataset.k !== String(cue[0])) { subs.innerHTML = emph(cue[2]); subs.dataset.k = cue[0]; }
        enter(subs, t - cue[0], 20);
      }
      if (img) {
        var src = footage.replace('{n}', String(Math.floor(t * FPS + 1e-6) + 1).padStart(5, '0'));
        if (img.getAttribute('src') !== src) img.setAttribute('src', src);
      }
    };
    window.frameReady = function(){ return img && img.getAttribute('src') ? img.decode().catch(function(){}) : Promise.resolve(); };
    window.FPS = FPS; window.DURATION = TL.duration;

    /* browser preview: real-time loop, scaled to the window; ?t=12 freezes a frame */
    if (!navigator.webdriver) {
      var q = new URLSearchParams(location.search);
      document.documentElement.style.cssText = 'width:auto;height:auto;background:#000';
      document.body.style.cssText = 'width:100vw;height:100vh;overflow:hidden;background:#000;position:relative';
      var k = Math.min(innerHeight / 1920, innerWidth / 1080);
      stage.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(' + k + ')';
      if (q.has('t')) render(parseFloat(q.get('t')));
      else { var st = performance.now(); (function loop(){ render(((performance.now() - st) / 1000) % TL.duration); requestAnimationFrame(loop); })(); }
    }
  }};
})();
