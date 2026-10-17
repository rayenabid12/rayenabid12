import type React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { SeriesTitle } from "../../brand/SeriesTitle";
import { alternate, rigBox, tighten } from "../../final/kit";
import { BoumMonster } from "../../rig/BoumMonster";
import { coolBlink, MELO_COOL } from "../../rig/meloKeys";
import { blinkAt, type Key, sortKeys } from "../../rig/pose";
import { candyText, colors, displayFont, scriptFont } from "../../theme";
import { DaySky, DaySkyline, GROUND, Park } from "../ep3/ParkSet";
import { Confetti } from "../ep4/HomeSet";
import { Bubble, type Cam, camAt, clamp, lerp, makeDuo, MELO_GUM, PINK_GUM, Pop, PopBurst, Say } from "../shared/stage";
import { BoumOMeter, BushFront, LEVELS, METER_TOP, METER_X, PUCK_REST } from "./FairSet";

// "Les Aventures Boum Boum", Episode 6: "Le Secret de Mélo" (45 s).
// Mélo, so cool, never lets his bubbles go BOUM... because he is afraid of it.
// The pink monster laughs at first, then sees his friend is really scared,
// and helps him, gently, one tiny "pop" at a time.
// « Tout le monde a peur de quelque chose… et un vrai ami ne se moque pas : il aide. »

const WIDTH = 320;
const SCALE = WIDTH / 400;
const PINK_AT: [number, number] = [860, GROUND];
const MELO_AT: [number, number] = [1240, GROUND];
const XP = (wx: number) => (wx - PINK_AT[0]) / SCALE;
const XM = (wx: number) => (wx - MELO_AT[0]) / SCALE;
const BUSH_X = 1560;

// beats (30 fps)
const PINK_BLOW = 104;
const PINK_BOUM = 152;
const MELO_BLOW = 246;
const DEFLATE = 296;
const PRANK = 404;
const PRANK_POP = 430;
const HIDE = 472;
const SIT = 600;
const LESSON = 700;
const TINY1 = 738; // pink's tiny pop
const TINY2 = 790; // Mélo's first tiny pop
const MEDIUM = 850; // Mélo's medium pop (he laughs)
const BIG_BLOW = 966;
const HESITATE = 1024;
const HANDS = 1040;
export const MEGA = 1064;
const DING = 1075;
export const SECRET_END = 1268;

const jump = (s: number, x0: number, x1: number, h: number, d = 15): Key[] => [
  { f: s, x: x0, y: 0, sy: 1 },
  { f: s + 3, sy: 0.86 },
  { f: s + 4, x: x0, y: 0 },
  { f: s + 6, sy: 1.08, ease: "out" },
  { f: s + 4 + Math.round((d - 4) / 2), y: -h, ease: "out" },
  { f: s + d, x: x1, ease: "inOut" },
  { f: s + d, y: 0, ease: "in" },
  { f: s + d + 1, sy: 0.84, ease: "snap" },
  { f: s + d + 5, sy: 1, ease: "out" },
];
const pucker = { cheeks: 1, mouthOpen: 0.3, mouthWidth: 0.28 };

// ---------------------------------------------------------------- the pink monster
const PINK_KEYS: Key[] = tighten(
  sortKeys([
    { f: 0, x: 0, y: 0, turn: -0.4, lookX: -0.7, armL: 20, armR: 20, mouthOpen: 0.85, mouthWidth: 1, smile: 1, cheeks: 0, eyeScale: 1, squint: 0, browTilt: 0, browY: 0, sy: 1, rot: 0, bend: 0 },
    // his turn: a big BOUM
    { f: PINK_BLOW, ...pucker, browTilt: -10, sy: 1.04 },
    { f: PINK_BOUM - 2, sy: 1.08, cheeks: 1 },
    { f: PINK_BOUM, cheeks: 0, mouthOpen: 0.9, mouthWidth: 1, browTilt: 0, eyeScale: 1.2, sy: 0.9, ease: "snap" },
    { f: PINK_BOUM + 4, sy: 1, lookY: -1, lookX: -0.4, eyeScale: 1.15, ease: "out" },
    { f: 172, lookY: 0, squint: 1, armL: 150, armR: 150, y: -40, ease: "out" },
    { f: 178, y: 0, ease: "in" },
    // « À toi ! »
    { f: 184, squint: 0, turn: 0.4, lookX: 0.8, armL: 20, armR: 60, curlR: -0.3, eyeScale: 1 },
    ...jump(204, 0, XP(1400), 80, 16),
    { f: 222, turn: -0.4, lookX: -0.8, armR: 20, curlR: 0 },
    // « Bah ?! Fais BOUM ! »
    { f: 322, eyeScale: 1, browY: 0 },
    { f: 328, armL: 62, armR: 62, curlL: -0.6, curlR: -0.6, eyeScale: 1.2, browY: -14, mouthOpen: 0.9, mouthWidth: 0.6, ease: "snap" },
    { f: 354, armL: 20, armR: 20, curlL: 0, curlR: 0, eyeScale: 1, browY: 0, mouthOpen: 0.85, mouthWidth: 1 },
    // ...a prank: sneaks up behind him
    { f: 380, browTilt: 0, squint: 0, smile: 1 },
    { f: 384, browTilt: -12, squint: 0.35, mouthOpen: 0.4, mouthWidth: 0.8, smile: 1, turn: -0.3, lookX: -0.6 },
    ...jump(386, XP(1400), XP(1150), 30, 14).map((k) => (k.sy !== undefined && k.sy === 1 && k.f > 390 ? { ...k, sy: 0.92 } : k)),
    { f: PRANK, ...pucker, squint: 0.35, browTilt: -12 },
    { f: PRANK_POP - 1, cheeks: 1 },
    { f: PRANK_POP, cheeks: 0, mouthOpen: 0.9, mouthWidth: 1, squint: 1, ease: "snap" },
    // ...and laughs
    { f: 444, turn: 0.4, lookX: 0.8, squint: 1, mouthOpen: 1, mouthWidth: 1, armR: 40, curlR: -0.3, browTilt: 0 },
    ...alternate(446, 504, 5, { y: -10, sy: 1.02 }, { y: 0, sy: 0.97 }),
    // ...until he sees his friend is really scared
    { f: 510, y: 0, sy: 1, squint: 1, mouthOpen: 1 },
    { f: 522, squint: 0, eyeScale: 1.05, mouthOpen: 0.4, mouthWidth: 0.6, smile: 0.2, armR: 20, curlR: 0 },
    { f: 540, browTilt: 18, smile: -0.6, mouthOpen: 0.1, mouthWidth: 0.5, eyeScale: 1 },
    // goes and sits next to him
    ...jump(562, XP(1150), XP(1270), 40, 16),
    ...jump(582, XP(1270), XP(1340), 25, 12),
    { f: SIT, sy: 1, y: 0 },
    { f: SIT + 8, sy: 0.84, y: 18, legLift: 0.5, armL: -20, armR: -20, turn: 0.3, lookX: 0.7, browTilt: 16, ease: "out" },
    ...blinkAt(626),
    // « Promis. On essaie… tout doucement ? »
    { f: 644, browTilt: 4, smile: 0.7, mouthOpen: 0.45, mouthWidth: 0.7 },
    { f: 666, browY: -6, mouthOpen: 0.6, mouthWidth: 0.8, smile: 1, eyeScale: 1.05 },
    { f: LESSON - 2, sy: 0.84, y: 18, legLift: 0.5 },
    { f: LESSON + 6, sy: 1, y: 0, legLift: 0, armL: 20, armR: 20, ease: "out" },
    ...jump(LESSON + 8, XP(1340), XP(1440), 30, 12),
    // a tiny bubble, a tiny "pop"
    { f: 712, ...pucker, cheeks: 0.5 },
    { f: TINY1, cheeks: 0, mouthOpen: 0.85, mouthWidth: 1, smile: 1, eyeScale: 1.05 },
    // claps for Mélo
    ...alternate(796, 812, 4, { armL: 70, armR: 70 }, { armL: 30, armR: 30 }),
    { f: 856, squint: 1, mouthOpen: 1 },
    { f: 880, squint: 0, mouthOpen: 0.85 },
    // back to the Boum-o-mètre
    ...jump(930, XP(1440), XP(1150), 60, 16),
    { f: 950, turn: -0.3, lookX: -0.7 },
    // the hand
    { f: HESITATE + 6, armL: 20, browTilt: 0, smile: 1, mouthOpen: 0.5, mouthWidth: 0.7 },
    { f: HANDS, armL: 38, curlL: -0.2, ease: "out" },
    { f: 1048, sy: 0.95, lookY: 0.2 },
    { f: 1054, sy: 1, lookY: 0 },
    // MÉGA BOUM
    { f: MEGA, eyeScale: 1.35, browY: -20, mouthOpen: 0.9, mouthWidth: 0.6, armL: 20, curlL: 0, ease: "snap" },
    { f: 1072, lookY: -1, lookX: -0.3, eyeScale: 1.2 },
    { f: 1086, lookY: 0, squint: 1, mouthOpen: 1, mouthWidth: 1, smile: 1, armL: 140, armR: 140 },
    ...alternate(1088, 1146, 6, { y: -44, sy: 1.04 }, { y: 0, sy: 0.94 }),
    { f: 1150, y: 0, sy: 1, armL: 40, armR: 60, squint: 1, rot: -6, bend: -10, turn: -0.3, lookX: -0.6 },
    { f: SECRET_END, rot: -6 },
  ]),
);

// ---------------------------------------------------------------- Mélo
const MELO_KEYS: Key[] = tighten(
  sortKeys([
    { f: 0, ...MELO_COOL, x: 0, y: 0, turn: -0.3, lookX: -0.6, armL: 8, armR: 8, eyeScale: 1, squint: 0, browTilt: 0, sy: 1, rot: 0, bend: 0, cheeks: 0 },
    // the first clue: he covers his ears at the BOUM
    { f: PINK_BOUM - 1, armL: 8, armR: 8, blink: 0.24, sy: 1 },
    { f: PINK_BOUM + 1, armL: 112, armR: 112, curlL: 1.3, curlR: 1.3, blink: 1, sy: 0.9, ease: "snap" },
    { f: 166, armL: 112, armR: 112, blink: 1 },
    { f: 172, armL: 8, armR: 8, curlL: 0, curlR: 0, blink: 0.24, sy: 1, lookX: 0.6, turn: 0.1 },
    { f: 186, lookX: -0.6, turn: -0.3 },
    // his turn
    ...jump(222, 0, XM(900), 70, 16),
    { f: 240, turn: -0.4, lookX: -0.7 },
    { f: MELO_BLOW, ...pucker, cheeks: 0.8, blink: 0.35 },
    { f: 288, blink: 0.35 },
    { f: 292, lookX: 0.6, eyeScale: 1.1, blink: 0.1 },
    // ...and deflates it, quietly
    { f: DEFLATE, lookX: -0.7, eyeScale: 1 },
    { f: DEFLATE + 14, cheeks: 0, mouthOpen: 0.2, mouthWidth: 0.4 },
    { f: 318, ...MELO_COOL, smile: 0.6 },
    ...coolBlink(330),
    // « Pas envie. »
    { f: 354, armL: 8, armR: 8, turn: -0.2 },
    { f: 360, armL: 62, armR: 62, curlL: -0.6, curlR: -0.6, blink: 0.35, lookX: 0.7, turn: 0.2, mouthOpen: 0.3, mouthWidth: 0.6, smile: 0.5, ease: "out" },
    { f: 380, armL: 8, armR: 8, curlL: 0, curlR: 0, ...MELO_COOL, lookX: -0.6, turn: -0.3 },
    // POP! right behind him
    { f: PRANK_POP - 1, y: 0, sy: 1, eyeScale: 1, blink: 0.24 },
    { f: PRANK_POP + 1, y: -150, sy: 1.25, eyeScale: 1.5, pupil: 0.4, blink: 0, browY: -30, mouthOpen: 1, mouthWidth: 0.42, smile: 1, armL: 160, armR: 160, ease: "snap" },
    { f: PRANK_POP + 8, y: 0, sy: 1, ease: "in" },
    // runs and hides behind the bush
    { f: PRANK_POP + 10, x: XM(900), run: 0 },
    { f: PRANK_POP + 14, turn: 0.5, lookX: 0.8, run: 1, rot: 8, browTilt: 20, ease: "out" },
    ...alternate(PRANK_POP + 14, HIDE - 4, 4, { y: -16 }, { y: 0 }),
    { f: HIDE - 2, x: XM(BUSH_X), run: 1, y: 0 },
    { f: HIDE, run: 0, rot: 0, sy: 0.85, legLift: 0.3, armL: 112, armR: 112, curlL: 1.3, curlR: 1.3, turn: -0.3, lookX: -0.5, eyeScale: 1.2, pupil: 0.7, browTilt: 22, browY: -4, mouthOpen: 0.2, mouthWidth: 0.5, smile: -1, ease: "snap" },
    ...alternate(HIDE + 4, SIT + 4, 2, { x: XM(BUSH_X) + 2.5 }, { x: XM(BUSH_X) - 2.5 }).map((k) => ({ ...k, ease: "linear" as const })),
    ...blinkAt(540),
    // his friend sits down next to him
    { f: SIT + 6, armL: -20, armR: -20, curlL: 0, curlR: 0, turn: -0.4, lookX: -0.8, eyeScale: 1.05, pupil: 1 },
    { f: 612, mouthOpen: 0.3, mouthWidth: 0.5, browTilt: 18 },
    { f: 640, mouthOpen: 0, mouthWidth: 0.5 },
    { f: 662, smile: 0.3, browTilt: 8 },
    { f: 692, lookY: 0.3, sy: 0.82 },
    { f: 697, lookY: 0, sy: 0.85 },
    // steps out of the bush
    { f: LESSON - 1, sy: 0.85, legLift: 0.3 },
    ...jump(LESSON, XM(BUSH_X), XM(1770), 60, 16),
    { f: LESSON + 16, legLift: 0, browTilt: 10, smile: 0.2, turn: -0.4, lookX: -0.8 },
    // the tiny pops
    { f: TINY1 - 1, blink: 0, sy: 1 },
    { f: TINY1 + 1, blink: 1, sy: 0.95, ease: "snap" },
    { f: TINY1 + 6, blink: 0, eyeScale: 1.12, smile: 0.6, browTilt: 0, mouthOpen: 0.3, mouthWidth: 0.6, sy: 1 },
    { f: 752, ...pucker, cheeks: 0.5, eyeScale: 1.05 },
    { f: TINY2 - 1, cheeks: 0.5 },
    { f: TINY2 + 1, cheeks: 0, blink: 1, mouthOpen: 0.3, ease: "snap" },
    { f: TINY2 + 6, blink: 0, squint: 0.5, smile: 1, mouthOpen: 0.6, mouthWidth: 0.8, eyeScale: 1.1 },
    { f: 812, squint: 0, ...pucker, cheeks: 0.8, eyeScale: 1.05, browTilt: -6 },
    { f: MEDIUM - 1, cheeks: 0.8, sy: 1 },
    { f: MEDIUM + 1, cheeks: 0, blink: 1, sy: 0.92, ease: "snap" },
    // ...and he laughs
    { f: MEDIUM + 6, blink: 0, squint: 1, mouthOpen: 1, mouthWidth: 1, smile: 1, browY: -8, sy: 1, ease: "out" },
    ...alternate(MEDIUM + 8, 878, 4, { y: -10 }, { y: 0 }),
    // « Allez ! »
    { f: 882, y: 0, squint: 0, browTilt: -14, browY: 4, mouthOpen: 0.7, mouthWidth: 0.9, smile: 1, eyeScale: 1 },
    ...jump(904, XM(1770), XM(1150), 70, 16),
    ...jump(923, XM(1150), XM(900), 50, 16),
    { f: 942, turn: -0.4, lookX: -0.7 },
    // the big one
    { f: BIG_BLOW, ...pucker, browTilt: -12, eyeScale: 1 },
    { f: HESITATE - 2, eyeScale: 1, browTilt: -12 },
    { f: HESITATE + 4, eyeScale: 1.35, pupil: 0.7, browTilt: 18, turn: 0.3, lookX: 0.8, ease: "out" },
    { f: HANDS, armR: 38, curlR: -0.2, ease: "out" },
    { f: 1056, sy: 0.95, lookY: 0.2, pupil: 1, eyeScale: 1.1, browTilt: 0 },
    { f: 1060, sy: 1, lookY: 0, turn: -0.4, lookX: -0.7 },
    { f: 1062, blink: 1, browTilt: -14 },
    // MÉGA BOUM
    { f: MEGA, cheeks: 0, blink: 0, y: -50, eyeScale: 1.45, pupil: 0.5, browY: -26, browTilt: 0, mouthOpen: 0.95, mouthWidth: 0.45, smile: 1, armR: 20, curlR: 0, ease: "snap" },
    { f: MEGA + 6, y: 0, ease: "in" },
    { f: 1072, lookY: -1, lookX: -0.3, eyeScale: 1.3 },
    // he laughs for real
    { f: 1086, lookY: 0, eyeScale: 1, pupil: 1, squint: 1, mouthOpen: 1, mouthWidth: 1, smile: 1, armL: 140, armR: 140, browY: -10 },
    ...alternate(1091, 1146, 6, { y: -40, sy: 1.04 }, { y: 0, sy: 0.94 }),
    { f: 1150, y: 0, sy: 1, armL: 60, armR: 40, squint: 1, rot: 6, bend: 10, turn: 0.3, lookX: 0.6 },
    { f: SECRET_END, rot: 6 },
  ]),
);

const { poseOf, mouthOf, toWorld } = makeDuo({ pinkAt: PINK_AT, meloAt: MELO_AT, width: WIDTH, pinkKeys: PINK_KEYS, meloKeys: MELO_KEYS });

// ---------------------------------------------------------------- bubbles + puck
type Blow = { who: "pink" | "melo"; from: number; full: number; end: number; r: number; dir: number; deflate?: boolean };
const BLOWS: Blow[] = [
  { who: "pink", from: PINK_BLOW + 2, full: PINK_BOUM - 6, end: PINK_BOUM, r: 190, dir: -1 },
  { who: "melo", from: MELO_BLOW + 2, full: 288, end: DEFLATE + 16, r: 170, dir: -1, deflate: true },
  { who: "pink", from: PRANK + 2, full: PRANK_POP - 4, end: PRANK_POP, r: 110, dir: -1 },
  { who: "pink", from: 714, full: TINY1 - 6, end: TINY1, r: 32, dir: 1 },
  { who: "melo", from: 754, full: TINY2 - 6, end: TINY2, r: 34, dir: -1 },
  { who: "melo", from: 814, full: MEDIUM - 6, end: MEDIUM, r: 82, dir: -1 },
  { who: "melo", from: BIG_BLOW + 2, full: 1018, end: MEGA, r: 240, dir: -1 },
];
const blowR = (b: Blow, f: number) => {
  if (f < b.from || f >= b.end) return 0;
  if (b.deflate && f > DEFLATE) return lerp(f, [DEFLATE, b.end], [b.r, 0], Easing.in(Easing.quad));
  return lerp(f, [b.from, b.full], [0, b.r], Easing.inOut(Easing.quad));
};

const puckY = (f: number) => {
  if (f >= MEGA && f < 1150) return f < DING ? lerp(f, [MEGA, DING], [PUCK_REST, METER_TOP + 90], Easing.out(Easing.cubic)) : f < 1112 ? METER_TOP + 90 + Math.sin(f * 2) * 4 : lerp(f, [1112, 1140], [METER_TOP + 90, PUCK_REST], Easing.in(Easing.quad));
  if (f >= PINK_BOUM && f < 196) return f < 164 ? lerp(f, [PINK_BOUM, 164], [PUCK_REST, LEVELS[2].y], Easing.out(Easing.cubic)) : lerp(f, [172, 194], [LEVELS[2].y, PUCK_REST], Easing.in(Easing.quad));
  if (f >= DEFLATE + 16 && f < 336) return interpolate(f, [DEFLATE + 16, 320, 336], [PUCK_REST, LEVELS[0].y + 40, PUCK_REST], clamp);
  return PUCK_REST;
};

// a tear (rig coordinates)
const Tear: React.FC<{ y: number; o: number }> = ({ y, o }) => (
  <path d={`M 268 ${y - 16} C 278 ${y - 2} 278 ${y + 10} 268 ${y + 10} C 258 ${y + 10} 258 ${y - 2} 268 ${y - 16} Z`} fill="#BFEFFF" opacity={o} stroke="white" strokeWidth={2} />
);

// ---------------------------------------------------------------- the world
const World: React.FC<{ f: number }> = ({ f }) => {
  const pink = poseOf("pink", f);
  const melo = poseOf("melo", f);
  const pm = mouthOf("pink", pink);
  const mm = mouthOf("melo", melo);
  const ring = interpolate(f, [DING, DING + 4, 1110], [0, 1, 0], clamp);
  const tear = f >= 520 && f < SIT + 20 ? <Tear y={lerp(f, [520, SIT + 10], [232, 290])} o={lerp(f, [520, 526, SIT + 6, SIT + 20], [0, 1, 1, 0])} /> : null;
  const handMid = (() => {
    const a = toWorld("pink", pink, 74 + Math.cos(((118 + pink.armL) * Math.PI) / 180) * 134, 252 + Math.sin(((118 + pink.armL) * Math.PI) / 180) * 134);
    const b = toWorld("melo", melo, 370 + Math.cos(((62 - melo.armR) * Math.PI) / 180) * 134, 262 + Math.sin(((62 - melo.armR) * Math.PI) / 180) * 134);
    return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  })();

  return (
    <>
      <Park />
      <BoumOMeter puck={puckY(f)} ring={ring} f={f} />
      {f >= LESSON + 4 ? <BushFront x={BUSH_X} w={300} /> : null}
      <BoumMonster pose={melo} skin="melo" over={<g>{tear}</g>} style={rigBox(MELO_AT, WIDTH)} />
      <BoumMonster pose={pink} style={rigBox(PINK_AT, WIDTH)} />
      {f < LESSON + 4 ? <BushFront x={BUSH_X} w={300} shake={f >= HIDE && f < SIT ? Math.sin(f * 2.2) * 3 : 0} /> : null}
      {BLOWS.map((b, i) => {
        const r = blowR(b, f);
        if (r <= 1) return null;
        const m = b.who === "pink" ? pm : mm;
        return <Bubble key={i} id={`b${i}`} x={m[0] + b.dir * r * 0.8} y={m[1] + r * 0.05} r={r} tone={b.who === "pink" ? PINK_GUM : MELO_GUM} wob={i === 6 && f > 1010 ? Math.sin(f * 1.5) * 0.04 : Math.sin(f) * 0.01} />;
      })}
      {BLOWS.filter((b) => !b.deflate).map((b, i) => {
        const m = mouthOf(b.who, poseOf(b.who, b.end - 1));
        return <PopBurst key={i} f={f} at={b.end} x={m[0] + b.dir * b.r * 0.8} y={m[1]} r={b.r} tones={b.who === "pink" ? PINK_GUM : MELO_GUM} n={b.r > 100 ? 14 : 8} />;
      })}
      {/* little "pop" words during the lessons */}
      {[
        [TINY1, pm, "pop", 1],
        [TINY2, mm, "pop", -1],
        [MEDIUM, mm, "POP !", -1],
      ].map(([at, m, w, d], i) => {
        const t = at as number;
        const s = interpolate(f, [t, t + 3, t + 14, t + 18], [0, 1, 1, 0], clamp);
        const mp = m as [number, number];
        return s > 0 ? (
          <div key={i} style={{ position: "absolute", left: mp[0] + (d as number) * 90 - 90, top: mp[1] - 160, width: 180, textAlign: "center", fontFamily: displayFont, fontSize: i === 2 ? 72 : 52, color: "white", WebkitTextStroke: "6px #E3123B", paintOrder: "stroke", scale: s }}>
            {w as string}
          </div>
        ) : null;
      })}
      {/* the meter's tiny « pff... » */}
      {(() => {
        const s = interpolate(f, [DEFLATE + 16, DEFLATE + 20, DEFLATE + 36, DEFLATE + 40], [0, 1, 1, 0], clamp);
        return s > 0 ? <div style={{ position: "absolute", left: METER_X - 260, top: LEVELS[0].y - 40, fontFamily: displayFont, fontSize: 64, color: "#9AA0B4", scale: s, rotate: "-8deg" }}>pff…</div> : null;
      })()}
      {/* the two hands meet */}
      {f >= HANDS + 4 && f < MEGA ? (
        <div style={{ position: "absolute", left: handMid[0] - 26, top: handMid[1] - 26, width: 52, height: 52, background: "#FFF3C4", clipPath: "polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)", opacity: 0.6 + 0.4 * Math.sin(f / 2), rotate: `${f * 4}deg` }} />
      ) : null}
      {/* speech */}
      <Say f={f} from={184} to={202} x={pm[0] + 40} y={pm[1] - 280} text="À toi !" color={colors.logoRed} tail="left" />
      <Say f={f} from={328} to={354} x={pm[0] + 20} y={pm[1] - 280} text="Bah ?! Fais BOUM !" color={colors.logoRed} tail="left" size={52} />
      <Say f={f} from={360} to={382} x={mm[0] + 20} y={mm[1] - 280} text="Pas envie." color="#2E9E3E" tail="left" size={56} />
      <Say f={f} from={470} to={506} x={pm[0] + 20} y={pm[1] - 280} text="Ha ha ! T'as peur d'un petit BOUM ?" color={colors.logoRed} tail="left" size={40} />
      <Say f={f} from={612} to={640} x={mm[0] - 20} y={mm[1] - 210} text="Ne le dis à personne…" color="#2E9E3E" tail="right" size={44} />
      <Say f={f} from={644} to={662} x={pm[0] + 20} y={pm[1] - 250} text="Promis." color={colors.logoRed} tail="left" size={52} />
      <Say f={f} from={666} to={692} x={pm[0] + 60} y={pm[1] - 250} text="On essaie… tout doucement ?" color={colors.logoRed} tail="left" size={42} />
      <Say f={f} from={882} to={902} x={mm[0] - 20} y={mm[1] - 280} text="Allez !" color="#2E9E3E" tail="right" />
    </>
  );
};

// ---------------------------------------------------------------- camera
const MAIN: Cam[] = [
  [0, 800, 380, 0.7], // the bell of the Boum-o-mètre, against the sky
  [56, 800, 380, 0.7],
  [92, 950, 1150, 0.85], // the game, the two friends
  [148, 920, 1160, 0.9],
  [162, 820, 820, 0.68], // the puck flies
  [178, 980, 1160, 0.9],
  [240, 1000, 1180, 1.0],
  [300, 960, 1200, 1.1], // Mélo's perfect bubble... deflated
  [330, 1060, 1180, 0.95],
  [380, 1060, 1180, 0.95],
  [428, 1000, 1200, 1.05], // the prank
  [446, 1200, 1150, 0.8],
  [500, 1300, 1180, 0.9],
  [530, 1560, 1290, 1.35], // Mélo hiding, shaking
  [580, 1560, 1290, 1.35],
  [600, 1480, 1240, 1.1],
  [690, 1520, 1260, 1.2], // the promise
  [722, 1600, 1260, 1.2], // the lessons
  [900, 1600, 1260, 1.2],
  [930, 1150, 1180, 0.85],
  [966, 1020, 1160, 0.95],
  [HESITATE, 1030, 1200, 1.15], // the hesitation, the hand
  [MEGA - 2, 1030, 1200, 1.15],
  [DING - 3, 820, 780, 0.62], // to the bell!
  [1088, 820, 780, 0.62],
  [1102, 1030, 1170, 0.9],
  [SECRET_END, 1030, 1180, 0.95],
];

const Caption: React.FC<{ f: number; from: number; to: number; text: string }> = ({ f, from, to, text }) => {
  const o = interpolate(f, [from, from + 10, to - 10, to], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1590, textAlign: "center", opacity: o, translate: `0px ${(1 - o) * 20}px` }}>
      <span style={{ display: "inline-block", padding: "18px 40px", borderRadius: 40, background: "rgba(40,30,70,0.55)", fontFamily: scriptFont, fontSize: 64, color: "#FFF3C4", textShadow: "0 3px 0 rgba(0,0,0,0.35)", lineHeight: 1.2 }}>{text}</span>
    </div>
  );
};

export const SecretScene: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camAt(MAIN, f);
  const shake = (from: number, amt: number) => (f >= from && f < from + 12 ? (1 - (f - from) / 12) * amt : 0);
  const s = shake(PINK_BOUM, 6) + shake(PRANK_POP, 8) + shake(MEGA, 18) + shake(DING, 8);
  const cx = cam.cx + Math.sin(f * 2.7) * s;
  const cy = cam.cy + Math.cos(f * 3.1) * s;
  const sad = f >= HIDE && f < LESSON ? lerp(f, [HIDE, 520, 680, LESSON], [0, 0.3, 0.3, 0]) : 0;

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#9FE0F7" }}>
      <DaySky cy={cy} />
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${540 - cx * cam.z}px, ${960 - cy * cam.z}px) scale(${cam.z})` }}>
        <div style={{ position: "absolute", left: 0, top: 0, translate: `${(cx - 700) * 0.5}px 0px` }}>
          <DaySkyline cx={700} />
        </div>
        <World f={f} />
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 45%, rgba(40,30,80,0.9) 100%)", opacity: sad }} />

      <SeriesTitle episode={6} title="Le Secret de Mélo" titleColor="#2E9E3E" outAt={56} />
      <Caption f={f} from={60} to={120} text="Au parc, il y avait un jeu : le Boum-o-mètre." />
      <Caption f={f} from={522} to={600} text="Mélo avait un secret : il avait peur du BOUM." />
      <Caption f={f} from={756} to={840} text="Petit à petit…" />
      <Caption f={f} from={1110} to={1186} text="Tout le monde a peur de quelque chose…" />
      <Caption f={f} from={1190} to={SECRET_END + 6} text="…et un vrai ami ne se moque pas : il aide." />
      <Pop f={f} at={PINK_BOUM} out={PINK_BOUM + 18} top={360}>
        <div style={{ fontFamily: displayFont, fontSize: 170, ...candyText(colors.logoRed, colors.white, 15), rotate: "-6deg" }}>BOUM !</div>
      </Pop>
      <Pop f={f} at={PRANK_POP} out={PRANK_POP + 14} top={360}>
        <div style={{ fontFamily: displayFont, fontSize: 160, ...candyText("#FFFFFF", "#B8578C", 14), rotate: "6deg" }}>POP !</div>
      </Pop>
      <Pop f={f} at={MEGA} out={MEGA + 40} top={280}>
        <div style={{ fontFamily: displayFont, fontSize: 200, lineHeight: 1, ...candyText("#FFD84D", colors.logoRed, 17), rotate: "-6deg" }}>
          MÉGA
          <br />
          BOUM !
        </div>
      </Pop>
      <Pop f={f} at={DING} out={DING + 22} top={700}>
        <div style={{ fontFamily: displayFont, fontSize: 120, ...candyText("#FFFFFF", "#C99A1A", 12), rotate: "8deg" }}>DING !</div>
      </Pop>
      <Confetti from={DING} />
    </AbsoluteFill>
  );
};
