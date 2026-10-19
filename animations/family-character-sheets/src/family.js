// family.js: the six members of the family from the barbecue illustration, painted with the kit's tools.
//
//   person(x, y, u, who, o)   (x, y) = the ground point between the feet; u = the size unit (the head's half-height)
//
// Like Clawd, characters turn through drawn KEY VIEWS (front, q, side, qback, back), never a projected 3D turn. Every view
// faces screen-right; flip: true mirrors it. Limbs are tapered ribbons through shoulder → elbow → wrist (hip → knee →
// ankle), posed with screen-plane angles: 0 = straight down, +π/2 = forward (the way the character faces), ±π = up.
//
// Options (all optional):
//   view, flip, dy (u; + = down), lean (rad, about the hips), tilt (rad, the head about the neck)
//   arms: [arm0, arm1]   arm0 is the screen-left arm in the front view, which is the NEAR arm in the q and side views.
//                        Each arm is [a, e, hand?, prop?] (a = upper arm angle, e = elbow bend) or
//                        { to: [x, y] | 'mouth' | 'chin' | 'cheek0' | 'cheek1' | 'hip0' | 'hip1' | 'chest', bend: ±1, hand, prop }
//   legs: [leg0, leg1]   [a, k]: thigh angle and knee bend (negative k folds the shin back)
//   face: { eyes, mouth, brows: { r, t, a: [l, r] }, blush, tint, tintK, lookX, lookY } (see FACES)
//   emote, chair, bust (just head and shoulders; (x, y) is then the bottom of the bust)

// ---------- the cast ----------
const ADULT = { leg: 3.45, torso: 2.9, neck: .36, rx: .86, ry: 1, jaw: .22, ua: 1.5, fa: 1.4, aw: .44, lw: .56, hand: .24, foot: .72,
                nw: .3, er: .17, ex: .37, ey: -.02, my: .55, mw: 1, vol: .14, len: 0, flare: 0 };
const KID = { leg: 2.05, torso: 1.85, neck: .22, rx: .9, ry: 1, jaw: .14, ua: .98, fa: .88, aw: .36, lw: .44, hand: .2, foot: .56,
              nw: .24, er: .25, ex: .4, ey: .05, my: .56, mw: .88, vol: .14, len: 0, flare: 0 };
const CAST = {
  girl: { ...KID, name: 'Girl', sc: .93, S: .92, Wd: .8, Hp: .84,
    skin: '#EBA582', hair: '#7A3A2C', style: 'bun', eye: '#6B3F22', lashes: true, blush: .45,
    top: '#F7D3D8', topDk: '#DDA7B2', sleeve: .36, neckline: 'round',
    dress: '#5E6FB8', dressDk: '#46559A', skirt: .78, skirtOver: true, bib: true, sock: '#FFF5E2', shoe: '#C8323C' },
  boy: { ...KID, name: 'Boy', sc: 1, S: .98, Wd: .88, Hp: .86, vol: .17,
    skin: '#F1B08C', hair: '#83492F', style: 'fringe', eye: '#4A2C1E', blush: .35,
    top: '#D7A0DA', topDk: '#B47DBB', sleeve: .4, neckline: 'round',
    pants: '#5677B3', pantsDk: '#3F5C94', pantsLen: .6, shoe: '#3A9C98' },
  mom: { ...ADULT, name: 'Mom', sc: .97, S: 1.3, Wd: 1.0, Hp: 1.25, jaw: .26, nw: .27, vol: .2, len: 1.85, flare: .3,
    skin: '#E9A47F', hair: '#7C4031', style: 'long', eye: '#5A3420', lashes: true, blush: .3,
    top: '#B99CD8', topDk: '#9478BE', print: '#DCCBF0', sleeve: .7, neckline: 'collar',
    pants: '#40507F', pantsDk: '#2F3C66', pantsLen: 1, shoe: '#9A4A5E' },
  dad: { ...ADULT, name: 'Dad', sc: 1.06, S: 1.72, Wd: 1.45, Hp: 1.32, rx: .9, jaw: .1, aw: .54, lw: .64, hand: .27, nw: .42, noseS: 1.25, vol: .16,
    skin: '#F2B596', hair: '#6E3D2C', style: 'part', curl: true, eye: '#3A2418', blush: .15,
    top: '#A5DADB', topDk: '#7DBFC1', inner: '#E8F5F2', sleeve: .97, neckline: 'vneck', hem: true,
    pants: '#34466F', pantsDk: '#26355A', pantsLen: 1, shoe: '#6B4430' },
  grandma: { ...ADULT, name: 'Grandma', sc: .92, S: 1.35, Wd: 1.28, Hp: 1.38, jaw: .2, nw: .28, vol: .3, len: .88, flare: .1, age: .6,
    skin: '#F5C3A6', hair: '#F2E0B2', hairDk: '#CFB57C', brow: '#C6A770', style: 'bob', eye: '#4A3A2A', lashes: true, blush: .45,
    top: '#E9B9D6', topDk: '#CF94BA', stripe: '#F7DCEB', sleeve: .95, neckline: 'round',
    dress: '#8F5D87', dressDk: '#734670', skirt: 1.32, shoe: '#5A3C4A' },
  grandpa: { ...ADULT, name: 'Grandpa', sc: .96, S: 1.55, Wd: 1.45, Hp: 1.36, rx: .9, jaw: .18, nw: .33, noseS: 1.4, age: 1,
    skin: '#F2B48F', hair: '#D3CDD2', hairDk: '#9C95A0', brow: '#B8B2B8', bushy: true, style: 'bald', eye: '#2F7F78', blush: .2,
    glasses: '#5B3A90', top: '#C3DEF2', topDk: '#94BADA', sleeve: .97, neckline: 'collar', buttons: true,
    pants: '#6F6B7C', pantsDk: '#56525F', pantsLen: 1, shoe: '#4E3A30' },
};
for (const C of Object.values(CAST)) {
  C.skinDk = mixCol(C.skin, '#8A3E34', .32);
  C.hairDk = C.hairDk || mixCol(C.hair, PAL.ink, .32);
  C.brow = C.brow || C.hairDk;
  C.hairLt = mixCol(C.hair, '#FFF3DC', .35);
}

// ---------- views ----------
//   tw: torso width.  hx: head offset (the neck leans forward in profile).  face: where the features go (a front-view
//   x maps to fc + x·fw, and to fc + x·fw·far on the far side; show = which eyes are visible).
//   arms / legs: [x as a fraction of shoulder / hip width, layer or far]; arm layer 0 = behind the body, 1 = in front.
const PV = {
  front: { tw: 1, hx: 0, face: { fc: 0, fw: 1, far: 1, show: [-1, 1], ew: [1, 1], mw: 1 }, arms: [[-1, 1], [1, 1]], legs: [[-.5, 0], [.5, 0]] },
  q:     { tw: .86, hx: .06, face: { fc: .3, fw: .72, far: .74, show: [-1, 1], ew: [.92, .7], mw: .82 }, arms: [[-.84, 1], [.66, 0]], legs: [[-.4, 0], [.44, 1]] },
  side:  { tw: .6, hx: .16, face: { fc: .6, fw: .36, far: 0, show: [-1], ew: [.62, 0], mw: .5 }, arms: [[-.04, 1], [.1, 0]], legs: [[-.04, 0], [.12, 1]] },
  qback: { tw: .86, hx: .02, face: null, back: true, arms: [[.84, 1], [-.66, 0]], legs: [[.4, 0], [-.44, 1]] },
  back:  { tw: 1, hx: 0, face: null, back: true, arms: [[1, 1], [-1, 1]], legs: [[.5, 0], [-.5, 0]] },
};
const EARS = { front: [[-1, .08], [1, .08]], q: [[-.36, .08]], side: [[-.12, .08]], qback: [[.52, .1]], back: [[-1, .1], [1, .1]] };
const DEF_ARMS = { front: [[-.13, .14], [.13, -.14]], q: [[.04, .2], [.1, .22]], side: [[.04, .22], [.1, .24]], qback: [[.04, .16], [.1, .2]], back: [[.13, -.14], [-.13, .14]] };
const DEF_LEGS = { front: [[-.04, 0], [.04, 0]], back: [[.04, 0], [-.04, 0]], q: [[.03, 0], [-.02, 0]], side: [[.03, 0], [-.02, 0]], qback: [[.03, 0], [-.02, 0]] };
const FACE_TINT = { flush: '#E2463E', pale: '#F2EEE6', green: '#A9BF78' };

const dirv = a => [Math.sin(a), Math.cos(a)];
const vadd = (p, d, k = 1) => [p[0] + d[0] * k, p[1] + d[1] * k];
// The part of a path between fractions f0 and f1 of its length (for sleeves, trouser legs and socks).
function cutSeg(P, f0, f1) {
  const C = through(P, 8), L = [0];
  for (let i = 1; i < C.length; i++) L.push(L[i - 1] + Math.hypot(C[i][0] - C[i - 1][0], C[i][1] - C[i - 1][1]));
  const tot = L[L.length - 1] || 1, at = d => { let i = 1; while (i < L.length - 1 && L[i] < d) i++; const k = (d - L[i - 1]) / ((L[i] - L[i - 1]) || 1); return [lerp(C[i - 1][0], C[i][0], k), lerp(C[i - 1][1], C[i][1], k)]; };
  const out = [at(f0 * tot)]; for (let i = 0; i < C.length; i++) if (L[i] > f0 * tot && L[i] < f1 * tot) out.push(C[i]); out.push(at(f1 * tot));
  return out;
}
// Two-bone reach: the arm angles [a, e] that put the wrist at `to` from shoulder `sh` (bend ±1 picks the elbow side).
function reach(sh, to, l1, l2, bend = 1) {
  const dx = to[0] - sh[0], dy = to[1] - sh[1], d = clamp(Math.hypot(dx, dy), Math.abs(l1 - l2) + .01, l1 + l2 - .01);
  const phi = Math.atan2(dx, dy), al = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), a = phi + bend * al;
  const E = vadd(sh, dirv(a), l1); return [a, Math.atan2(to[0] - E[0], to[1] - E[1]) - a];
}

// ---------- the person ----------
function person(x, y, u, who, o = {}) {
  const C = CAST[who], U = u * C.sc, vn = PV[o.view] ? o.view : 'front', V = PV[vn];
  const id = o.boilKey ?? 'p' + (++CLAWD_N), rs = k => boilSeed(`person ${id} ${k}`);
  const sw = clamp(U / 70, .3, 1.15), P = pts => pts.map(([a, b]) => [a * U, b * U]);
  const f = { ...(o.face || {}) };
  f.skinNow = f.tint ? mixCol(C.skin, FACE_TINT[f.tint] || f.tint, f.tintK ?? .3) : C.skin;
  const TL = C.torso, hipY = -(C.leg + .2), tw = V.tw;
  const head = [V.hx, -(TL + C.neck + C.ry * .9)];
  const bust = !!o.bust, dy = o.dy || 0;

  rs('shadow');
  if (!bust && !o.noShadow) {
    const k = 1 - Math.min(.45, Math.max(0, -dy) * .12), w = (C.Hp * tw + .9 + (o.chair ? .6 : 0)) * U * k;
    paint(ellPts(x + (o.chair ? -.2 * U : 0), y + .05 * U, w, .3 * U * k, 22), { fill: PAL.ink, fillOp: 80, bleed: .25, tex: .3, border: .1, ink: null });
  }

  push();
  translate(x, y + (bust ? (TL - 1.3 - hipY) * U : dy * U)); scale(o.flip ? -1 : 1, 1);
  if (o.chair && !bust) { rs('chair'); chair(C, hipY, -dy, U, sw); }

  // legs (base frame: hip centre at (0, hipY))
  const legSpec = o.legs || DEF_LEGS[vn], legs = V.legs.map(([lx, far], i) => {
    const [a, k] = legSpec[i] || [0, 0], hip = [lx * C.Hp * tw * 1.0 * (vn === 'front' || vn === 'back' ? 1 : .9), hipY];
    const knee = vadd(hip, dirv(a), C.leg / 2), ank = vadd(knee, dirv(a + k), C.leg / 2);
    return { hip, knee, ank, a, k, far, i };
  });
  if (!bust) {
    legs.slice().sort((p, q) => q.far - p.far).forEach(L => { rs('leg' + L.i); leg(C, vn, L, U, sw); });
    rs('pelvis');
    if (C.pants) paint(P(rrPts(-C.Hp * tw * .98, hipY - .45, C.Hp * tw * 1.96, .85, .3)), { wash: C.pants, ink: PAL.ink, sw: sw * .7 });
    if (C.dress && !C.skirtOver) { rs('skirt'); skirt(C, vn, legs, hipY, U, sw); }
  }

  // upper body, first pass: back arms, hair behind, neck, torso
  const armSpec = o.arms || DEF_ARMS[vn];
  const shoulder = i => [V.arms[i][0] * C.S * tw * .86, -TL + .38];
  const arms = V.arms.map(([, layer], i) => {
    let s = armSpec[i] || DEF_ARMS[vn][i], ae;
    if (Array.isArray(s)) { ae = [s[0], s[1]]; s = { hand: s[2], prop: s[3] }; }
    else ae = reach(shoulder(i), target(C, vn, head, s.to, i), C.ua, C.fa, s.bend ?? 1);
    return { i, layer, sh: shoulder(i), a: ae[0], e: ae[1], hand: s.hand, prop: s.prop };
  });
  const upper = () => { translate(0, hipY * U); if (o.lean) rotate(o.lean); };
  const atHead = fn => { push(); translate(head[0] * U, head[1] * U); if (o.tilt) rotate(o.tilt); fn(); pop(); };
  push(); upper();
  if (!bust) arms.filter(A => A.layer === 0).forEach(A => { rs('arm' + A.i); arm(C, vn, A, true, U, sw); });
  rs('hairback'); if (!V.back) atHead(() => hairBack(C, vn, U, sw));
  rs('neck');
  paint(P(rectPts(head[0] * .7 - C.nw, -TL - C.neck - .6, C.nw * 2, C.neck + .9, .02)), { wash: C.skin, ink: PAL.ink, sw: sw * .7 });
  if (!V.back) paint(P(ellPts(head[0] * .8, -TL - C.neck + .05, C.nw * .95, .16, 14)), { fill: C.skinDk, fillOp: 150, bleed: .1, ink: null });
  rs('torso'); torso(C, vn, U, sw, bust);
  pop();

  if (C.dress && C.skirtOver && !bust) { rs('skirt'); skirt(C, vn, legs, hipY, U, sw); }

  // second pass: the bib, hair over the back, head, front arms, emote
  push(); upper();
  if (C.bib) { rs('bib'); bib(C, vn, U, sw, bust); }
  rs('hairback2'); if (V.back) atHead(() => hairBack(C, vn, U, sw));
  rs('head'); atHead(() => headDraw(C, vn, f, U, sw, rs));
  if (!bust) arms.filter(A => A.layer === 1).forEach(A => { rs('arm' + A.i); arm(C, vn, A, false, U, sw); });
  rs('emote');
  if (o.emote) {
    const top = EMOTE_TOP.includes(o.emote), ex = (head[0] + (top ? 0 : C.rx + .55)) * U, ey = (head[1] - C.ry * (top ? 1.75 : 1.05) - C.vol) * U;
    push(); translate(ex, ey); if (o.flip) scale(-1, 1); emote(o.emote, 0, 0, U * (bust ? .3 : .38), o.emoteK ?? 1, o.emoteAge ?? 1.3); pop();
  }
  pop();
  pop();
  rs('after');
}

// Named reach targets, in the upper-body frame (hip centre = origin), in u.
function target(C, vn, head, to, i) {
  if (Array.isArray(to)) return to;
  const F = PV[vn].face || PV.front.face, fx = X => F.fc + X * F.fw * (X > 0 ? F.far : 1), h = (x, y) => [head[0] + x, head[1] + y];
  switch (to) {
    case 'mouth': return h(fx(0) + (vn === 'side' ? .3 : .05), C.my + .28);
    case 'chin': return h(fx(0) + (vn === 'side' ? .25 : 0), C.ry + .2);
    case 'cheek0': return h(fx(-.62) - .1, .45);
    case 'cheek1': return h(fx(.62) + .1, .45);
    case 'hip0': return [-C.Hp * PV[vn].tw * 1.02, -.3];
    case 'hip1': return [C.Hp * PV[vn].tw * 1.02, -.3];
    case 'chest': return [(i ? -.2 : .2) * C.S, -C.torso + 1.0];
    default: return [0, -C.torso + 1.2];
  }
}

function leg(C, vn, L, U, sw) {
  const P = pts => pts.map(([a, b]) => [a * U, b * U]), dk = c => L.far ? mixCol(c, PAL.ink, .16) : c;
  const path = P([[L.hip[0], L.hip[1] - .35], L.hip, L.knee, L.ank]), w0 = C.lw * U, w1 = C.lw * U * .74;
  paint(ribbon(path, w0, w1), { wash: dk(C.skin), ink: PAL.ink, sw: sw * .7 });
  if (C.pants) paint(ribbon(cutSeg(path, 0, C.pantsLen >= 1 ? 1 : C.pantsLen), w0 * 1.1, C.pantsLen >= 1 ? w1 * 1.08 : w0 * .98), { wash: dk(C.pants), ink: PAL.ink, sw: sw * .7 });
  if (C.sock) paint(ribbon(cutSeg(path, .8, 1), w1 * 1.08, w1 * 1.08), { wash: dk(C.sock), ink: PAL.ink, sw: sw * .55 });
  shoe(C, vn, L, U, sw, dk(C.shoe));
}
function shoe(C, vn, L, U, sw, col) {
  const len = C.foot, ht = .34, side = vn === 'side' || vn === 'q' || vn === 'qback';
  push(); translate(L.ank[0] * U, L.ank[1] * U);
  if (side) rotate(-clamp(L.a + L.k, -1.2, 1.2) * .55);
  const [cx, rx] = vn === 'side' ? [len * .36, len * .62] : vn === 'q' ? [len * .22, len * .5] : vn === 'qback' ? [len * .02, len * .44] : [0, len * .5];
  const pts = []; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, s = Math.sin(a); pts.push([cx * U + Math.cos(a) * rx * U, (.08 + s * ht * (s < 0 ? .9 : .5)) * U]); }
  paint(pts, { wash: col, ink: PAL.ink, sw: sw * .7 });
  inkLine([[cx * U - rx * U * .85, .16 * U], [cx * U + rx * U * .85, .16 * U]], sw * .45, mixCol(col, PAL.ink, .5), 'inkfine', 0);
  pop();
}

// The skirt hangs from the waist to a hem that follows the thighs (so it drapes over a seated lap or a stride).
function skirt(C, vn, legs, hipY, U, sw) {
  const P = pts => pts.map(([a, b]) => [a * U, b * U]), V = PV[vn], f = C.skirt, waistY = C.skirtOver ? hipY - C.torso * .32 : hipY - .3;
  const along = L => { const t = Math.min(f, 1) * C.leg / 2, k = vadd(L.hip, dirv(L.a), t); return f > 1 ? vadd(L.knee, dirv(L.a + L.k * .3), (f - 1) * C.leg / 2) : k; };
  const hemPts = legs.map(L => { const p = along(L), out = Math.sign(L.hip[0] || (L.far ? 1 : -1)); return [p[0] + out * (C.lw * .55 + .25), p[1]]; }).sort((a, b) => a[0] - b[0]);
  const ww = C.Wd * V.tw * (C.skirtOver ? 1.02 : 1.05), [hl, hr] = [hemPts[0], hemPts[hemPts.length - 1]];
  const lo = Math.max(hl[1], hr[1]), xl = Math.min(hl[0], -ww * 1.15), xr = Math.max(hr[0], ww * 1.15);
  const pts = [[-ww, waistY], [ww, waistY], [xr, hr[1]]];
  for (let k = 1; k < 6; k++) pts.push([lerp(xr, xl, k / 6), lerp(hr[1], hl[1], k / 6) + .06 * Math.sin(k * 2.1) + .05]);
  pts.push([xl, hl[1]]);
  paint(P(pts), { wash: C.dress, ink: PAL.ink, sw: sw * .8, curv: .15 });
  for (let k = 1; k < 4; k++) inkLine(P([[lerp(-ww, ww, k / 4) * .8, waistY + .35], [lerp(xl, xr, k / 4) * .92, lo - .12]]), sw * .4, C.dressDk, 'inkfine', 0);
  paint(P(rectPts(-ww * 1.02, waistY - .05, ww * 2.04, .2)), { wash: C.dressDk, ink: PAL.ink, sw: sw * .5 });
}

// Torso, in the upper-body frame: hips at y 0, shoulders at -torso.
function torsoHalf(C, vn, y, bust) {
  const V = PV[vn], TL = C.torso, k = clamp(-y / TL), w = k > .5 ? lerp(C.Wd, C.S, (k - .5) / .5) : lerp(C.Hp, C.Wd, k / .5);
  return w * V.tw * (bust ? 1 : 1);
}
function torso(C, vn, U, sw, bust) {
  const P = pts => pts.map(([a, b]) => [a * U, b * U]), V = PV[vn], TL = C.torso, tw = V.tw, S = C.S * tw, Wd = C.Wd * tw, Hp = C.Hp * tw;
  const sideOff = vn === 'side' ? .12 : 0, bot = bust ? -TL + 1.3 : .14;
  const pts = bust
    ? [[-S * .78, -TL], [-S, -TL + .34], [-S * 1.02, -TL + .9], [-S * 1.02, bot], [S * 1.02, bot], [S * 1.02, -TL + .9], [S, -TL + .34], [S * .78, -TL]]
    : [[-S * .78, -TL], [-S, -TL + .34], [-S * .96, -TL + .9], [-Wd, -TL * .45], [-Hp, -.05], [-Hp * .98, bot], [Hp * .98, bot], [Hp + sideOff, -.05], [Wd + sideOff, -TL * .45], [S * .96 + sideOff, -TL + .9], [S, -TL + .34], [S * .78, -TL]];
  paint(P(pts), { wash: C.top, ink: null, curv: .25 });
  // shading down the far side, and a light on the near shoulder
  paint(P(rectPts(V.back ? -S * .2 : S * .25, -TL + .3, S * .7, bust ? 1.0 : TL * .9, .05)), { fill: C.topDk, fillOp: 110, bleed: .08, tex: .6, border: .5, ink: null });
  if (C.stripe) for (const yy of [-TL + 1.05, -TL + 1.65, -TL + 2.25]) {
    if (bust && yy > bot - .1) continue;
    const a = torsoHalf(C, vn, yy) * .97, b = torsoHalf(C, vn, yy + .26) * .97;
    paint(P([[-a, yy], [a, yy], [b, yy + .26], [-b, yy + .26]]), { wash: C.stripe, ink: null });
  }
  if (C.print && !V.back) for (let i = 0; i < 14; i++) {
    const yy = lerp(-TL + .75, bust ? bot - .2 : -.35, hash(i * 3.1)), xx = (hash(i * 7.7) * 2 - 1) * torsoHalf(C, vn, yy) * .8, r = .11;
    if (bust && yy > bot - .15) continue;
    for (let k = 0; k < 5; k++) { const a = k / 5 * TAU + i; paint(P(ellPts(xx + Math.cos(a) * r, yy + Math.sin(a) * r, r * .62, r * .62, 8)), { wash: C.print, ink: null }); }
    paint(P(ellPts(xx, yy, r * .4, r * .4, 8)), { wash: '#F2C66B', ink: null });
  }
  if (C.hem && !bust) paint(P([[-Hp * 1.0, -.22], [Hp + sideOff, -.22], [Hp * .98 + sideOff, bot], [-Hp * .98, bot]]), { wash: C.topDk, ink: PAL.ink, sw: sw * .5 });
  paint(P(pts), { ink: PAL.ink, sw: sw * .9, curv: .25 });
  // neckline, collar, buttons
  const nx = vn === 'q' ? .16 : vn === 'side' ? .3 : 0, nk = vn === 'q' ? .8 : vn === 'side' ? .45 : 1;
  if (!V.back) {
    if (C.neckline === 'vneck') {
      paint(P([[nx - .5 * nk, -TL - .02], [nx + .5 * nk, -TL - .02], [nx, -TL + .75]]), { wash: C.inner, ink: PAL.ink, sw: sw * .6 });
      paint(P([[nx - .3 * nk, -TL - .02], [nx + .3 * nk, -TL - .02], [nx, -TL + .32]]), { wash: C.skin, ink: null });
      inkLine(P([[nx - .62 * nk, -TL - .02], [nx, -TL + .9], [nx + .62 * nk, -TL - .02]]), sw * .6, mixCol(C.topDk, PAL.ink, .3), 'ink', .2);
    } else {
      const neck = []; for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI; neck.push([nx + Math.cos(a) * (C.nw + .14) * nk, -TL - .02 + Math.sin(a) * .26]); }
      paint(P(neck), { wash: C.skin, ink: PAL.ink, sw: sw * .55 });
      if (C.neckline === 'collar') for (const s of vn === 'side' ? [1] : [-1, 1]) {
        const cx = nx + s * .06 * nk;
        paint(P([[cx, -TL + .22], [cx + s * (C.nw + .32) * nk, -TL - .1], [cx + s * (C.nw + .42) * nk, -TL + .36]]), { wash: mixCol(C.top, '#FFFFFF', .3), ink: PAL.ink, sw: sw * .6 });
      }
    }
    if (C.buttons) for (let k = 0; k < (bust ? 1 : 4); k++) paint(P(ellPts(nx + .02, -TL + .62 + k * .6, .06, .06, 8)), { wash: PAL.cream, ink: PAL.ink, sw: sw * .3 });
    if (C.buttons && !bust) inkLine(P([[nx + .14, -TL + .3], [nx + .14, -.1]]), sw * .4, C.topDk, 'inkfine', 0);
  } else if (C.neckline === 'collar') paint(P(rrPts(-(C.nw + .2), -TL - .14, (C.nw + .2) * 2, .3, .1)), { wash: mixCol(C.top, '#FFFFFF', .3), ink: PAL.ink, sw: sw * .6 });
}
// The girl's pinafore: a bib on the chest with straps over the shoulders (crossed at the back).
function bib(C, vn, U, sw, bust) {
  const P = pts => pts.map(([a, b]) => [a * U, b * U]), V = PV[vn], TL = C.torso, waist = -TL * .32;
  const nx = vn === 'q' ? .14 : vn === 'side' ? .32 : 0, nk = vn === 'q' ? .85 : vn === 'side' ? .45 : 1, bw = .48 * nk;
  if (V.back) {
    for (const s of [-1, 1]) paint(ribbon(P([[s * C.S * V.tw * .55, -TL + .05], [0, -TL * .62], [-s * C.Wd * V.tw * .6, waist]]), .17 * U, .17 * U), { wash: C.dress, ink: PAL.ink, sw: sw * .5 });
    return;
  }
  paint(P([[nx - bw, -TL + .62], [nx + bw, -TL + .62], [nx + bw * 1.08, waist + .05], [nx - bw * 1.08, waist + .05]]), { wash: C.dress, ink: PAL.ink, sw: sw * .7 });
  paint(P(ellPts(nx, -TL + 1.0, .12 * nk, .1, 10)), { wash: PAL.ochre, ink: PAL.ink, sw: sw * .35 });
  for (const s of vn === 'side' ? [-1] : [-1, 1]) paint(ribbon(P([[nx + s * bw * .8, -TL + .66], [s * C.S * V.tw * .62 + nx * .3, -TL + .04]]), .16 * U, .16 * U), { wash: C.dress, ink: PAL.ink, sw: sw * .5 });
}

function arm(C, vn, A, far, U, sw) {
  const P = pts => pts.map(([a, b]) => [a * U, b * U]), E = vadd(A.sh, dirv(A.a), C.ua), Wr = vadd(E, dirv(A.a + A.e), C.fa);
  const path = P([A.sh, E, Wr]), skin = far ? mixCol(C.skin, C.skinDk, .45) : C.skin, top = far ? C.topDk : C.top;
  paint(ribbon(path, C.aw * U, C.aw * U * .82), { wash: skin, ink: PAL.ink, sw: sw * .7 });
  if (C.sleeve) {
    const long = C.sleeve > .9, seg = cutSeg(path, 0, C.sleeve);
    paint(ribbon(seg, C.aw * U * 1.14, C.aw * U * (long ? .98 : 1.08)), { wash: top, ink: PAL.ink, sw: sw * .7 });
    if (C.stripe && long) for (const t of [.3, .55]) paint(ribbon(cutSeg(path, t, t + .08), C.aw * U * 1.12, C.aw * U * 1.08), { wash: C.stripe, ink: null });
  }
  const fd = A.a + A.e, PR = A.prop && PROPS[A.prop];
  push(); translate(Wr[0] * U, Wr[1] * U); rotate(-fd);
  if (PR && !PR.front) PR(U, sw, fd, C);
  hand(A.hand || 'fist', C, U, sw, skin);
  if (PR && PR.front) PR(U, sw, fd, C);
  pop();
}
// Hands, drawn in hand space: +y runs out along the forearm to the fingertips.
function hand(kind, C, U, sw, skin) {
  const h = C.hand * U;
  if (kind === 'open') {
    paint(ellPts(0, h * .95, h * .95, h * 1.25, 16), { wash: skin, ink: PAL.ink, sw: sw * .6 });
    for (const k of [-.45, 0, .45]) inkLine([[k * h, h * 1.4], [k * h * 1.1, h * 2.0]], sw * .35, PAL.ink, 'inkfine', 0);
    paint(ribbon([[h * .7, h * .5], [h * 1.3, h * .9], [h * 1.45, h * 1.35]], h * .5, h * .4), { wash: skin, ink: PAL.ink, sw: sw * .5 });
  } else if (kind === 'point') {
    paint(ribbon([[0, h * .9], [0, h * 2.6]], h * .52, h * .42), { wash: skin, ink: PAL.ink, sw: sw * .5 });
    paint(ellPts(0, h * .75, h, h * 1.0, 16), { wash: skin, ink: PAL.ink, sw: sw * .6 });
  } else {
    paint(ellPts(0, h * .8, h * .92, h * 1.12, 16), { wash: skin, ink: PAL.ink, sw: sw * .6 });
    inkLine([[-h * .45, h * 1.25], [0, h * 1.38], [h * .45, h * 1.25]], sw * .35, C.skinDk, 'inkfine', .5);
  }
}

// ---------- props (drawn in hand space; fd is the forearm's angle, to keep upright things upright) ----------
const PROPS = {
  spatula(U, sw) {
    paint(ribbon([[0, -.55 * U], [0, 1.15 * U]], .14 * U, .12 * U), { wash: '#8A5A3C', ink: PAL.ink, sw: sw * .5 });
    paint(rrPts(-.34 * U, 1.1 * U, .68 * U, .9 * U, .1 * U), { wash: '#B9BDC9', fill: '#8E93A3', fillOp: 70, ink: PAL.ink, sw: sw * .6 });
    for (const k of [-.14, 0, .14]) inkLine([[k * U, 1.3 * U], [k * U, 1.8 * U]], sw * .5, '#6B6F7E', 'inkfine', 0);
  },
  chop(U, sw) {
    paint(ribbon([[0, -.25 * U], [0, .9 * U]], .16 * U, .14 * U), { wash: PAL.cream, ink: PAL.ink, sw: sw * .5 });
    paint(ellPts(0, -.32 * U, .14 * U, .12 * U, 10), { wash: PAL.cream, ink: PAL.ink, sw: sw * .4 });
    const m = []; for (let i = 0; i < 20; i++) { const a = i / 20 * TAU; m.push([Math.cos(a) * .5 * U * (1 + .1 * Math.sin(a * 3)), 1.35 * U + Math.sin(a) * .62 * U]); }
    paint(m, { wash: '#8A4426', fill: '#5E2A16', fillOp: 90, ink: PAL.ink, sw: sw * .6 });
    for (const k of [-.3, 0, .3]) inkLine([[-.32 * U, (1.35 + k) * U - .15 * U], [.32 * U, (1.35 + k) * U + .15 * U]], sw * .7, '#3A170C', 'ink', 0);
  },
  tea: Object.assign(function (U, sw, fd) {
    rotate(fd);   // upright, whatever the arm does
    const g = [[-.24, -.62], [.24, -.62], [.18, .32], [-.18, .32]].map(([a, b]) => [a * U, (b - .05) * U]);
    paint(g.map(([a, b], i) => i < 2 ? [a * .95, b + .2 * U] : [a, b]), { wash: '#C8742E', fill: '#9E4E1A', fillOp: 80, ink: null });
    paint(g, { wash: '#F1F2F4', washOp: 70, ink: PAL.ink, sw: sw * .55 });
    paint(ellPts(.02 * U, -.86 * U, .16 * U, .1 * U, 10), { wash: '#7FB069', ink: PAL.ink, sw: sw * .3 });   // a mint leaf
  }, { front: true }),
  fries: Object.assign(function (U, sw, fd) {
    rotate(fd);
    for (let i = 0; i < 9; i++) { const x = (i - 4) * .12 * U, a = (hash(i) - .5) * .5; paint(ribbon([[x, -.1 * U], [x + Math.sin(a) * .5 * U, -.7 * U]], .09 * U, .08 * U), { wash: '#F2C14E', ink: PAL.ink, sw: sw * .3 }); }
    paint(ellPts(0, 0, .85 * U, .2 * U, 20), { wash: PAL.cream, ink: PAL.ink, sw: sw * .6 });
  }, { front: true }),
};
// A red wooden chair like the ones round the table, seen from the side; the seat sits just under the hips.
function chair(C, hipY, ground, U, sw) {
  const P = pts => pts.map(([a, b]) => [a * U, b * U]), seat = hipY + .3, red = '#C8323C', dk = '#8E2230';
  const x0 = -(C.S * .6 + .3), x1 = C.leg * .42, th = .3, bh = C.torso * .95;
  for (const lx of [x0 + .05, x1 - .32]) paint(P(rectPts(lx, seat + th - .02, .26, ground - seat - th + .02, .02)), { wash: dk, ink: PAL.ink, sw: sw * .6 });
  paint(P(rectPts(x0 - .1, seat, x1 - x0 + .1, th, .02)), { wash: red, ink: PAL.ink, sw: sw * .7 });
  paint(P(rectPts(x0 - .1, seat - bh + .3, .28, bh - .3, .02)), { wash: red, ink: PAL.ink, sw: sw * .7 });
  paint(P(rrPts(x0 - .26, seat - bh, .6, .55, .2)), { wash: '#E0504A', ink: PAL.ink, sw: sw * .7 });
}

// ---------- head ----------
function headPts(C, vn, n = 48) {
  const p = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU - Math.PI, c = Math.cos(a), s = Math.sin(a);
    let x = c * C.rx * (vn === 'side' ? 1.07 : 1), y = s * C.ry;
    if (s > 0) x *= 1 - C.jaw * s * s * (vn === 'side' ? (c > 0 ? .35 : 1.3) : vn === 'q' ? (c > 0 ? .8 : 1.1) : 1);
    if (vn === 'side' && c > 0) x += (C.noseS || 1) * .2 * Math.exp(-(((a - .12) / .12) ** 2)) + .05 * Math.exp(-(((a - 1.0) / .2) ** 2));
    if (vn === 'q' && c > 0) x += .04 * Math.exp(-(((a - .9) / .25) ** 2));
    p.push([x, y]);
  }
  return p;
}
function headDraw(C, vn, f, U, sw, rs) {
  const P = pts => pts.map(([a, b]) => [a * U, b * U]), V = PV[vn], over = !['long', 'bob'].includes(C.style);
  const ears = () => EARS[vn].forEach(([ex, ey]) => {
    const X = Math.abs(ex) === 1 ? ex * C.rx * .97 : ex;
    paint(P(ellPts(X, ey, .17, .26, 12)), { wash: f.skinNow, ink: PAL.ink, sw: sw * .55 });
    inkLine(P([[X - .02, ey - .12], [X + .06 * Math.sign(X || 1), ey], [X, ey + .12]]), sw * .4, C.skinDk, 'inkfine', .5);
  });
  const hp = P(headPts(C, vn));
  paint(hp, { wash: f.skinNow, ink: null });
  if (vn === 'front' || vn === 'q') paint(P(ellPts(V.face.fc * .5, .62, .48, .22, 16, 0, .1)), { fill: C.skinDk, fillOp: 55, bleed: .15, tex: .5, border: .4, ink: null });
  paint(hp, { ink: PAL.ink, sw: sw * .95 });
  rs('face'); if (V.face) face(C, vn, f, U, sw);
  rs('hair'); hairFront(C, vn, U, sw);
  if (over) { rs('ears'); ears(); }
  if (C.glasses && V.face) { rs('glasses'); glasses(C, vn, U, sw); }
  rs('brows'); if (V.face) brows(C, vn, f, U, sw);
}

// ---------- face ----------
function face(C, vn, f, U, sw) {
  const F = PV[vn].face, P = pts => pts.map(([a, b]) => [a * U, b * U]), mx = X => F.fc + X * F.fw * (X > 0 ? F.far : 1);
  const kinds = Array.isArray(f.eyes) ? f.eyes : [f.eyes || 'open', f.eyes || 'open'];
  const blush = Math.max(C.blush || 0, f.blush || 0);
  if (blush > .02) for (const s of F.show) paint(P(ellPts(mx(s * .56), .32, .2 * (s > 0 ? F.far || 1 : 1) * (vn === 'side' ? .7 : 1), .12, 12)), { fill: PAL.rose, fillOp: 160 * clamp(blush), bleed: .25, ink: null });
  if (blush > .7) for (const s of F.show) for (let k = 0; k < 3; k++) inkLine(P([[mx(s * .56) - .1 + k * .09, .37], [mx(s * .56) - .06 + k * .09, .26]]), sw * .35, mixCol(PAL.rose, PAL.ink, .3), 'inkfine', 0);
  if (C.age) wrinkles(C, vn, U, sw, mx, F);
  for (const s of F.show) {
    const ex = mx(s * C.ex), w = F.ew[s < 0 ? 0 : 1];
    push(); translate(ex * U, C.ey * U); scale(w, 1);
    eye(kinds[s < 0 ? 0 : 1], s, C, f, U, sw, vn);
    pop();
  }
  // nose
  const nx = mx(0), ns = C.noseS || 1;
  if (vn === 'front') { inkLine(P([[nx + .03, .02], [nx + .1 * ns, .24], [nx - .06 * ns, .3]]), sw * .6, mixCol(C.skinDk, PAL.ink, .3), 'ink', .6); paint(P(ellPts(nx, .3, .1 * ns, .05, 8)), { fill: C.skinDk, fillOp: 90, ink: null }); }
  else if (vn === 'q') inkLine(P([[nx + .1, -.02], [nx + .3 * ns, .22], [nx + .2, .3], [nx + .06, .29]]), sw * .65, mixCol(C.skinDk, PAL.ink, .3), 'ink', .5);
  else inkLine(P([[F.fc + .3 + .1 * ns, .26], [F.fc + .2 + .1 * ns, .3]]), sw * .5, mixCol(C.skinDk, PAL.ink, .3), 'inkfine', .3);
  // mouth
  push(); translate((nx + (vn === 'side' ? .2 : vn === 'q' ? .07 : 0)) * U, C.my * U); scale(F.mw, 1);
  mouth(f.mouth || 'rest', C.mw * U, sw, C);
  pop();
}
function wrinkles(C, vn, U, sw, mx, F) {
  const P = pts => pts.map(([a, b]) => [a * U, b * U]), col = mixCol(C.skinDk, PAL.ink, .15), a = C.age;
  for (const s of F.show) {
    const ex = mx(s * C.ex), oc = ex + s * (C.er + .06) * (s > 0 ? F.far || 1 : 1) * (vn === 'side' ? .6 : 1);
    for (const k of [-1, 1]) inkLine(P([[oc, C.ey + k * .02], [oc + s * .1, C.ey + k * .08]]), sw * .4, col, 'inkfine', 0);
    inkLine(P([[ex - .12, C.ey + .26], [ex, C.ey + .3], [ex + .12, C.ey + .26]]), sw * .35, col, 'inkfine', .5);
    if (vn !== 'side') inkLine(P([[mx(s * .24), .36], [mx(s * .33), .5], [mx(s * .3), .62]]), sw * .45, col, 'inkfine', .5);
  }
  if (a > .8) for (const yy of [-.48, -.6]) inkLine(P([[mx(-.3), yy + .02], [mx(0), yy], [mx(.3), yy + .02]]), sw * .4, col, 'inkfine', .5);
}
// One eye, drawn around its centre in units of the eye radius. s = -1 for the screen-left eye; the inner side is -s.
function eye(kind, s, C, f, U, sw, vn) {
  const r = C.er * U, R = pts => pts.map(([a, b]) => [a * r, b * r]), I = pts => R(pts.map(([a, b]) => [a * -s, b]));
  const lx = ((f.lookX || 0) + (vn === 'side' ? .6 : vn === 'q' ? .25 : 0)) * r * .36, ly = (f.lookY || 0) * r * .3;
  const white = (k = 1) => paint(ellPts(0, 0, r * .92 * k, r * 1.1 * k, 18), { wash: PAL.cream, ink: PAL.ink, sw: sw * .5 });
  const iris = (k = 1) => {
    paint(ellPts(lx, ly, r * .64 * k, r * .7 * k, 14), { wash: C.eye, ink: null });
    paint(ellPts(lx, ly, r * .34 * k, r * .38 * k, 10), { wash: PAL.ink, ink: null });
    paint(ellPts(lx - r * .22 * k, ly - r * .28 * k, r * .17 * k, r * .19 * k, 8), { wash: '#FFFFFF', ink: null });
  };
  const top = (k = 1) => inkLine(R([[-1.02, -.2], [-.55, -1.08], [.55, -1.08], [1.02, -.2]].map(([a, b]) => [a * k, b * k])), sw * 1.05, PAL.ink, 'ink', .5);
  const lash = () => { if (C.lashes) inkLine(R([[s * .8, -.78], [s * 1.18, -.98], [s * 1.36, -.88]]), sw * .7, PAL.ink, 'ink', .5); };
  const lid = (yi, yo) => {   // a skin-coloured lid over the top, its edge from the inner corner (yi) to the outer (yo)
    paint(I([[1.2, -1.6], [-1.2, -1.6], [-1.2, yo], [1.2, yi]]), { wash: f.skinNow, ink: null });
    inkLine(I([[1.05, yi], [-1.05, yo]]), sw * 1.05, PAL.ink, 'ink', 0);
  };
  const arc = (pts, w = 1.25, c = .5) => inkLine(R(pts), sw * w, PAL.ink, 'ink', c);
  switch (kind) {
    case 'open': case 'look': white(); iris(); top(); lash(); break;
    case 'wide': white(1.18); iris(.82); top(1.18); lash(); break;
    case 'shine': white(1.08); iris(1.05); paint(ellPts(lx + r * .25, ly + r * .25, r * .1, r * .1, 8), { wash: '#FFFFFF', ink: null }); top(1.08); lash(); break;
    case 'scared': white(1.22); paint(ellPts(lx * .4, ly, r * .2, r * .24, 8), { wash: PAL.ink, ink: null }); break;
    case 'happy': arc([[-1, .38], [-.5, -.32], [.5, -.32], [1, .38]]); lash(); break;
    case 'laugh': arc([[-1, .42], [-.45, -.3], [.45, -.3], [1, .42]], 1.45); inkLine(R([[s * 1.2, .1], [s * 1.5, -.05]]), sw * .4, PAL.ink, 'inkfine', 0); inkLine(R([[s * 1.2, .32], [s * 1.48, .38]]), sw * .4, PAL.ink, 'inkfine', 0); break;
    case 'closed': arc([[-1, -.12], [-.4, .38], [.4, .38], [1, -.12]]); lash(); break;
    case 'squeeze': arc([[-.85 * -s, -.7], [.7 * -s, 0], [-.85 * -s, .7]].map(([a, b]) => [a, b]), 1.3, 0); break;
    case 'sleepy': white(); iris(); lid(-.02, .08); lash(); break;
    case 'narrow': white(); iris(); lid(-.22, -.22); inkLine(R([[-.8, .72], [0, .9], [.8, .72]]), sw * .4, PAL.ink, 'inkfine', .5); break;
    case 'angry': white(); iris(); lid(.18, -.6); break;
    case 'determined': white(); iris(); lid(-.12, -.62); break;
    case 'sad': white(); iris(); lid(-.8, -.12); break;
    case 'teary':
      white(); iris(); lid(-.8, -.12);
      paint(ellPts(0, r * .72, r * .95, r * .38, 14), { wash: PAL.sky, washOp: 220, fill: '#FFFFFF', fillOp: 70, ink: PAL.ink, sw: sw * .35 });
      paint(ellPts(-r * .35, r * .62, r * .16, r * .09, 8), { wash: '#FFFFFF', ink: null }); break;
    case 'cry': {
      arc([[-1, .1], [-.4, .42], [.4, .42], [1, .1]], 1.35);
      paint(ribbon(R([[s * .55, .55], [s * .7, 1.6], [s * .62, 2.8], [s * .75, 3.6]]), r * .36, r * .6), { wash: PAL.sky, washOp: 230, fill: '#FFFFFF', fillOp: 70, ink: PAL.ink, sw: sw * .4 });
      paint(ellPts(s * 1.6 * r, .2 * r, r * .2, r * .27, 8), { wash: PAL.sky, ink: PAL.ink, sw: sw * .35 }); break;
    }
    case 'heart': paint(heartPts(0, r * .1, r * 1.05), { wash: '#E2476E', ink: PAL.ink, sw: sw * .5 }); break;
    case 'spark': paint(starPts(0, 0, r * 1.25, .4), { wash: PAL.cream, fill: PAL.ochre, fillOp: 90, ink: PAL.ink, sw: sw * .5 }); break;
    case 'x': arc([[-.8, -.8], [.8, .8]], 1.1, 0); arc([[.8, -.8], [-.8, .8]], 1.1, 0); break;
    case 'swirl': { const sp = []; for (let k = 0; k < 16; k++) { const a = k * .75 * s, rr = k * .065; sp.push([Math.cos(a) * rr, Math.sin(a) * rr]); } inkLine(R(sp), sw * .6, PAL.ink, 'inkfine', .6); break; }
    default: white(); iris(); top(); lash();
  }
}
function brows(C, vn, f, U, sw) {
  const F = PV[vn].face, mx = X => F.fc + X * F.fw * (X > 0 ? F.far : 1), b = f.brows || {}, P = pts => pts.map(([a, c]) => [a * U, c * U]);
  for (const s of F.show) {
    const k = s > 0 ? F.far : 1, ex = mx(s * C.ex), hw = .21 * F.ew[s < 0 ? 0 : 1] * (C.bushy ? 1.25 : 1), inner = -s;
    const by = C.ey - C.er * 1.6 - .07 - (b.r || 0) * .1 - (b.a ? b.a[s < 0 ? 0 : 1] : 0) * .1 - (C.glasses ? .06 : 0), t = b.t || 0;
    const pts = [[ex + inner * hw, by - t * .09], [ex, by - .045 - Math.max(0, t) * .02], [ex - inner * hw, by + t * .03 + .02]];
    paint(ribbon(P(pts), (C.bushy ? .14 : .08) * U * Math.sqrt(k), (C.bushy ? .1 : .045) * U * Math.sqrt(k)), { wash: C.brow, ink: C.bushy ? PAL.ink : null, sw: sw * .35 });
  }
}
function glasses(C, vn, U, sw) {
  const F = PV[vn].face, mx = X => F.fc + X * F.fw * (X > 0 ? F.far : 1), P = pts => pts.map(([a, b]) => [a * U, b * U]), col = C.glasses;
  const lens = s => { const ex = mx(s * C.ex), w = .3 * F.ew[s < 0 ? 0 : 1]; return rrPts(ex - w, C.ey - .24, w * 2, .44, .12); };
  for (const s of F.show) paint(P(lens(s)), { wash: '#E8F1F7', washOp: 50, ink: col, sw: sw * 1.1 });
  if (F.show.length > 1) inkLine(P([[mx(-C.ex) + .28 * F.ew[0], C.ey - .08], [mx(0), C.ey - .14], [mx(C.ex) - .28 * F.ew[1], C.ey - .08]]), sw * .9, col, 'ink', .5);
  const ear = EARS[vn][0];
  if (vn === 'q' || vn === 'side') inkLine(P([[mx(-C.ex) - .3 * F.ew[0], C.ey - .06], [ear[0] + .05, ear[1] - .08]]), sw * .9, col, 'ink', 0);
  else for (const s of [-1, 1]) inkLine(P([[mx(s * C.ex) + s * .3, C.ey - .08], [s * C.rx * .98, C.ey - .02]]), sw * .9, col, 'ink', 0);
}
// Mouths, in head units around the mouth centre.
function mouth(kind, m, sw, C) {
  const P = pts => pts.map(([a, b]) => [a * m, b * m]), dark = '#5A2230', tongue = '#E07A8A';
  const line = (pts, w = .9, c = .5) => inkLine(P(pts), sw * w, PAL.ink, 'ink', c);
  const open = (pts, teeth = 0, tng = 0) => {
    paint(P(pts), { wash: dark, ink: null, curv: .35 });
    if (tng) paint(P(ellPts(0, tng, .15, .08, 12)), { wash: tongue, ink: null });
    if (teeth) { const y0 = pts[0][1], x0 = Math.abs(pts[0][0]) * .86; paint(P([[-x0, y0 + .01], [x0, y0 + .01], [x0 * .9, y0 + teeth], [-x0 * .9, y0 + teeth]]), { wash: PAL.cream, ink: null }); }
    paint(P(pts), { ink: PAL.ink, sw: sw * .7, curv: .35 });
  };
  switch (kind) {
    case 'rest': line([[-.16, 0], [0, .035], [.17, -.01]], .8); break;
    case 'smile': line([[-.27, -.07], [-.13, .06], [.13, .06], [.27, -.07]]); line([[-.31, -.11], [-.26, -.05]], .5, 0); line([[.31, -.11], [.26, -.05]], .5, 0); break;
    case 'grin': open([[-.3, -.04], [.3, -.04], [.22, .13], [0, .2], [-.22, .13]], .08); break;
    case 'laugh': open([[-.36, -.08], [.36, -.08], [.28, .2], [0, .34], [-.28, .2]], .09, .22); break;
    case 'open': open([[-.17, -.06], [.17, -.06], [.2, .08], [0, .22], [-.2, .08]], 0, .14); break;
    case 'O': paint(P(ellPts(0, .05, .12, .17, 14)), { wash: dark, ink: PAL.ink, sw: sw * .65 }); break;
    case 'o': paint(P(ellPts(0, .02, .065, .075, 10)), { wash: dark, ink: PAL.ink, sw: sw * .5 }); break;
    case 'frown': line([[-.24, .07], [-.1, -.04], [.1, -.04], [.24, .07]]); break;
    case 'flat': line([[-.18, 0], [.18, .01]], .85, 0); break;
    case 'smirk': line([[-.18, .03], [.02, .03], [.22, -.08]]); line([[.25, -.12], [.22, -.05]], .5, 0); break;
    case 'wobble': line([[-.24, .01], [-.12, -.04], [0, .02], [.12, -.04], [.24, .01]], .8, .4); break;
    case 'teeth': case 'grimace': {
      const w = kind === 'grimace' ? .3 : .23;
      paint(P(rrPts(-w, -.07, w * 2, .15, .05)), { wash: PAL.cream, ink: PAL.ink, sw: sw * .65 });
      line([[-w + .02, .005], [w - .02, .005]], .4, 0);
      for (let k = 1; k < 4; k++) line([[-w + k * w / 2, -.06], [-w + k * w / 2, .07]], .35, 0);
      break;
    }
    case 'pout': line([[-.08, .03], [0, -.03], [.08, .03]], .9, .6); line([[-.05, .08], [0, .1], [.05, .08]], .6, .6); break;
    case 'tongue': line([[-.26, -.05], [-.12, .05], [.12, .05], [.26, -.05]]); paint(P([[.0, .05], [.18, .05], [.17, .17], [.09, .22], [.01, .16]]), { wash: tongue, ink: PAL.ink, sw: sw * .5, curv: .5 }); break;
    case 'wail': open([[-.3, -.05], [-.1, -.1], [.1, -.1], [.3, -.05], [.24, .26], [-.24, .26]], 0, .2); break;
    case 'shout': open([[-.3, -.06], [.3, -.06], [.26, .24], [-.26, .24]], .08, .19); break;
    case 'yawn': paint(P(ellPts(0, .08, .14, .24, 14)), { wash: dark, ink: PAL.ink, sw: sw * .65 }); paint(P(ellPts(0, .2, .09, .06, 10)), { wash: tongue, ink: null }); break;
    case 'yuck': open([[-.2, -.04], [.2, -.04], [.14, .1], [-.14, .1]]); paint(P([[-.08, .06], [.08, .06], [.09, .22], [0, .27], [-.09, .22]]), { wash: tongue, ink: PAL.ink, sw: sw * .5, curv: .5 }); break;
    case 'chew': line([[-.2, -.02], [0, .04], [.2, -.03]]); line([[.36, -.2], [.46, -.05], [.38, .1]], .6, .6); break;
    default: line([[-.16, 0], [.16, 0]]);
  }
}

// ---------- hair ----------
// Front-view hairlines (x in units of the head's half-width), left to right.
const HAIRLINE = {
  part:   [[-1, .04], [-.62, -.42], [-.22, -.6], [.08, -.55], [.45, -.5], [.74, -.3], [1, .04]],
  fringe: [[-1, .06], [-.72, -.26], [-.54, -.42], [-.38, -.27], [-.16, -.45], [.05, -.28], [.27, -.47], [.48, -.3], [.66, -.42], [1, .06]],
  long:   [[-1, .16], [-.64, -.46], [-.32, -.63], [-.02, -.6], [.3, -.42], [.62, -.26], [1, .05]],
  bob:    [[-1, .22], [-.66, -.24], [-.36, -.42], [-.05, -.34], [.25, -.44], [.58, -.26], [1, .22]],
  bun:    [[-1, .04], [-.64, -.42], [-.3, -.56], [0, -.5], [.3, -.56], [.64, -.42], [1, .04]],
};
function hairline(C, vn) {
  const HL = HAIRLINE[C.style], F = PV[vn].face, rx = C.rx, cov = ['long', 'bob'].includes(C.style);
  const onR = (y, k = 1) => [k * rx * (vn === 'side' ? 1.07 : 1) * Math.sqrt(Math.max(0, 1 - y * y)), y];
  if (vn === 'front') return HL.map(([x, y]) => [x * rx, y]);
  if (vn === 'q') {
    const mx = X => F.fc + X * F.fw * (X > 0 ? F.far : 1), pts = HL.slice(1).map(([x, y]) => [mx(x * rx), y]);
    pts[pts.length - 1] = onR(pts[pts.length - 1][1]);
    return (cov ? [[-.56, .9], [-.48, .45], [-.44, 0], [-.36, -.3]] : [[-.66, .78], [-.5, .45], [-.42, .12], [-.36, -.24]]).concat(pts.slice(1));
  }
  if (vn === 'side') {
    const pts = HL.filter(([x]) => x <= 0).map(([x, y]) => [.8 + x * rx * .78, y]);
    pts[pts.length - 1] = onR(pts[pts.length - 1][1]);
    return cov ? [[-.42, .92], [-.22, .5], [-.1, .05]].concat(pts.slice(1)) : [[-.6, .82], [-.32, .45], [-.24, .12]].concat(pts);
  }
  if (vn === 'qback') return cov ? [[.55, .92], [.64, .4], [.7, 0], [.8, -.24], onR(-.3)] : [[.28, .92], [.34, .4], [.4, .02], [.58, -.26], onR(-.34)];
  return [[-.8, .56], [-.42, .8], [0, .86], [.42, .8], [.8, .56]];
}
function capPts(C, vn, HLp) {
  const rxv = C.rx * (vn === 'side' ? 1.07 : 1), a = HLp[0], b = HLp[HLp.length - 1];
  const tR = Math.atan2(b[1], b[0] / rxv); let tL = Math.atan2(a[1], a[0] / rxv); if (tL > tR) tL -= TAU;
  const arc = [], n = 34;
  for (let i = 0; i <= n; i++) {
    const t = lerp(tR, tL, i / n), up = clamp(-Math.sin(t) + .3), v = C.vol * up * (1 + .2 * Math.sin(t * 7 + 1)) + .025;
    arc.push([Math.cos(t) * (rxv + v), Math.sin(t) * (C.ry + v)]);
  }
  return arc.concat(HLp);
}
// Long hair and the bob hang behind the head (and, from the back, over the shoulders).
function hairBack(C, vn, U, sw) {
  if (!C.len) return;
  const P = pts => pts.map(([a, b]) => [a * U, b * U]), v = C.vol, L = C.len, rx = C.rx, ry = C.ry, pts = [];
  // a side edge hanging from y0 to the ends, flaring out with soft waves; dir = -1 for the left edge
  const edge = (x0, y0, dir, down) => { const n = 7; for (let k = 0; k <= n; k++) { const q = down ? k / n : 1 - k / n, y = lerp(y0, L * .92, q); pts.push([x0 + dir * (C.flare * Math.pow(q, 1.3) + .06 * Math.sin(q * 9 + dir)), y]); } };
  const ends = (x0, x1) => { const n = 5; for (let k = 0; k <= n; k++) { const x = lerp(x0, x1, k / n); pts.push([x, L + (k % 2 ? -.06 : .1) + .04 * Math.sin(k * 3)]); } };
  if (vn === 'side') {
    for (let i = 0; i <= 18; i++) { const t = lerp(-1.3, -Math.PI - .5, i / 18); pts.push([Math.cos(t) * (rx * 1.07 + v), Math.sin(t) * (ry + v)]); }
    edge(-(rx * 1.07 + v) * .96, .4, -1, true); ends(-(rx + v + C.flare), .05); pts.push([.1, L * .6], [.14, .4]);
  } else {
    const kl = vn === 'q' ? 1.08 : 1, kr = vn === 'q' ? .86 : 1, xl = -(rx + v) * kl, xr = (rx + v) * kr;
    for (let i = 0; i <= 22; i++) { const t = lerp(.15, -Math.PI - .15, i / 22), k = Math.cos(t) < 0 ? kl : kr; pts.push([Math.cos(t) * (rx + v) * k, Math.sin(t) * (ry + v)]); }
    edge(xl * .99, .3, -1, true); ends(xl - C.flare, xr + C.flare); edge(xr * .99, .3, 1, false);
  }
  paint(P(pts), { wash: C.hairDk, fill: mixCol(C.hairDk, PAL.ink, .25), fillOp: 50, tex: .6, ink: PAL.ink, sw: sw * .8, curv: .3 });
  for (let k = 0; k < 4; k++) {
    const x = (vn === 'side' ? lerp(-.95, -.2, k / 3) : lerp(-.75, .75, k / 3)) * rx;
    inkLine(P([[x, .45], [x * 1.12 + .04, L * .6], [x * 1.18, L * .88]]), sw * .45, mixCol(C.hairDk, PAL.ink, .35), 'inkfine', .5);
  }
}
function hairFront(C, vn, U, sw) {
  const P = pts => pts.map(([a, b]) => [a * U, b * U]), lin = mixCol(C.hairDk, PAL.ink, .2);
  if (C.style === 'bald') { (BALD[vn] || []).forEach(pts => { paint(P(pts), { wash: C.hair, fill: C.hairDk, fillOp: 60, tex: .6, ink: PAL.ink, sw: sw * .7, curv: .4 }); }); return; }
  if (C.style === 'bun') {
    const [bx, by, br] = BUN[vn];
    paint(P(ellPts(bx, by, br, br * .9, 18)), { wash: C.hair, fill: C.hairDk, fillOp: 70, tex: .6, ink: PAL.ink, sw: sw * .8 });
    inkLine(P([[bx - br * .5, by - br * .2], [bx, by - br * .55], [bx + br * .45, by - br * .1]]), sw * .45, lin, 'inkfine', .6);
  }
  const HLp = hairline(C, vn), cap = capPts(C, vn, HLp);
  paint(P(cap), { wash: C.hair, ink: null, curv: .1 });
  if (vn !== 'back') paint(P(ellPts(-.25, -.82, .45, .16, 14, 0, -.3)), { fill: C.hairLt, fillOp: 120, bleed: .15, tex: .7, border: .6, ink: null });
  // strands: short arcs inside the cap, following its curve
  const n = cap.length - HLp.length;
  for (const [f0, f1, k] of [[.18, .42, .8], [.5, .8, .78], [.3, .62, .62]]) {
    const arcp = cap.slice(Math.round(n * f0), Math.round(n * f1)).map(([x, y]) => [x * k, (y + .15) * k - .15]);
    if (arcp.length > 2) inkLine(P(arcp), sw * .45, lin, 'inkfine', .5);
  }
  paint(P(cap), { ink: PAL.ink, sw: sw * .85, curv: .1 });
  if (C.style === 'bun') { const [bx, by, br] = BUN[vn]; paint(ribbon(P([[bx - br * .6, by + br * .75], [bx, by + br * .9], [bx + br * .6, by + br * .75]]), .13 * U, .13 * U), { wash: PAL.rose, ink: PAL.ink, sw: sw * .45 }); }
  if (C.curl) { const [cx, cy, d] = CURL[vn]; paint(ribbon(P([[cx, cy + .1], [cx + .02 * d, cy - .14], [cx + .18 * d, cy - .26], [cx + .3 * d, cy - .16], [cx + .22 * d, cy - .06]]), .14 * U, .05 * U), { wash: C.hair, ink: PAL.ink, sw: sw * .5 }); }
}
const BUN = { front: [-.3, -1.36, .4], q: [-.26, -1.34, .4], side: [-.42, -1.26, .4], qback: [-.12, -1.36, .4], back: [.3, -1.36, .4] };
const CURL = { front: [.12, -1.08, 1], q: [.36, -1.04, 1], side: [.5, -.98, 1], qback: [-.05, -1.1, -1], back: [-.12, -1.1, -1] };
// Grandpa: bald on top, with grey tufts round the sides and the back.
const BALD = {
  front: [-1, 1].map(s => [[-.6, -.5], [-.92, -.46], [-1.08, -.22], [-1.03, -.02], [-1.1, .16], [-.9, .26], [-.82, .02], [-.72, -.26]].map(([x, y]) => [x * s, y])),
  q: [[[-.15, -.5], [-.55, -.7], [-.88, -.46], [-.98, -.05], [-.86, .42], [-.6, .74], [-.44, .5], [-.44, .2], [-.32, -.06], [-.2, -.3]],
      [[.72, -.5], [.88, -.4], [.98, -.18], [.86, -.12], [.76, -.3]]],
  side: [[[.08, -.38], [-.3, -.64], [-.76, -.56], [-1.02, -.22], [-1.02, .24], [-.76, .66], [-.48, .58], [-.34, .26], [-.22, -.02], [-.02, -.16]]],
  qback: [[[-.92, -.2], [-.98, .2], [-.74, .66], [-.22, .9], [.22, .86], [.4, .4], [.5, .02], [.62, -.2], [.3, -.02], [-.24, -.08], [-.66, -.22]]],
  back: [[[-.96, -.18], [-1.04, .22], [-.76, .64], [0, .86], [.76, .64], [1.04, .22], [.96, -.18], [.5, .04], [0, .1], [-.5, .04]]],
};

// ---------- expressions ----------
// Each is a face; fields are read by face(), eye(), brows() and mouth(). emote is a painted reaction mark from clawd.js.
const FACES = {
  neutral:    { eyes: 'open', mouth: 'rest' },
  happy:      { eyes: 'happy', mouth: 'smile', blush: .55, brows: { r: .3 } },
  laugh:      { eyes: 'laugh', mouth: 'laugh', blush: .6, brows: { r: .45, t: .25 }, tilt: -.1 },
  excited:    { eyes: 'wide', mouth: 'open', brows: { r: .8 }, emote: 'spark' },
  love:       { eyes: 'heart', mouth: 'smile', blush: 1, brows: { r: .4, t: .3 }, emote: 'hearts' },
  proud:      { eyes: 'closed', mouth: 'smile', brows: { r: .25 }, tilt: -.12, emote: 'spark' },
  playful:    { eyes: ['open', 'happy'], mouth: 'tongue', brows: { r: .2, a: [.5, -.1] }, tilt: .1 },
  smug:       { eyes: 'narrow', mouth: 'smirk', lookX: .45, brows: { r: .1, a: [-.2, .45] }, tilt: -.05 },
  shy:        { eyes: 'look', mouth: 'pout', lookX: -.7, lookY: .7, blush: 1, brows: { r: .3, t: .5 }, tilt: .14 },
  surprised:  { eyes: 'wide', mouth: 'O', brows: { r: 1.1 }, emote: '!' },
  scared:     { eyes: 'scared', mouth: 'grimace', tint: 'pale', tintK: .45, brows: { r: .9, t: .9 }, emote: 'sweat' },
  nervous:    { eyes: 'look', mouth: 'grimace', lookX: .8, brows: { r: .3, t: .65 }, emote: 'sweat' },
  sad:        { eyes: 'sad', mouth: 'frown', lookY: .6, brows: { t: 1 }, tilt: .12, emote: 'cloud' },
  cry:        { eyes: 'cry', mouth: 'wail', blush: .5, brows: { r: .2, t: 1.1 } },
  angry:      { eyes: 'angry', mouth: 'teeth', tint: 'flush', tintK: .22, brows: { r: -.25, t: -1 }, emote: 'anger' },
  furious:    { eyes: 'angry', mouth: 'shout', tint: 'flush', tintK: .42, brows: { r: -.35, t: -1.25 }, emote: 'steam' },
  disgusted:  { eyes: ['narrow', 'squeeze'], mouth: 'yuck', tint: 'green', tintK: .28, brows: { t: -.4, a: [.2, -.25] }, tilt: -.08 },
  confused:   { eyes: ['open', 'narrow'], mouth: 'wobble', brows: { a: [.75, -.25] }, tilt: .16, emote: '?' },
  thinking:   { eyes: 'look', mouth: 'flat', lookX: .5, lookY: -.8, brows: { a: [.1, .55] }, emote: 'dots' },
  idea:       { eyes: 'shine', mouth: 'grin', brows: { r: .9 }, emote: 'bulb' },
  sleepy:     { eyes: 'sleepy', mouth: 'yawn', brows: { r: -.05, t: .2 }, tilt: .18, emote: 'zzz' },
  bored:      { eyes: 'narrow', mouth: 'flat', lookY: .35, lookX: -.4, brows: { r: -.1 } },
  determined: { eyes: 'determined', mouth: 'flat', brows: { r: -.1, t: -.65 }, emote: 'spark' },
  yummy:      { eyes: 'happy', mouth: 'tongue', blush: .6, brows: { r: .4 }, emote: 'hearts' },
};
const FACE_ORDER = Object.keys(FACES);
const faceOf = (name, over = {}) => { const F = FACES[name] || FACES.neutral; return { face: { ...F, ...over }, tilt: F.tilt || 0, emote: F.emote }; };

// ---------- poses ----------
// Each returns person() options for a character (C), authored facing right.
const POSES = {
  stand:    C => ({ view: 'front', ...faceOf('neutral') }),
  walk:     C => ({ view: 'side', ...faceOf('happy'), emote: null, legs: [[.42, -.08], [-.36, -.5]], arms: [[-.42, .3], [.5, .4]], dy: -.08 }),
  run:      C => ({ view: 'side', ...faceOf('determined'), emote: null, lean: .22, dy: -.35, legs: [[1.0, -1.45], [-.75, -1.15]], arms: [[-.85, 1.75], [.85, 1.35]] }),
  jump:     C => ({ view: 'front', ...faceOf('excited'), dy: -1.5, legs: [[-.32, .75], [.32, -.75]], arms: [[-2.45, -.25, 'open'], [2.45, .25, 'open']] }),
  sit:      C => ({ view: 'side', ...faceOf('happy'), emote: null, chair: true, dy: C.leg / 2 - .02, legs: [[1.57, -1.57], [1.5, -1.5]], arms: [[.62, .55], [.75, .5]] }),
  wave:     C => ({ view: 'front', ...faceOf('happy'), arms: [[-.13, .14], [2.15, .75, 'open']] }),
  point:    C => ({ view: 'q', ...faceOf('excited'), emote: '!', arms: [[.05, .2], [1.82, -.08, 'point']] }),
  cheer:    C => ({ view: 'front', ...faceOf('laugh'), dy: -.25, arms: [[-2.6, -.2, 'open'], [2.6, .2, 'open']] }),
  crossed:  C => ({ view: 'front', ...faceOf('smug'), arms: [[-.06, 1.62], [.06, -1.55]] }),
  hips:     C => ({ view: 'front', ...faceOf('proud'), arms: [{ to: 'hip0', bend: -1 }, { to: 'hip1', bend: 1 }], legs: [[-.12, 0], [.12, 0]] }),
  thinking: C => ({ view: 'q', ...faceOf('thinking'), arms: [{ to: 'chin', bend: -1 }, [.15, .3]] }),
  shrug:    C => ({ view: 'front', ...faceOf('confused'), tilt: .14, arms: [[-.75, -1.35, 'open'], [.75, 1.35, 'open']] }),
  sneak:    C => ({ view: 'side', ...faceOf('smug', { lookX: .9 }), lean: .32, dy: .35, legs: [[.75, -1.25], [-.3, -.85]], arms: [[.35, 1.7, 'open'], [.85, 1.25, 'open']] }),
  sad:      C => ({ view: 'q', ...faceOf('sad'), lean: .1, tilt: .28, arms: [[.02, .05], [.05, .05]] }),
  scared:   C => ({ view: 'front', ...faceOf('scared'), lean: -.05, dy: .12, legs: [[-.22, .3], [.22, -.3]], arms: [{ to: 'cheek0', bend: -1, hand: 'open' }, { to: 'cheek1', bend: 1, hand: 'open' }] }),
};
const POSE_ORDER = Object.keys(POSES);
// One pose per character, taken from what they're doing in the illustration.
const SIGNATURE = {
  girl:    { label: 'chatting', o: C => ({ view: 'q', ...faceOf('playful', { mouth: 'open' }), arms: [[.1, .2], [1.2, 1.2, 'open']] }) },
  boy:     { label: 'eating', o: C => ({ view: 'q', ...faceOf('yummy', { mouth: 'chew', eyes: 'open' }), emote: 'hearts', arms: [{ to: [.55, -C.torso - 1.0], bend: -1, prop: 'chop' }, { to: [.95, -C.torso - .75], bend: 1 }] }) },
  mom:     { label: 'laughing', o: C => ({ view: 'q', ...faceOf('laugh'), lean: -.06, arms: [[.25, .3], [1.45, .25, 'open']] }) },
  dad:     { label: 'at the grill', o: C => ({ view: 'q', ...faceOf('laugh'), arms: [[.3, 1.6, 'fist', 'fries'], [1.95, .85, 'fist', 'spatula']] }) },
  grandma: { label: 'giggling', o: C => ({ view: 'q', ...faceOf('laugh', { eyes: 'laugh' }), arms: [{ to: 'mouth', bend: -1, hand: 'open' }, [.15, .2]] }) },
  grandpa: { label: 'tea time', o: C => ({ view: 'q', ...faceOf('smug', { mouth: 'smile' }), arms: [{ to: [.85, -C.torso + .55], bend: -1, prop: 'tea' }, [.12, .2]] }) },
};
