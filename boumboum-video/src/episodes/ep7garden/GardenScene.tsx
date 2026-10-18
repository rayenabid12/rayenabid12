import type React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { SeriesTitle } from "../../brand/SeriesTitle";
import { alternate, rigBox, tighten } from "../../final/kit";
import { BoumMonster } from "../../rig/BoumMonster";
import { MELO_COOL } from "../../rig/meloKeys";
import { type Key, sortKeys } from "../../rig/pose";
import { colors, scriptFont } from "../../theme";
import { Rain } from "../ep6/StormCity";
import { type Cam, camAt, clamp, lerp, makeDuo, PopBurst, Say } from "../shared/stage";
import { GardenSet, GardenSky, GROUND, Plant, PLOT_X, type SkyState, SliceShape, Watermelon, WateringCan } from "./GardenPlot";

// "Les Aventures Boum Boum", Episode 7: "Le Jardin de Mélo" (45 s).
// Mélo plants one seed and wants it to grow RIGHT NOW. Day after day he comes
// back to water it: a sprout, a flower, a little fruit... Then one stormy night
// breaks it all. But the fruit left him seeds, and this time they start again
// together. The giant watermelon they grow is the very first Pastèque flavour.
// « Les plus belles choses prennent du temps… et grandissent mieux à deux. »

const WIDTH = 400;
const SCALE = WIDTH / 400;
const MELO_AT: [number, number] = [620, GROUND];
const PINK_AT: [number, number] = [1240, GROUND];
const XM = (wx: number) => (wx - MELO_AT[0]) / SCALE;
const XP = (wx: number) => (wx - PINK_AT[0]) / SCALE;

// beats (30 fps)
const PLANT = 96;
const CAN = 128;
const SHOUT = 210;
const PINK_IN = 236;
const MONTAGE = 300;
const PER = 50; // one day in the first montage
const SPROUT = 342;
const SUNRISES = [342, 392, 442, 492, 542, 592, 642, 692];
const LEAVE = 720;
const STORM = 740;
const BREAK = 800;
const CRACK = 802;
const MORNING = 850;
const ARRIVE = 868;
const KNEEL = 900;
const POINT = 966;
const PICK = 996;
const AGAIN = 1012;
const TOGETHER = 1042;
const PER2 = 23; // one day in the second montage (6 days to noon)
const ASIDE = 1148;
const CHOP = 1188;
const BITE = 1212;
export const GARDEN_END = 1268;

const jump = (s: number, x0: number, x1: number, h: number, d = 14): Key[] => [
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

// ---------------------------------------------------------------- Mélo
const MELO_KEYS: Key[] = tighten(
  sortKeys([
    { f: 0, ...MELO_COOL, x: 0, y: 0, turn: 0.3, lookX: 0.6, lookY: 0.5, armL: 8, armR: 40, curlL: 0, curlR: 0, eyeScale: 1, squint: 0, browTilt: 0, sy: 1, rot: 0, bend: 0, cheeks: 0, legLift: 0 },
    // one seed, one only
    { f: 72, eyeScale: 1.1, smile: 0.8 },
    { f: PLANT - 4, rot: 0, bend: 0, sy: 1, armR: 40, lookY: 0.5 },
    { f: PLANT + 4, rot: 10, bend: 14, sy: 0.86, armR: -40, lookY: 0.9, ease: "out" },
    { f: 112, rot: 10, bend: 14, sy: 0.86 },
    { f: 120, rot: 0, bend: 0, sy: 1, armR: 0, lookY: 0.6, eyeScale: 1 },
    // water... and wait
    { f: 140, armR: 14 },
    { f: 164, armR: 0 },
    { f: 172, armL: -30, curlL: 1.6, lookY: 0.8, browTilt: -8, smile: 0.1 },
    ...alternate(176, 204, 6, { sy: 0.97, rot: 2 }, { sy: 1, rot: -1 }),
    // « Allez, pousse ! »
    { f: SHOUT - 2, rot: 0, bend: 0, blink: 0.24, eyeScale: 1 },
    { f: SHOUT, rot: 6, bend: 10, mouthOpen: 0.9, mouthWidth: 0.7, blink: 0, eyeScale: 1.15, browTilt: -14, armL: 50, curlL: 0, smile: 0, ease: "snap" },
    { f: 232, rot: 6, bend: 10, mouthOpen: 0.9 },
    { f: 242, rot: 0, bend: 0, sy: 0.94, browTilt: 14, mouthOpen: 0.15, mouthWidth: 0.5, smile: -0.4, blink: 0.34, eyeScale: 1, armL: 8, lookY: 0.9 },
    // the pink monster arrives
    { f: 256, turn: 0.4, lookX: 0.9, lookY: 0, sy: 1 },
    { f: 290, ...MELO_COOL, browTilt: 0, smile: 0.3 },
    { f: 294, sy: 0.95 },
    { f: 298, sy: 1, lookX: 0.6, turn: 0.3, lookY: 0.6 },
    // day 0: water, then sleep
    { f: 320, ...stand, blink: 0.24 },
    { f: 326, ...sit },
    { f: 332, blink: 1 },
    // every morning he comes back
    ...SUNRISES.flatMap((s, k) =>
      k === 0
        ? [
            // the sprout!
            { f: s - 2, ...sit, blink: 1 },
            { f: s + 2, ...stand, blink: 0.24, ease: "out" as const },
            { f: s + 6, eyeScale: 1.3, blink: 0, browY: -14, mouthOpen: 0.7, mouthWidth: 0.5, smile: 0.6, ease: "snap" as const },
            ...jump(s + 12, 0, 0, 90, 12),
            { f: s + 16, armL: 140, armR: 140 },
            { f: s + 28, armL: 8, armR: 0, eyeScale: 1, browY: 2, mouthOpen: 0.5, mouthWidth: 0.9, smile: 1, cheeks: 0.4, blink: 0.24 },
            { f: s + 34, ...sit, ...MELO_COOL, smile: 0.8, cheeks: 0 },
            { f: s + 40, blink: 1 },
          ]
        : k === SUNRISES.length - 1
          ? [
              { f: s - 2, ...sit, blink: 1 },
              { f: s + 2, ...stand, blink: 0.24, ease: "out" as const },
              // goodnight, little watermelon
              { f: s + 18, rot: 0, bend: 0, armR: 0 },
              { f: s + 22, rot: 8, bend: 12, armR: -30, smile: 0.9, lookY: 0.9 },
              { f: s + 26, rot: 0, bend: 0, armR: 0, turn: -0.4, lookX: -0.6, lookY: 0 },
              ...jump(LEAVE + 2, 0, XM(420), 70),
              ...jump(LEAVE + 16, XM(420), XM(120), 70),
            ]
          : [
              { f: s - 2, ...sit, blink: 1 },
              { f: s + 2, ...stand, blink: 0.24, ease: "out" as const },
              { f: s + 22, ...stand },
              { f: s + 26, ...sit },
              { f: s + 32, blink: 1 },
            ],
    ),
    // the morning after the storm
    { f: ARRIVE - 4, x: XM(120), turn: 0.3, lookX: 0.6, lookY: 0.2, blink: 0.24 },
    ...jump(ARRIVE, XM(120), XM(420), 50, 10),
    ...jump(ARRIVE + 10, XM(420), 0, 50, 10),
    { f: 886, eyeScale: 1, blink: 0.24, lookY: 0.3 },
    { f: 888, eyeScale: 1.3, blink: 0, browY: -16, mouthOpen: 0.6, mouthWidth: 0.4, smile: -0.3, lookY: 0.8, ease: "snap" },
    { f: KNEEL, ...stand, eyeScale: 1.3 },
    { f: KNEEL + 12, ...sit, sy: 0.82, browTilt: 22, browY: 6, smile: -0.9, mouthOpen: 0.1, mouthWidth: 0.45, eyeScale: 1, lookY: 0.9, blink: 0.35, armL: -20, armR: -20 },
    ...alternate(920, 960, 10, { sy: 0.8 }, { sy: 0.83 }),
    // « Regarde… »
    { f: POINT, turn: 0.5, lookX: 0.9, lookY: 0.2, eyeScale: 1.05, sy: 0.82 },
    { f: 982, lookY: 1, lookX: 0.4, eyeScale: 1.15, blink: 0.1 },
    { f: PICK - 4, rot: 0, bend: 0, armR: -20 },
    { f: PICK + 2, rot: 6, bend: 12, armR: -44, ease: "out" },
    { f: PICK + 10, rot: 0, bend: 0, armR: 40, lookY: 0.3, lookX: 0.6, eyeScale: 1.25, browTilt: 0, browY: -8, mouthOpen: 0.4, mouthWidth: 0.4, smile: 0.2, blink: 0 },
    // « On recommence ? Ensemble. »
    { f: 1018, turn: 0.5, lookX: 0.9, lookY: 0.1, eyeScale: 1.1 },
    { f: 1030, ...MELO_COOL, smile: 1, cheeks: 0.3, eyeScale: 1, browY: 0 },
    ...alternate(1032, 1040, 4, { sy: 0.78 }, { sy: 0.84 }),
    { f: TOGETHER, ...stand, armR: 0, turn: 0.3, lookX: 0.6, lookY: 0.6, cheeks: 0 },
    // replant, then water together, bouncing with joy
    { f: 1046, rot: 8, bend: 12, armR: -30 },
    { f: 1054, rot: 0, bend: 0, armR: 0 },
    ...Array.from({ length: 4 }, (_, k) => [
      { f: 1062 + k * PER2, sy: 0.95, smile: 0.9 },
      { f: 1070 + k * PER2, sy: 1 },
    ]).flat(),
    ...jump(ASIDE, 0, XM(530), 60, 12),
    { f: 1166, eyeScale: 1, blink: 0.24, lookY: 0.6 },
    { f: 1170, eyeScale: 1.3, blink: 0, mouthOpen: 0.8, mouthWidth: 0.5, browY: -14, lookY: -0.2, lookX: 0.6, turn: 0.3, ease: "snap" },
    // the giant watermelon opens
    { f: CHOP + 6, squint: 0, armL: 8, armR: 0 },
    { f: CHOP + 10, squint: 1, mouthOpen: 0.9, mouthWidth: 1, smile: 1 },
    { f: 1200, squint: 0, armL: -46, armR: -46, eyeScale: 1.1, lookY: 0.5, lookX: 0.2, turn: 0.1, browY: 0, mouthOpen: 0.5, mouthWidth: 0.7 },
    { f: BITE, mouthOpen: 1, mouthWidth: 0.8, eyeScale: 1.1 },
    { f: BITE + 4, mouthOpen: 0.1, mouthWidth: 0.6, ease: "snap" },
    ...alternate(BITE + 8, BITE + 20, 4, { mouthOpen: 0.35 }, { mouthOpen: 0.1 }),
    { f: 1236, blink: 1, smile: 1, cheeks: 0.8, mouthOpen: 0.4, mouthWidth: 0.9, sy: 0.95, lookY: 0 },
    { f: 1248, sy: 1 },
    { f: GARDEN_END, blink: 1, smile: 1 },
  ]),
);

// ---------------------------------------------------------------- the pink monster
const PINK_KEYS: Key[] = tighten(
  sortKeys([
    { f: 0, x: XP(1800), y: 0, turn: -0.3, lookX: -0.6, lookY: 0.3, armL: 20, armR: 20, curlL: 0, curlR: 0, mouthOpen: 0.6, mouthWidth: 0.6, smile: 0.6, eyeScale: 1, browY: 0, browTilt: 0, sy: 1, rot: 0, bend: 0, squint: 0, cheeks: 0, legLift: 0, blink: 0 },
    ...jump(PINK_IN, XP(1800), XP(1480), 70, 12),
    ...jump(PINK_IN + 14, XP(1480), 0, 70, 12),
    // « Il faut lui laisser du temps. »
    { f: 264, armL: 20, smile: 0.6 },
    { f: 270, armL: 60, curlL: -0.4, smile: 0.8, mouthOpen: 0.5, mouthWidth: 0.7, browTilt: 10, lookX: -0.8, lookY: 0 },
    { f: 294, armL: 20, curlL: 0, browTilt: 0, mouthOpen: 0.6, mouthWidth: 0.6 },
    // he keeps him company: awake by day, asleep at night
    { f: 322, ...stand, blink: 0 },
    { f: 328, ...sit },
    { f: 334, blink: 1 },
    ...SUNRISES.flatMap((s, k) =>
      k === 0
        ? [
            { f: s - 2, ...sit, blink: 1 },
            { f: s + 4, ...stand, blink: 0, ease: "out" as const },
            { f: s + 8, squint: 1, mouthOpen: 0.9, mouthWidth: 1, smile: 1, armL: 150, armR: 150, cheeks: 0.5 },
            ...jump(s + 14, 0, 0, 60, 12),
            { f: s + 30, squint: 0, armL: 20, armR: 20, cheeks: 0, mouthOpen: 0.6, mouthWidth: 0.6 },
            { f: s + 36, ...sit },
            { f: s + 42, blink: 1 },
          ]
        : k === SUNRISES.length - 1
          ? [
              { f: s - 2, ...sit, blink: 1 },
              { f: s + 4, ...stand, blink: 0, ease: "out" as const },
              ...jump(LEAVE, 0, XP(800), 80),
              ...jump(LEAVE + 14, XP(800), XP(400), 80),
            ]
          : [
              { f: s - 2, ...sit, blink: 1 },
              { f: s + 4, blink: 0, lookY: 0.6, smile: 0.8, ease: "out" as const },
              { f: s + 24, blink: 0 },
              { f: s + 30, blink: 1 },
            ],
    ),
    // the morning after: he comes to sit by his friend
    { f: 916, x: XP(1800), turn: -0.3, lookX: -0.6, lookY: 0.4, blink: 0, smile: 0.2, mouthOpen: 0.3, mouthWidth: 0.5 },
    ...jump(920, XP(1800), XP(1480), 60, 12),
    ...jump(934, XP(1480), 0, 60, 12),
    { f: 946, browTilt: 18, smile: -0.3, mouthOpen: 0.2, mouthWidth: 0.5, lookX: -0.8, turn: -0.4, lookY: 0.6 },
    { f: 954, ...sit },
    { f: POINT - 2, armL: 20, curlL: 0, lookY: 0.6 },
    { f: POINT + 4, armL: 4, curlL: -0.4, lookY: 0.9, browTilt: 4, smile: 0.5, mouthOpen: 0.5, mouthWidth: 0.6, ease: "out" },
    { f: 1004, armL: 20, curlL: 0, lookY: 0.2 },
    { f: AGAIN, smile: 1, mouthOpen: 0.7, mouthWidth: 0.9, browTilt: 0, armL: 50, armR: 50 },
    { f: 1036, armL: 20, armR: 20, squint: 1, cheeks: 0.5 },
    { f: TOGETHER, ...stand, squint: 0, cheeks: 0, lookY: 0.6, armL: 0 },
    ...Array.from({ length: 4 }, (_, k) => [
      { f: 1066 + k * PER2, sy: 0.95, smile: 1 },
      { f: 1074 + k * PER2, sy: 1 },
    ]).flat(),
    ...jump(ASIDE + 2, 0, XP(1330), 60, 12),
    { f: 1166, eyeScale: 1, lookY: 0.6 },
    { f: 1170, eyeScale: 1.3, mouthOpen: 0.8, mouthWidth: 0.5, browY: -14, lookY: -0.2, lookX: -0.7, turn: -0.4, ease: "snap" },
    // the chop!
    { f: CHOP - 8, armL: 20, browY: 0, eyeScale: 1 },
    { f: CHOP - 2, armL: 165, browTilt: -14, mouthOpen: 0.3, mouthWidth: 0.4, ease: "out" },
    { f: CHOP, armL: 165 },
    { f: CHOP + 3, armL: -10, squint: 1, mouthOpen: 0.9, mouthWidth: 1, smile: 1, browTilt: 0, ease: "snap" },
    { f: 1200, squint: 0, armL: -46, armR: -46, eyeScale: 1.1, lookY: 0.5, lookX: -0.2, turn: -0.1, mouthOpen: 0.5, mouthWidth: 0.7 },
    { f: BITE + 2, mouthOpen: 1, mouthWidth: 0.8 },
    { f: BITE + 6, mouthOpen: 0.1, mouthWidth: 0.6, ease: "snap" },
    ...alternate(BITE + 10, BITE + 22, 4, { mouthOpen: 0.35 }, { mouthOpen: 0.1 }),
    { f: 1238, squint: 1, smile: 1, cheeks: 0.8, mouthOpen: 0.85, mouthWidth: 1, sy: 0.95, lookY: 0 },
    { f: 1250, sy: 1 },
    { f: GARDEN_END, squint: 1 },
  ]),
);

const { poseOf, handOf, toWorld } = makeDuo({ pinkAt: PINK_AT, meloAt: MELO_AT, width: WIDTH, pinkKeys: PINK_KEYS, meloKeys: MELO_KEYS });

// ---------------------------------------------------------------- time
const skyAt = (f: number): SkyState => {
  const storm = lerp(f, [STORM - 4, STORM + 16, MORNING - 4, MORNING + 12], [0, 1, 1, 0]);
  const grey = lerp(f, [MORNING - 4, MORNING + 12, 996, TOGETHER], [0, 1, 1, 0]);
  const gold = lerp(f, [1176, 1196], [0, 0.7]);
  if (f < MONTAGE) return { day: 1, storm, grey, gold, sunAngle: 1.0 };
  if (f < STORM) {
    const a = 1.0 + ((f - MONTAGE) / PER) * Math.PI * 2;
    return { day: Math.max(0, Math.min(1, 0.5 + Math.sin(a) * 2.5)), storm, grey, gold, sunAngle: a };
  }
  if (f < TOGETHER) return { day: lerp(f, [MORNING - 4, MORNING + 12], [0, 1]), storm, grey, gold, sunAngle: lerp(f, [996, TOGETHER], [1.0, Math.PI / 2]) };
  const a = Math.PI / 2 + (Math.min(f, 1180) - TOGETHER) / PER2 * Math.PI * 2;
  return { day: 0.55 + 0.45 * Math.max(-1, Math.min(1, Math.sin(a) * 2.5)), storm, grey, gold, sunAngle: a };
};
const dayCount = (f: number) => {
  if (f < MONTAGE) return 1;
  if (f < MORNING) return Math.min(40, 1 + Math.floor(((f - MONTAGE) * 39) / (LEAVE - MONTAGE)));
  if (f < TOGETHER) return 41;
  return Math.min(90, 41 + Math.floor(((f - TOGETHER) * 49) / 130));
};

// how much the watering cans pour (0..1)
const pour = (local: number, a: number, b: number) => interpolate(local, [a, a + 3, b - 3, b], [0, 1, 1, 0], clamp);
const meloPour = (f: number) => {
  if (f < MONTAGE) return pour(f, 138, 166);
  if (f < SUNRISES[0]) return pour(f, 300, 316);
  if (f < LEAVE) {
    const k = SUNRISES.filter((s) => f >= s).length - 1;
    return k <= 0 ? 0 : pour(f - SUNRISES[k], 4, 18);
  }
  if (f >= 1056 && f < ASIDE) return pour((f - 1056) % PER2, 2, 14);
  return 0;
};
const pinkPour = (f: number) => (f >= 1060 && f < ASIDE ? pour((f - 1060) % PER2, 2, 14) : 0);

// ---------------------------------------------------------------- the plants
const FRUIT_X = PLOT_X + 70;
const fruitR = (f: number) => lerp(f, [600, 718], [0, 55]);
const SEEDS: [number, number][] = [[810, 1494], [870, 1498], [930, 1492], [985, 1497], [1030, 1493]];
const PICKED = 0;
const seedAt = (f: number, i: number): [number, number] => {
  const from: [number, number] = [FRUIT_X, GROUND - 50];
  const t = lerp(f, [CRACK + 4 + i * 2, CRACK + 18 + i * 2], [0, 1], Easing.out(Easing.quad));
  const [tx, ty] = SEEDS[i];
  return [from[0] + (tx - from[0]) * t, from[1] + (ty - from[1]) * t - Math.sin(Math.PI * t) * 90];
};

const Seed: React.FC<{ x: number; y: number; glow?: number }> = ({ x, y, glow = 0 }) => (
  <div style={{ position: "absolute", left: x - 9, top: y - 13, width: 18, height: 26, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: "#2B1A12", boxShadow: glow > 0 ? `0 0 ${24 * glow}px ${10 * glow}px rgba(255,236,150,${0.8 * glow})` : undefined }} />
);

const Tear: React.FC<{ y: number; o: number }> = ({ y, o }) => (
  <path d={`M 268 ${y - 16} C 278 ${y - 2} 278 ${y + 10} 268 ${y + 10} C 258 ${y + 10} 258 ${y - 2} 268 ${y - 16} Z`} fill="#BFEFFF" opacity={o} stroke="white" strokeWidth={2} />
);

// ---------------------------------------------------------------- the world
const World: React.FC<{ f: number; dark: number }> = ({ f, dark }) => {
  const melo = poseOf("melo", f);
  const pink = poseOf("pink", f);
  const mHand = handOf("melo", melo, "R");
  const pHand = handOf("pink", pink, "L");
  const sway = Math.sin(f / 3) * 14 * lerp(f, [STORM, STORM + 16, BREAK, BREAK + 4], [0, 1, 1, 0]) + Math.sin(f / 20) * 2;
  const first = f < TOGETHER + 8;
  const oldFade = lerp(f, [1036, 1048], [1, 0]);
  const showChars = f < LEAVE + 26 || f >= ARRIVE - 4;
  const pinkIn = f >= PINK_IN - 2 && !(f >= LEAVE + 40 && f < 916);
  const meloCan = (f >= CAN && f < LEAVE + 8) || (f >= TOGETHER + 12 && f < ASIDE);
  const pinkCan = f >= TOGETHER + 14 && f < ASIDE + 2;
  const tear = f >= 914 && f < 990 ? <Tear y={lerp(f, [914, 984], [232, 300])} o={lerp(f, [914, 920, 980, 990], [0, 1, 1, 0])} /> : null;
  const slice = f >= 1198 ? (
    <g transform={`translate(200 392) scale(${lerp(f, [1198, 1204], [0.3, 0.9], Easing.out(Easing.back(2)))})`}>
      <SliceShape />
    </g>
  ) : null;
  const open = lerp(f, [CHOP + 3, CHOP + 12], [0, 1], Easing.out(Easing.back(1.6)));
  // the picked seed: from the ground to his hand, then back into the earth
  const hand0 = handOf("melo", poseOf("melo", PICK + 10), "R");
  const picked: [number, number] =
    f < PICK + 2
      ? SEEDS[PICKED]
      : f < PICK + 10
        ? [SEEDS[PICKED][0] + (hand0[0] - SEEDS[PICKED][0]) * lerp(f, [PICK + 2, PICK + 10], [0, 1]), SEEDS[PICKED][1] + (hand0[1] - 10 - SEEDS[PICKED][1]) * lerp(f, [PICK + 2, PICK + 10], [0, 1])]
        : f < 1046
          ? [mHand[0], mHand[1] - 10]
          : [mHand[0] + (PLOT_X - mHand[0]) * lerp(f, [1046, 1052], [0, 1]), mHand[1] + (GROUND - mHand[1]) * lerp(f, [1046, 1052], [0, 1])];

  // the very first seed, in his hand, then into the soil
  const seed0Hand = toWorld("melo", poseOf("melo", PLANT + 4), 370, 330);
  const seed0: [number, number] = f < PLANT ? [mHand[0], mHand[1] - 10] : [seed0Hand[0] + (PLOT_X - seed0Hand[0]) * lerp(f, [PLANT + 4, PLANT + 12], [0, 1]), seed0Hand[1] + (GROUND - seed0Hand[1]) * lerp(f, [PLANT + 4, PLANT + 12], [0, 1], Easing.in(Easing.quad))];

  return (
    <>
      <GardenSet dark={dark} dayCount={dayCount(f)} />
      {/* the little mound where the seed sleeps */}
      {f >= PLANT + 12 && f < SPROUT + 40 ? <div style={{ position: "absolute", left: PLOT_X - 46, top: GROUND - 14, width: 92, height: 30, borderRadius: "50% 50% 10% 10%", background: "#7A4E30" }} /> : null}
      {/* the first plant, its fruit, the storm */}
      {first ? (
        <div style={{ position: "absolute", inset: 0, opacity: oldFade }}>
          <Plant x={PLOT_X} g={lerp(f, [SPROUT, SPROUT + 8, 450, 560, 718], [0, 0.1, 0.35, 0.7, 0.85])} flower={lerp(f, [520, 556, 620, 660], [0, 1, 1, 0])} broken={lerp(f, [BREAK, BREAK + 6], [0, 1], Easing.out(Easing.quad))} sway={sway} />
          <Watermelon x={FRUIT_X} y={GROUND - fruitR(f) * 0.9} r={fruitR(f)} crack={lerp(f, [CRACK, CRACK + 6], [0, 1])} />
        </div>
      ) : null}
      {/* together: three plants, one giant */}
      {f >= 1046 ? (
        <>
          <Plant x={480} g={lerp(f, [1062, 1140], [0, 0.6])} sway={Math.sin(f / 18) * 3} scale={0.8} />
          <Plant x={1380} g={lerp(f, [1066, 1144], [0, 0.6])} sway={Math.sin(f / 18 + 1) * 3} scale={0.8} />
          <Plant x={PLOT_X} g={lerp(f, [1054, 1062, 1130], [0, 0.12, 0.85])} sway={Math.sin(f / 20) * 2} />
          <Watermelon x={420} y={GROUND - lerp(f, [1110, 1170], [0, 60]) * 0.9} r={lerp(f, [1110, 1170], [0, 60])} />
          <Watermelon x={1440} y={GROUND - lerp(f, [1116, 1172], [0, 60]) * 0.9} r={lerp(f, [1116, 1172], [0, 60])} />
          <Watermelon x={PLOT_X} y={GROUND - lerp(f, [1100, 1172], [0, 130], Easing.out(Easing.back(1.4))) * 0.9} r={lerp(f, [1100, 1172], [0, 130], Easing.out(Easing.back(1.4)))} open={open} />
        </>
      ) : null}
      <PopBurst f={f} at={CHOP + 3} x={PLOT_X} y={GROUND - 140} r={120} tones={["#FF4F6F", "#FF8FA3", "#9BE07E"]} n={14} />
      {/* the seeds she left behind */}
      {f >= CRACK + 4 && f < 1050
        ? SEEDS.map((_, i) => {
            if (i === PICKED && f >= PICK + 2) return null;
            const [x, y] = seedAt(f, i);
            return <Seed key={i} x={x} y={y} glow={f >= POINT + 4 ? (0.6 + 0.4 * Math.sin(f / 4 + i)) * lerp(f, [POINT + 4, POINT + 14, 1036, 1048], [0, 1, 1, 0]) : 0} />;
          })
        : null}
      {f >= PICK + 2 && f < 1052 ? <Seed x={picked[0]} y={picked[1]} glow={0.8} /> : null}
      {f >= 40 && f < PLANT + 12 ? <Seed x={seed0[0]} y={seed0[1]} glow={lerp(f, [60, 80], [0, 0.7])} /> : null}
      {showChars && pinkIn ? <BoumMonster pose={pink} held={slice} style={rigBox(PINK_AT, WIDTH)} /> : null}
      {showChars ? <BoumMonster pose={melo} skin="melo" held={slice} over={<g>{tear}</g>} style={rigBox(MELO_AT, WIDTH)} /> : null}
      {meloCan ? <WateringCan x={mHand[0] + 10} y={mHand[1] - 10} tilt={meloPour(f)} dir={1} f={f} /> : null}
      {pinkCan ? <WateringCan x={pHand[0] - 10} y={pHand[1] - 10} tilt={pinkPour(f)} dir={-1} f={f} /> : null}
      <Say f={f} from={SHOUT} to={236} x={660} y={1000} text="Allez, pousse !" color="#3E8E2E" tail="left" />
      <Say f={f} from={266} to={298} x={1000} y={1010} text="Il faut lui laisser du temps." color={colors.logoRed} tail="right" size={50} />
      <Say f={f} from={SPROUT + 8} to={SPROUT + 34} x={560} y={930} text="Elle pousse !!" color="#3E8E2E" tail="left" />
      <Say f={f} from={POINT + 2} to={1004} x={940} y={1050} text="Regarde… elle t'a laissé des graines." color={colors.logoRed} tail="right" size={44} />
      <Say f={f} from={AGAIN} to={1040} x={1000} y={1050} text="On recommence ? Ensemble." color={colors.logoRed} tail="right" size={52} />
    </>
  );
};

// ---------------------------------------------------------------- camera
// keeps the ground line at the same height on screen (y = 1310) whatever the zoom
const at = (f: number, cx: number, z: number, ground = 1310): Cam => [f, cx, GROUND - (ground - 960) / z, z];
const MAIN: Cam[] = [
  at(0, 930, 0.8, 1250), // the garden
  at(56, 930, 0.8, 1250),
  at(86, 760, 1.25), // one seed
  at(170, 780, 1.2),
  at(PINK_IN - 4, 930, 0.95),
  at(296, 930, 0.95),
  at(MONTAGE + 24, 930, 0.92), // days go by
  at(SPROUT + 2, 850, 1.1), // the sprout!
  at(SPROUT + 36, 850, 1.1),
  at(SPROUT + 60, 930, 0.92),
  at(LEAVE + 22, 930, 0.92),
  at(STORM + 10, 970, 1.5, 1250), // the storm
  at(MORNING, 970, 1.5, 1250),
  at(ARRIVE + 10, 900, 1.0), // the morning after
  at(KNEEL + 20, 820, 1.25),
  at(POINT - 6, 820, 1.25),
  at(POINT + 6, 930, 0.98),
  at(1040, 930, 0.98),
  at(TOGETHER + 16, 930, 0.92), // together
  at(ASIDE, 930, 0.92),
  at(CHOP - 10, 930, 0.92),
  at(BITE, 930, 1.0),
  at(GARDEN_END, 930, 1.05),
];

const Caption: React.FC<{ f: number; from: number; to: number; text: string }> = ({ f, from, to, text }) => {
  const o = interpolate(f, [from, from + 10, to - 10, to], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1590, textAlign: "center", opacity: o, translate: `0px ${(1 - o) * 20}px` }}>
      <span style={{ display: "inline-block", padding: "18px 40px", borderRadius: 40, background: "rgba(20,40,20,0.55)", fontFamily: scriptFont, fontSize: 62, color: "#FFF3C4", textShadow: "0 3px 0 rgba(0,0,0,0.35)", lineHeight: 1.2 }}>{text}</span>
    </div>
  );
};

const FLASHES = [784, BREAK, 826];

export const GardenScene: React.FC = () => {
  const f = useCurrentFrame();
  const { cx, cy, z } = camAt(MAIN, f);
  const sky = skyAt(f);
  const dark = Math.min(1, (1 - sky.day) * 0.85 + sky.storm * 0.4 + sky.grey * 0.3);
  const flash = Math.max(...FLASHES.map((a) => interpolate(f, [a, a + 2, a + 9], [0, 0.5, 0], clamp)));
  const sad = lerp(f, [KNEEL, 930, POINT, 1000], [0, 0.4, 0.4, 0]);

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#5EC8F2" }}>
      <GardenSky s={sky} />
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${540 - cx * z}px, ${960 - cy * z}px) scale(${z})` }}>
        <World f={f} dark={dark} />
      </div>
      <Rain f={f} wind={0.6} amount={sky.storm} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 30%, rgba(10,20,40,0.6) 100%)", opacity: sad }} />
      <AbsoluteFill style={{ background: "#FFB27A", mixBlendMode: "soft-light", opacity: sky.gold * 0.5 }} />
      <AbsoluteFill style={{ background: "white", opacity: flash }} />

      <SeriesTitle episode={7} title="Le Jardin de Mélo" titleColor="#7BD06A" outAt={56} />
      <Caption f={f} from={64} to={150} text="Mélo avait une graine. Une seule." />
      <Caption f={f} from={170} to={252} text="Il la voulait… tout de suite !" />
      <Caption f={f} from={306} to={340} text="Alors il attendit." />
      <Caption f={f} from={390} to={480} text="Chaque matin, il revint l'arroser." />
      <Caption f={f} from={520} to={600} text="Jour après jour, elle grandit…" />
      <Caption f={f} from={610} to={700} text="…une fleur, puis un petit fruit !" />
      <Caption f={f} from={756} to={840} text="Mais une nuit, l'orage arriva." />
      <Caption f={f} from={896} to={962} text="Tout ce travail… parti en une nuit." />
      <Caption f={f} from={1050} to={1118} text="Alors ils recommencèrent. Ensemble." />
      <Caption f={f} from={1122} to={1196} text="Les plus belles choses prennent du temps…" />
      <Caption f={f} from={1200} to={GARDEN_END + 6} text="…et grandissent mieux à deux." />
    </AbsoluteFill>
  );
};
