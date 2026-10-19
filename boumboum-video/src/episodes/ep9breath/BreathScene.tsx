import type React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { SeriesTitle } from "../../brand/SeriesTitle";
import { alternate, rigBox, tighten } from "../../final/kit";
import { BoumMonster } from "../../rig/BoumMonster";
import { coolBlink, MELO_COOL } from "../../rig/meloKeys";
import { type Key, sortKeys } from "../../rig/pose";
import { colors, displayFont, scriptFont } from "../../theme";
import { DaySky, DaySkyline, GROUND, Park } from "../ep3/ParkSet";
import { Bubble, type Cam, camAt, clamp, lerp, makeDuo, MELO_GUM, PINK_GUM, Pop, PopBurst, Say } from "../shared/stage";

// "Les Aventures Boum Boum", Episode 9: "Le Souffle de Boum Boum" (43 s).
// His tower of blocks falls down. Anger fills him up, his heart glows red and
// the bubble he blows in a rage pops in his face. Mélo shows him that a bubble
// only grows if you blow slowly... and so does calm. Three breaths together,
// and the anger flies away like a bubble. A ritual every child can do, no gum
// needed: « Inspire… souffle… BOUM ! »

const WIDTH = 360;
const SCALE = WIDTH / 400;
const PINK_AT: [number, number] = [600, GROUND];
const MELO_AT: [number, number] = [1250, GROUND];
const XM = (wx: number) => (wx - MELO_AT[0]) / SCALE;
const TOWER_X = 860;
const BLOCK = 100;
const MELO_SPOT = 1100;

// beats (30 fps)
const CYCLES = [64, 98, 132, 166, 200]; // the pink monster places blocks 1..5 (block 0 is already there)
const TADA = 236;
const WOBBLE = 242;
const FALL = 262;
const BONK = 278;
const ANGRY = 290;
const FAST = 334;
const SPLAT = 352;
const SULK = 392;
const MELO_GO = 360;
const TALK = 430;
const DEMO_IN = 446;
const DEMO_OUT = 476;
const DEMO_END = 540;
type Breath = { a: number; p: number; e: number };
const BREATHS: Breath[] = [
  { a: 576, p: 600, e: 636 },
  { a: 640, p: 664, e: 700 },
  { a: 704, p: 728, e: 790 },
];
const BOUM = 800;
const REBUILD = 880;
const SLIP = 1010;
const SELF: Breath = { a: 1024, p: 1036, e: 1056 };
const RITUAL: Breath = { a: 1100, p: 1118, e: 1146 };
const RITUAL_BOUM = 1150;
export const BREATH_END = 1200;

const jump = (s: number, x0: number, x1: number, h: number, d = 12): Key[] => [
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
const sit = { sy: 0.84, y: 18, legLift: 0.5 };
const stand = { sy: 1, y: 0, legLift: 0 };
const pucker = { cheeks: 1, mouthOpen: 0.3, mouthWidth: 0.28 };

// one slow breath: in (taller, arms rise, eyes closed), out (cheeks round, blowing)
const breathKeys = (b: Breath, arms: number, blowing = false): Key[] => [
  { f: b.a, sy: 1, armL: 20, armR: 20, cheeks: 0, mouthOpen: 0.3, mouthWidth: 0.5, blink: 0 },
  { f: b.a + 4, blink: 1 },
  { f: b.p, sy: 1.1, armL: arms, armR: arms, mouthOpen: 0.15, mouthWidth: 0.4, blink: 1, ease: "inOut" },
  { f: b.p + 4, cheeks: blowing ? 1 : 0.6, mouthOpen: 0.3, mouthWidth: 0.28 },
  { f: b.e, sy: 1, armL: 20, armR: 20, cheeks: blowing ? 1 : 0.6, blink: 1, ease: "inOut" },
  { f: b.e + 4, cheeks: 0, blink: 0, mouthOpen: 0.4, mouthWidth: 0.6 },
];

// ---------------------------------------------------------------- the pink monster
const PINK_KEYS: Key[] = tighten(
  sortKeys([
    { f: 0, x: 0, y: 0, turn: 0.3, lookX: 0.6, lookY: -0.2, armL: 20, armR: 20, curlL: 0, curlR: 0, mouthOpen: 0.5, mouthWidth: 0.6, smile: 0.7, eyeScale: 1, browY: 0, browTilt: 0, sy: 1, rot: 0, bend: 0, squint: 0, cheeks: 0, legLift: 0, blink: 0, tongue: 0 },
    // one block at a time, tongue out, very careful
    ...CYCLES.flatMap((s, i) => [
      { f: s, turn: 0.3, lookX: 0.6, armL: 20, armR: 20, sy: 1 },
      { f: s + 4, turn: -0.45, lookX: -0.8, lookY: 0.6, bend: -8, armL: -30, armR: -30, ease: "out" as const },
      { f: s + 10, bend: 0, armL: -46, armR: -46, lookY: 0.2 },
      { f: s + 16, turn: 0.4, lookX: 0.8, lookY: -0.5 - i * 0.1, tongue: 0.7, mouthOpen: 0.3, mouthWidth: 0.5 },
      { f: s + 20, armL: 70, armR: 70, sy: 1.05 },
      { f: s + 28, armL: 20, armR: 20, sy: 1, tongue: 0, mouthOpen: 0.5, mouthWidth: 0.6 },
    ]),
    // the last one is too high: a hop
    { f: 216, y: 0, sy: 1 },
    { f: 218, sy: 0.88 },
    { f: 222, y: -130, sy: 1.08, armL: 150, armR: 150, ease: "out" },
    { f: 228, y: 0, ease: "in" },
    { f: 229, sy: 0.86, ease: "snap" },
    { f: 233, sy: 1, armL: 20, armR: 20, ease: "out" },
    // « Ta-da ! »
    { f: TADA, armL: 150, armR: 150, squint: 1, mouthOpen: 0.9, mouthWidth: 1, smile: 1, cheeks: 0.4, lookY: -0.6 },
    // ...no, no, no...
    { f: WOBBLE + 2, squint: 0, cheeks: 0, eyeScale: 1.3, browY: -14, mouthOpen: 0.6, mouthWidth: 0.4, smile: 0, armL: 60, armR: 60, curlL: -0.5, curlR: -0.5, ease: "snap" },
    ...alternate(WOBBLE + 4, FALL - 2, 4, { rot: 4 }, { rot: -4 }),
    { f: FALL, rot: 0, armL: 112, armR: 112, curlL: 1.3, curlR: 1.3, sy: 0.92 },
    { f: BONK - 1, sy: 0.92, squint: 0, eyeScale: 1.3 },
    { f: BONK, sy: 0.8, squint: 1, eyeScale: 1, mouthOpen: 0.7, mouthWidth: 0.5, ease: "snap" },
    { f: BONK + 8, sy: 1, armL: 20, armR: 20, curlL: 0, curlR: 0, squint: 0, lookY: 0.4, turn: 0.2, lookX: 0.4, browY: 0, eyeScale: 1.1 },
    // anger fills him up
    { f: ANGRY, browTilt: -22, browY: 6, eyeScale: 1.1, smile: -0.8, mouthOpen: 0.5, mouthWidth: 0.9, curlL: 1.2, curlR: 1.2, armL: -10, armR: -10, turn: 0, lookX: 0, lookY: 0 },
    ...alternate(294, 330, 4, { rot: 3, sy: 0.96, legLift: 0.15 }, { rot: -3, sy: 1, legLift: 0 }),
    // ...and the bubble he blows in a rage
    { f: FAST - 2, rot: 0, sy: 1, legLift: 0 },
    { f: FAST + 2, ...pucker, sy: 1.06, ease: "out" },
    { f: SPLAT - 2, sy: 1.1 },
    { f: SPLAT, cheeks: 0, mouthOpen: 0.6, mouthWidth: 0.5, eyeScale: 1.3, sy: 0.88, ease: "snap" },
    { f: SPLAT + 8, sy: 1 },
    { f: 380, armL: 20, armR: 20, curlL: 0, curlR: 0 },
    { f: 384, armL: 120, curlL: -0.6, armR: 120, curlR: -0.6 },
    ...alternate(386, 392, 3, { armL: 105 }, { armL: 125 }),
    // sulking
    { f: SULK, armL: -20, armR: -20, curlL: 0, curlR: 0 },
    { f: SULK + 8, ...sit, smile: -0.9, mouthOpen: 0.1, mouthWidth: 0.5, browTilt: -14, browY: 4, eyeScale: 1, lookX: -0.6, turn: -0.3, lookY: 0.3, ease: "out" },
    { f: TALK + 2, turn: 0.4, lookX: 0.8, lookY: 0, browTilt: -6 },
    { f: DEMO_IN, eyeScale: 1.15, mouthOpen: 0.4, mouthWidth: 0.45, browTilt: 6, browY: 0, lookY: -0.3, smile: -0.2 },
    { f: DEMO_END + 6, eyeScale: 1.2, mouthOpen: 0.5, browY: -8 },
    // « Avec moi ? »
    { f: 560, ...sit },
    { f: 568, ...stand, turn: 0.2, lookX: 0.5, lookY: 0, browTilt: -12, browY: 0, eyeScale: 1, mouthOpen: 0.3, mouthWidth: 0.5, smile: -0.3, ease: "out" },
    // three breaths: the anger shrinks each time
    ...breathKeys(BREATHS[0], 70),
    { f: BREATHS[0].e + 4, browTilt: -6, smile: -0.1 },
    ...breathKeys(BREATHS[1], 80),
    { f: BREATHS[1].e + 4, browTilt: 2, smile: 0.2 },
    ...breathKeys(BREATHS[2], 90, true),
    { f: BREATHS[2].e - 4, sy: 1.04 },
    // BOUM! a happy one this time
    { f: BOUM - 2, cheeks: 1, mouthOpen: 0.3, mouthWidth: 0.28, blink: 0.2 },
    { f: BOUM, cheeks: 0, blink: 0, mouthOpen: 0.9, mouthWidth: 1, eyeScale: 1.25, browTilt: 0, smile: 0.6, sy: 0.9, ease: "snap" },
    { f: BOUM + 8, squint: 1, smile: 1, cheeks: 0.6, armL: 150, armR: 150, eyeScale: 1, sy: 1 },
    ...alternate(BOUM + 10, 846, 6, { sy: 0.95 }, { sy: 1.02 }),
    { f: 860, squint: 0, cheeks: 0.2, armL: 20, armR: 20, sy: 1, mouthOpen: 0.6, mouthWidth: 0.7 },
    // together they build it again
    { f: REBUILD - 4, turn: 0.35, lookX: 0.7, lookY: -0.3, smile: 1 },
    ...alternate(REBUILD, 990, 9, { armL: 20, armR: 90 }, { armL: 20, armR: 30 }),
    { f: 998, armR: 20, lookY: -0.7, cheeks: 0, mouthOpen: 0.6 },
    // a block slips... a flash of anger... and he breathes, on his own
    { f: SLIP + 2, eyeScale: 1.1, browY: 0 },
    { f: SLIP + 4, eyeScale: 1.3, browY: -12, mouthOpen: 0.6, mouthWidth: 0.4, smile: 0, ease: "snap" },
    { f: SLIP + 10, browTilt: -20, browY: 6, eyeScale: 1.05, smile: -0.6, curlL: 1.2, curlR: 1.2, armL: -10, armR: -10, lookY: 0.4 },
    ...breathKeys(SELF, 60),
    { f: SELF.e + 2, browTilt: 0, browY: 0, smile: 1, curlL: 0, curlR: 0, eyeScale: 1 },
    { f: 1062, rot: 6, bend: 10, armR: -40, lookY: 0.7, turn: 0.35, lookX: 0.6 },
    { f: 1070, rot: 0, bend: 0, armR: 70, lookY: -0.6 },
    { f: 1080, armR: 20, squint: 1, mouthOpen: 0.9, mouthWidth: 1, cheeks: 0.4 },
    // the ritual, to camera: « Inspire… souffle… BOUM ! »
    { f: 1090, turn: 0, lookX: 0, lookY: 0, squint: 0, cheeks: 0, mouthOpen: 0.6, mouthWidth: 0.7 },
    ...breathKeys(RITUAL, 80),
    { f: RITUAL_BOUM - 2, y: 0, sy: 1, armL: 20, armR: 20 },
    { f: RITUAL_BOUM, y: -50, sy: 1.08, armL: 150, armR: 150, curlL: 1.2, curlR: 1.2, mouthOpen: 0.9, mouthWidth: 1, eyeScale: 1.2, ease: "snap" },
    { f: RITUAL_BOUM + 8, y: 0, ease: "in" },
    { f: RITUAL_BOUM + 9, sy: 0.9, ease: "snap" },
    { f: RITUAL_BOUM + 14, sy: 1, squint: 1, smile: 1, cheeks: 0.6, eyeScale: 1, ease: "out" },
    { f: BREATH_END, squint: 1, armL: 150, armR: 150 },
  ]),
);

// ---------------------------------------------------------------- Mélo
const MELO_KEYS: Key[] = tighten(
  sortKeys([
    // lounging under his tree, hands behind his head, watching
    { f: 0, ...MELO_COOL, x: 0, y: 18, sy: 0.84, legLift: 0.5, turn: -0.3, lookX: -0.6, lookY: 0, armL: 150, armR: 150, curlL: 1.6, curlR: 1.6, eyeScale: 1, squint: 0, browTilt: 0, rot: -4, bend: -6, cheeks: 0 },
    ...coolBlink(120),
    { f: TADA, browY: -6, smile: 0.7 },
    { f: WOBBLE + 4, rot: 0, bend: 0, armL: 8, armR: 8, curlL: 0, curlR: 0, eyeScale: 1.15, blink: 0.1, browY: -8, mouthOpen: 0.5, mouthWidth: 0.45, ease: "out" },
    { f: FALL + 2, blink: 1, smile: -0.2 },
    { f: FALL + 10, blink: 0.1 },
    { f: ANGRY + 10, browTilt: 12, browY: 2, eyeScale: 1, mouthOpen: 0.2, mouthWidth: 0.6, smile: 0, blink: 0.24 },
    // he comes to sit by his friend
    { f: MELO_GO, ...sit },
    { f: MELO_GO + 4, ...stand, ease: "out" },
    ...jump(MELO_GO + 6, 0, XM(1180), 40),
    ...jump(MELO_GO + 20, XM(1180), XM(MELO_SPOT), 40),
    { f: 404, ...stand, turn: -0.4, lookX: -0.7 },
    { f: 412, ...sit },
    // « Hé… regarde. »
    { f: TALK, ...MELO_COOL, smile: 0.5, browTilt: 0, mouthOpen: 0.4 },
    { f: TALK + 16, mouthOpen: 0.2 },
    { f: DEMO_IN, sy: 0.84, armL: 8, armR: 8, blink: 0.24, turn: -0.1, lookX: -0.2 },
    { f: DEMO_IN + 4, blink: 1 },
    { f: DEMO_OUT, sy: 0.92, armL: 40, armR: 40, blink: 1, mouthOpen: 0.15, mouthWidth: 0.4, ease: "inOut" },
    { f: DEMO_OUT + 4, ...pucker },
    { f: DEMO_END, sy: 0.84, armL: 8, armR: 8, ...pucker, blink: 1, ease: "inOut" },
    { f: DEMO_END + 4, cheeks: 0, ...MELO_COOL, smile: 0.7, turn: -0.4, lookX: -0.7 },
    // « Avec moi ? »
    { f: 562, ...sit },
    { f: 570, ...stand, ease: "out" },
    ...BREATHS.flatMap((b) => breathKeys(b, 40).map((k) => ({ ...k, ...(k.blink === 0 ? { blink: 0.24 } : {}) }))),
    { f: BREATHS[2].e + 4, ...MELO_COOL },
    // the happy BOUM
    { f: BOUM + 6, blink: 1, smile: 1, cheeks: 0.4, mouthOpen: 0.6, mouthWidth: 0.9, armR: 140, curlR: 0.6 },
    { f: 860, ...MELO_COOL, cheeks: 0, armR: 8, curlR: 0 },
    // building together
    ...alternate(REBUILD + 4, 994, 9, { armL: 90, armR: 8 }, { armL: 30, armR: 8 }),
    { f: 998, armL: 8, lookY: -0.6 },
    { f: SLIP + 6, lookY: 0, lookX: -0.8, turn: -0.4, browY: -6 },
    ...alternate(SELF.a, SELF.e, 10, { sy: 0.97 }, { sy: 1 }),
    { f: 1080, armR: 140, curlR: 0.6, smile: 0.9, blink: 0.24, browY: 2 },
    { f: 1090, armR: 8, curlR: 0, turn: 0, lookX: 0, lookY: 0 },
    // the ritual, together
    ...breathKeys(RITUAL, 40).map((k) => ({ ...k, ...(k.blink === 0 ? { blink: 0.24 } : {}) })),
    { f: RITUAL_BOUM, armL: 150, armR: 150, curlL: 1.2, curlR: 1.2, mouthOpen: 0.6, mouthWidth: 0.9, smile: 1, blink: 0, ease: "snap" },
    { f: RITUAL_BOUM + 14, blink: 1, cheeks: 0.4 },
    { f: BREATH_END, blink: 1 },
  ]),
);

const { poseOf, mouthOf, toWorld } = makeDuo({ pinkAt: PINK_AT, meloAt: MELO_AT, width: WIDTH, pinkKeys: PINK_KEYS, meloKeys: MELO_KEYS });

// ---------------------------------------------------------------- the anger
// 0 calm .. 1 red-hot. It shrinks with every breath.
const anger = (f: number) =>
  interpolate(
    f,
    [ANGRY - 6, ANGRY + 26, BREATHS[0].a, BREATHS[0].e, BREATHS[1].e, BREATHS[2].e, SLIP + 4, SLIP + 12, SELF.e],
    [0, 1, 1, 0.66, 0.33, 0, 0, 0.6, 0],
    clamp,
  );

const HeartGlow: React.FC<{ v: number }> = ({ v }) =>
  v <= 0.01 ? null : (
    <g>
      <defs>
        <radialGradient id="angerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE3C4" stopOpacity={0.95} />
          <stop offset="30%" stopColor="#FF5A3C" stopOpacity={0.85} />
          <stop offset="70%" stopColor="#E0182E" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#E0182E" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={200} cy={320} rx={80 + v * 70} ry={74 + v * 60} fill="url(#angerGlow)" opacity={Math.min(1, v * 1.3)} />
    </g>
  );

// the bubble that pops in his face
const FaceSplat: React.FC<{ f: number }> = ({ f }) => {
  if (f < SPLAT || f > 394) return null;
  const grow = interpolate(f, [SPLAT, SPLAT + 4], [0.4, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  const wipe = interpolate(f, [384, 394], [1, 0], clamp);
  const drip = interpolate(f, [SPLAT + 4, 384], [0, 30], clamp);
  return (
    <g opacity={wipe} transform={`translate(200 250) scale(${grow}) translate(-200 -250)`}>
      <path d="M 92 150 C 120 104 280 104 310 150 C 340 190 330 300 300 330 C 270 356 140 356 104 330 C 70 300 62 196 92 150 Z" fill="#F9A6CB" opacity={0.92} />
      <ellipse cx={130} cy={340 + drip * 0.6} rx={14} ry={22 + drip * 0.4} fill="#F9A6CB" />
      <ellipse cx={262} cy={346 + drip} rx={12} ry={20 + drip * 0.6} fill="#F9A6CB" />
      <ellipse cx={150} cy={160} rx={34} ry={14} fill="white" opacity={0.6} transform="rotate(-20 150 160)" />
      <ellipse cx={148} cy={196} rx={30} ry={26} fill="#FFF7FB" />
      <ellipse cx={252} cy={196} rx={30} ry={26} fill="#FFF7FB" />
      <circle cx={152} cy={200} r={10} fill="#2B0F1E" />
      <circle cx={256} cy={200} r={10} fill="#2B0F1E" />
    </g>
  );
};

// ---------------------------------------------------------------- the blocks
const TONES = ["#5EC8F2", "#FFD23F", "#7BD06A", "#FF8FC6", "#B48CFF", "#FF9A3C"];
const ICONS = ["★", "♥", "●", "▲", "◆", "★"];
const slot = (i: number): [number, number] => [TOWER_X, GROUND - BLOCK / 2 - i * BLOCK];
const PILE: [number, number][] = [[0, 0], [300, GROUND - 50], [390, GROUND - 50], [345, GROUND - 145], [250, GROUND - 50], [440, GROUND - 50]];
const SCATTER: [number, number, number][] = [[1000, GROUND - 50, 20], [760, GROUND - 50, -15], [1180, GROUND - 46, 40], [420, GROUND - 50, -30], [1320, GROUND - 48, 10], [960, GROUND - 160, 0]];
const BACK = (i: number) => REBUILD + 4 + i * 18;

const arc = (a: [number, number], b: [number, number], t: number, h: number): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(Math.PI * t) * h];

type BlockState = { x: number; y: number; rot: number; held: boolean };
const towerLean = (f: number) => (f < WOBBLE ? 0 : f < FALL ? Math.sin((f - WOBBLE) / 2.2) * (f - WOBBLE) * 0.32 : 0);
const onTower = (i: number, f: number): BlockState => {
  const lean = (towerLean(f) * (1 + i * 0.15) * Math.PI) / 180;
  const sy = slot(i)[1];
  const dy = sy - GROUND;
  return { x: TOWER_X - Math.sin(lean) * dy, y: GROUND + Math.cos(lean) * dy, rot: (lean * 180) / Math.PI, held: false };
};
const handPos = (f: number): [number, number] => {
  const p = poseOf("pink", f);
  return toWorld("pink", p, 200, 392);
};
const blockAt = (i: number, f: number): BlockState => {
  // before the collapse
  if (i > 0) {
    const s = CYCLES[i - 1];
    const release = i === 5 ? 222 : s + 20;
    if (f < s + 8) return { x: PILE[i][0], y: PILE[i][1], rot: 0, held: false };
    if (f < release) return { x: 0, y: 0, rot: 0, held: true };
    if (f < release + 6) {
      const [x, y] = arc(handPos(release), slot(i), lerp(f, [release, release + 6], [0, 1], Easing.out(Easing.quad)), 40);
      return { x, y, rot: 0, held: false };
    }
  }
  if (f < FALL) return onTower(i, f);
  // the collapse (block 5 bonks him on the head first)
  const from = onTower(i, FALL - 1);
  if (i === 5 && f < BONK + 16) {
    const head = toWorld("pink", poseOf("pink", BONK), 200, 60);
    if (f < BONK) {
      const [x, y] = arc([from.x, from.y], head, lerp(f, [FALL, BONK], [0, 1], Easing.in(Easing.quad)), 60);
      return { x, y, rot: lerp(f, [FALL, BONK], [0, 120]), held: false };
    }
    const [x, y] = arc(head, [SCATTER[3][0] - 140, GROUND - 50], lerp(f, [BONK, BONK + 16], [0, 1]), 120);
    return { x, y, rot: lerp(f, [BONK, BONK + 16], [120, 380]), held: false };
  }
  const land: [number, number, number] = i === 5 ? [SCATTER[3][0] - 140, GROUND - 50, 20] : SCATTER[i];
  if (f < BACK(i)) {
    if (i === 5 && f >= BONK + 16) return { x: land[0], y: land[1], rot: land[2], held: false };
    const t = lerp(f, [FALL + i * 2, FALL + 18 + i * 2], [0, 1], Easing.in(Easing.quad));
    const [x, y] = arc([from.x, from.y], [land[0], land[1]], t, 80);
    return { x, y, rot: from.rot + (land[2] - from.rot) * t + t * 180 * (i % 2 ? 1 : -1), held: false };
  }
  // built again, together
  if (f < BACK(i) + 14) {
    const t = lerp(f, [BACK(i), BACK(i) + 14], [0, 1], Easing.inOut(Easing.quad));
    const [x, y] = arc([land[0], land[1]], slot(i), t, 160);
    return { x, y, rot: land[2] * (1 - t), held: false };
  }
  // the top block slips... and goes back on
  if (i === 5 && f >= SLIP) {
    const ground: [number, number] = [TOWER_X + 130, GROUND - 50];
    if (f < SLIP + 12) {
      const [x, y] = arc(slot(5), ground, lerp(f, [SLIP, SLIP + 12], [0, 1], Easing.in(Easing.quad)), 40);
      return { x, y, rot: lerp(f, [SLIP, SLIP + 12], [0, 90]), held: false };
    }
    if (f < 1064) return { x: ground[0], y: ground[1], rot: 90, held: false };
    if (f < 1074) {
      const [x, y] = arc(ground, slot(5), lerp(f, [1064, 1074], [0, 1]), 120);
      return { x, y, rot: lerp(f, [1064, 1074], [90, 0]), held: false };
    }
  }
  if (i === 5 && f >= SLIP - 10 && f < SLIP) return { ...onTower(5, f), x: TOWER_X + Math.sin(f) * 4, rot: Math.sin(f * 1.3) * 8 };
  return { x: slot(i)[0], y: slot(i)[1], rot: 0, held: false };
};

const BlockShape: React.FC<{ i: number }> = ({ i }) => (
  <>
    <rect x={-BLOCK / 2} y={-BLOCK / 2} width={BLOCK} height={BLOCK} rx={18} fill={TONES[i]} stroke="rgba(0,0,0,0.15)" strokeWidth={5} />
    <rect x={-BLOCK / 2 + 10} y={-BLOCK / 2 + 8} width={BLOCK - 20} height={14} rx={7} fill="white" opacity={0.35} />
    <text x={0} y={18} textAnchor="middle" fontSize={54} fill="white" fontFamily={displayFont}>
      {ICONS[i]}
    </text>
  </>
);

const Block: React.FC<{ i: number; s: BlockState }> = ({ i, s }) => (
  <svg style={{ position: "absolute", left: s.x - 80, top: s.y - 80, width: 160, height: 160, overflow: "visible" }} viewBox="-80 -80 160 160">
    <g transform={`rotate(${s.rot})`}>
      <BlockShape i={i} />
    </g>
  </svg>
);

// ---------------------------------------------------------------- bubbles
const breathT = (b: Breath, f: number) => lerp(f, [b.p + 4, b.e], [0, 1], Easing.inOut(Easing.sin));

const Steam: React.FC<{ f: number; v: number }> = ({ f, v }) => {
  if (v < 0.4) return null;
  const top = toWorld("pink", poseOf("pink", f), 200, 40);
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => {
        const t = ((f + i * 5) % 30) / 30;
        const side = i % 2 ? 1 : -1;
        return <div key={i} style={{ position: "absolute", left: top[0] + side * (40 + t * 60) - 26, top: top[1] - t * 160 - 26, width: 52 + t * 30, height: 52 + t * 30, borderRadius: "50%", background: "white", opacity: (1 - t) * 0.8 * Math.min(1, (v - 0.4) * 3) }} />;
      })}
    </>
  );
};

const World: React.FC<{ f: number }> = ({ f }) => {
  const pink = poseOf("pink", f);
  const melo = poseOf("melo", f);
  const a = anger(f);
  const pm = mouthOf("pink", pink);
  const mm = mouthOf("melo", melo);
  const heldIndex = CYCLES.findIndex((s, k) => f >= s + 8 && f < (k === 4 ? 222 : s + 20)) + 1;
  const pinkHeld =
    heldIndex > 0 ? (
      <g transform="translate(200 392) scale(0.9)">
        <BlockShape i={heldIndex} />
      </g>
    ) : null;
  // the rage bubble: too fast, it wobbles and pops
  const rageR = f >= FAST + 2 && f < SPLAT ? lerp(f, [FAST + 2, SPLAT], [10, 150], Easing.in(Easing.quad)) : 0;
  // Mélo's slow, round bubble
  const demoR = f >= DEMO_OUT + 4 && f < DEMO_END + 8 ? lerp(f, [DEMO_OUT + 4, DEMO_END], [8, 160], Easing.inOut(Easing.sin)) : 0;
  // the third breath: his slow, perfect bubble
  const calmR = f >= BREATHS[2].p + 4 && f < BOUM ? 8 + breathT(BREATHS[2], f) * 190 : 0;

  return (
    <>
      <Park />
      {Array.from({ length: 6 }, (_, i) => {
        const s = blockAt(i, f);
        return s.held ? null : <Block key={i} i={i} s={s} />;
      })}
      <BoumMonster pose={melo} skin="melo" style={rigBox(MELO_AT, WIDTH)} />
      <div style={{ position: "absolute", left: 0, top: 0, filter: a > 0.01 ? `hue-rotate(${-16 * a}deg) saturate(${1 + 0.5 * a})` : undefined }}>
        <BoumMonster pose={pink} held={pinkHeld} inner={<HeartGlow v={a} />} over={<FaceSplat f={f} />} style={rigBox(PINK_AT, WIDTH)} />
      </div>
      <Steam f={f} v={a} />
      {rageR > 1 ? <Bubble id="rage" x={pm[0] + Math.sin(f * 2.3) * 6} y={pm[1] + rageR * 0.42} r={rageR} tone={PINK_GUM} wob={Math.sin(f * 1.7) * 0.08} /> : null}
      {demoR > 1 ? <Bubble id="demo" x={mm[0]} y={mm[1] + demoR * 0.42 - lerp(f, [DEMO_END, DEMO_END + 8], [0, 40])} r={demoR} tone={MELO_GUM} wob={Math.sin(f * 0.25) * 0.01} opacity={f > DEMO_END ? lerp(f, [DEMO_END, DEMO_END + 8], [0.9, 0]) : 0.9} /> : null}
      {calmR > 1 ? <Bubble id="calm" x={pm[0]} y={pm[1] + calmR * 0.42} r={calmR} tone={PINK_GUM} wob={Math.sin(f * 0.3) * 0.01} opacity={0.7} /> : null}
      <PopBurst f={f} at={SPLAT} x={pm[0]} y={pm[1] + 40} r={110} tones={PINK_GUM} n={10} />
      <PopBurst f={f} at={BOUM} x={pm[0]} y={pm[1] + 80} r={200} tones={[...PINK_GUM, "#FFE066", "#7FD3FF"]} n={16} />
      <PopBurst f={f} at={RITUAL_BOUM} x={(pm[0] + mm[0]) / 2} y={pm[1] - 160} r={80} tones={[...PINK_GUM, ...MELO_GUM]} n={12} />
      <Say f={f} from={TADA} to={WOBBLE + 2} x={500} y={1010} text="Ta-da !" color={colors.logoRed} tail="left" />
      <Say f={f} from={WOBBLE + 4} to={FALL} x={500} y={1010} text="Non non non…" color={colors.logoRed} tail="left" size={56} />
      <Say f={f} from={ANGRY + 10} to={326} x={480} y={980} text="GRRRR !" color="#E0182E" tail="left" size={84} />
      <Say f={f} from={TALK} to={DEMO_IN} x={1160} y={1060} text="Hé… regarde." color="#3E8E2E" tail="right" />
      <Say f={f} from={DEMO_END + 8} to={572} x={1170} y={1040} text="Avec moi ?" color="#3E8E2E" tail="right" />
    </>
  );
};

// ---------------------------------------------------------------- the breathing guide
// A circle children can follow: it grows while you breathe in, and shrinks while you blow out.
const guideOf = (f: number) => {
  for (const b of [...BREATHS, SELF, RITUAL]) {
    if (f >= b.a - 6 && f <= b.e + 8) {
      const inhale = f < b.p + 2;
      const size = inhale ? lerp(f, [b.a, b.p], [0.45, 1], Easing.inOut(Easing.sin)) : lerp(f, [b.p + 4, b.e], [1, 0.45], Easing.inOut(Easing.sin));
      const o = interpolate(f, [b.a - 6, b.a, b.e, b.e + 8], [0, 1, 1, 0], clamp);
      return { size, inhale, o };
    }
  }
  return null;
};

const BreathGuide: React.FC<{ f: number }> = ({ f }) => {
  const g = guideOf(f);
  if (!g) return null;
  const R = 170 * g.size;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 230, height: 360, opacity: g.o }}>
      <div style={{ position: "absolute", left: 540 - 180, top: 180 - 180, width: 360, height: 360, borderRadius: "50%", border: "8px dashed rgba(255,255,255,0.85)", background: "rgba(255,255,255,0.18)" }} />
      <div style={{ position: "absolute", left: 540 - R, top: 180 - R, width: R * 2, height: R * 2, borderRadius: "50%", background: "radial-gradient(circle at 38% 32%, #FFE3EF, #F9A6CB 60%, #EE79B1)", boxShadow: "0 0 40px 10px rgba(255,255,255,0.5)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: displayFont, fontSize: 84, color: "white", textShadow: "0 5px 0 rgba(200,60,120,0.8), 0 0 20px rgba(200,60,120,0.6)" }}>{g.inhale ? "Inspire…" : "Souffle…"}</div>
    </div>
  );
};

// ---------------------------------------------------------------- camera
const at = (f: number, cx: number, z: number, ground = 1330): Cam => [f, cx, GROUND - (ground - 960) / z, z];
const MAIN: Cam[] = [
  at(0, 860, 0.8, 1380),
  at(56, 740, 1.15, 1420), // the tower
  at(196, 760, 1.12, 1420),
  at(226, 760, 1.0, 1420),
  at(FALL, 800, 1.0, 1420),
  at(ANGRY + 6, 620, 1.45, 1420), // anger
  at(SPLAT + 20, 620, 1.45, 1420),
  at(SULK + 8, 860, 1.05, 1420), // Mélo comes
  at(TALK, 860, 1.05, 1420),
  at(DEMO_OUT, 1020, 1.35, 1420), // Mélo's slow bubble
  at(DEMO_END + 8, 1020, 1.35, 1420),
  at(BREATHS[0].a, 850, 1.15, 1440), // three breaths
  at(BREATHS[2].e, 740, 1.2, 1440),
  at(BOUM + 20, 850, 1.0, 1420),
  at(REBUILD, 860, 0.98, 1440),
  at(1000, 860, 0.98, 1440),
  at(SELF.a, 700, 1.3, 1440),
  at(SELF.e + 6, 780, 1.1, 1440),
  at(1088, 850, 1.05, 1440),
  at(RITUAL.a + 6, 850, 1.12, 1460),
  at(BREATH_END, 850, 1.12, 1460),
];

const Caption: React.FC<{ f: number; from: number; to: number; text: string }> = ({ f, from, to, text }) => {
  const o = interpolate(f, [from, from + 10, to - 10, to], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1600, textAlign: "center", opacity: o, translate: `0px ${(1 - o) * 20}px` }}>
      <span style={{ display: "inline-block", padding: "18px 40px", borderRadius: 40, background: "rgba(40,60,90,0.5)", fontFamily: scriptFont, fontSize: 62, color: "#FFF3C4", textShadow: "0 3px 0 rgba(0,0,0,0.35)", lineHeight: 1.2 }}>{text}</span>
    </div>
  );
};

const RitualWord: React.FC<{ f: number; at: number; text: string; color: string; size: number }> = ({ f, at: a, text, color, size }) => {
  const s = interpolate(f, [a, a + 6], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.5)) });
  return s <= 0 ? null : <span style={{ display: "inline-block", scale: s, fontFamily: displayFont, fontSize: size, color, margin: "0 12px", textShadow: "0 6px 0 rgba(0,0,0,0.18)" }}>{text}</span>;
};

export const BreathScene: React.FC = () => {
  const f = useCurrentFrame();
  const { cx, cy, z } = camAt(MAIN, f);
  const a = anger(f);

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#5EC8F2" }}>
      <DaySky cy={cy} />
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${540 - cx * z}px, ${960 - cy * z}px) scale(${z})` }}>
        <DaySkyline cx={cx} />
        <World f={f} />
      </div>
      {/* the world turns hot and red around him while he is angry */}
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, rgba(255,60,40,0) 30%, rgba(200,20,30,0.55) 100%)", opacity: a * 0.8 }} />
      <BreathGuide f={f} />
      {f >= RITUAL.a - 4 ? (
        <Pop f={f} at={RITUAL.a - 4} out={BREATH_END + 20} top={250}>
          <div>
            <RitualWord f={f} at={RITUAL.a} text="Inspire…" color="white" size={74} />
            <RitualWord f={f} at={RITUAL.p + 4} text="souffle…" color="white" size={74} />
          </div>
          <RitualWord f={f} at={RITUAL_BOUM} text="BOUM !" color={colors.logoRed} size={150} />
        </Pop>
      ) : null}

      <SeriesTitle episode={9} title="Le Souffle de Boum Boum" titleColor="#FF8FC6" outAt={56} />
      <Caption f={f} from={64} to={160} text="Boum Boum construisait la plus haute tour du monde." />
      <Caption f={f} from={296} to={374} text="Quand la colère monte… tout va trop vite." />
      <Caption f={f} from={DEMO_IN} to={556} text="Une bulle, ça ne se souffle pas vite… ça se souffle doucement." />
      <Caption f={f} from={590} to={700} text="Alors ils respirèrent ensemble. Une fois… deux fois…" />
      <Caption f={f} from={706} to={792} text="…trois fois." />
      <Caption f={f} from={806} to={878} text="Et la colère s'envola… comme une bulle." />
      <Caption f={f} from={890} to={990} text="Ensemble, ils reconstruisirent la tour." />
      <Caption f={f} from={1160} to={BREATH_END + 6} text="Quand la colère gonfle… souffle-la doucement." />
    </AbsoluteFill>
  );
};
