import { type Key, sortKeys } from "./pose";

// Mélo's reactions. Same rig as the pink monster, different acting:
// fewer, crisper moves, small amplitudes, and he always settles back to his
// half-lidded smirk (MELO_COOL). Frames at 30 fps; y < 0 is up (rig units).

// Mélo, the watermelon friend. Default face: relaxed half-closed eyes, confident half-smile.
export const MELO_COOL = { blink: 0.24, mouthOpen: 0.2, mouthWidth: 0.72, smile: 0.4, browY: 2 };

const BASE: Key = {
  f: 0, ...MELO_COOL, x: 0, y: 0, rot: 0, sy: 1, bend: 0, turn: 0, lookX: 0, lookY: 0, eyeScale: 1, pupil: 1,
  browTilt: 0, squint: 0, wink: 0, cheeks: 0, tongue: 0, armL: 8, armR: 8, curlL: 0, curlR: 0, legSpread: 0, legLift: 0,
};

// A lazy blink that returns to his half-closed lids instead of wide open.
export const coolBlink = (f: number, rest = MELO_COOL.blink): Key[] => [
  { f: f - 1, blink: rest },
  { f: f + 3, blink: 1, ease: "in" },
  { f: f + 4, blink: 1, ease: "hold" },
  { f: f + 10, blink: rest, ease: "out" },
];

const alternate = (from: number, to: number, every: number, a: Partial<Key>, b: Partial<Key>): Key[] => {
  const keys: Key[] = [];
  let i = 0;
  for (let f = from; f <= to; f += every) {
    keys.push({ f, ...(i % 2 === 0 ? a : b) });
    i++;
  }
  return keys;
};

// 01: leaning back, hand on hip, nodding to a beat only he can hear.
export const M_IDLE: Key[] = sortKeys([
  { ...BASE, armL: -30, curlL: 1.6, rot: -2, bend: -4 },
  ...alternate(6, 114, 12, { sy: 0.975, browY: 4, lookY: 0.1, ease: "out" }, { sy: 1, browY: 2, lookY: 0, ease: "inOut" }),
  ...alternate(6, 114, 24, { bend: -7 }, { bend: -2 }),
  // side glance... nothing interesting... back to cool
  { f: 44, lookX: 0, turn: 0 },
  { f: 50, lookX: 0.7, turn: 0.16, ease: "out" },
  { f: 66, lookX: 0.7, turn: 0.16, ease: "hold" },
  { f: 72, lookX: 0, turn: 0, ease: "inOut" },
  { f: 70, smile: 0.4, mouthWidth: 0.72 },
  { f: 76, smile: 0.7, mouthWidth: 0.8 },
  { f: 100, smile: 0.4, mouthWidth: 0.72 },
  { f: 120, rot: -2, armL: -30 },
  ...coolBlink(32),
  ...coolBlink(92),
]);

// 02: "Yo." A two-finger flick off the brow and a chin-up nod. Minimal effort, maximum style.
export const M_YO: Key[] = sortKeys([
  { ...BASE },
  // tiny anticipation: lean in, arm tucks
  { f: 8, rot: 2, bend: 4, sy: 0.97, armR: -12, curlR: 0.3 },
  // flick up to the brow
  { f: 13, rot: -3, bend: -6, sy: 1.03, armR: 118, curlR: 0.9, browY: -6, turn: -0.1, ease: "snap" },
  { f: 18, sy: 1, ease: "out" },
  { f: 22, armR: 118, curlR: 0.9, ease: "hold" },
  // ...and flick it off toward the viewer
  { f: 27, armR: 70, curlR: -0.5, mouthOpen: 0.5, mouthWidth: 0.5, smile: 0.6, ease: "out" },
  // chin-up nod
  { f: 30, lookY: 0, y: 0 },
  { f: 34, lookY: -0.2, browY: -8, sy: 1.02, ease: "out" },
  { f: 40, lookY: 0.15, browY: 4, sy: 0.97 },
  { f: 47, lookY: 0, browY: 2, sy: 1 },
  { f: 50, armR: 70, curlR: -0.5, ease: "hold" },
  // arm drops lazily, smirk returns
  { f: 64, armR: 8, curlR: 0, rot: 0, bend: 0, turn: 0, ...MELO_COOL },
  { f: 90, sy: 1 },
  ...coolBlink(70),
]);

// 03: a quick "yesss!" fist pump with a hop... then he catches himself and plays it cool.
export const M_JOY: Key[] = sortKeys([
  { ...BASE },
  { f: 8, sy: 0.88, y: 10, armR: -20, curlR: 0.4, bend: -4, blink: 0.5, mouthOpen: 0, mouthWidth: 0.5, smile: 0.6, legSpread: 0.3 },
  // pump + hop
  { f: 13, sy: 1.1, y: -90, armR: 150, curlR: 0.8, armL: 30, squint: 1, mouthOpen: 1, mouthWidth: 0.9, smile: 1, browY: -12, legSpread: 0, legLift: 0.6, ease: "snap" },
  { f: 19, y: -104, sy: 1, ease: "out" },
  { f: 25, legLift: 0, ease: "in" },
  { f: 26, y: 0, ease: "in" },
  { f: 27, sy: 0.84, legSpread: 0.4, ease: "snap" },
  // pull the fist down: "yesss"
  { f: 30, armR: 150 },
  { f: 34, armR: 40, curlR: 1, sy: 1.02, legSpread: 0, ease: "out" },
  { f: 38, sy: 1 },
  { f: 40, armR: 40, squint: 1, ease: "hold" },
  // catches himself: freeze, glance at camera...
  { f: 48, squint: 0, blink: 0, eyeScale: 1.08, mouthOpen: 0.5, mouthWidth: 0.6, smile: 0.2, armR: 40, armL: 30, browY: -6, lookX: 0.2 },
  { f: 56, eyeScale: 1.08, ease: "hold" },
  // ...straightens up, smooth: back to cool
  { f: 64, eyeScale: 1, lookX: 0, armR: 8, curlR: 0, armL: 8, sy: 1.03, ...MELO_COOL },
  { f: 70, sy: 1 },
  { f: 96, sy: 1 },
  ...coolBlink(76),
]);

// 04: calm, savouring chews, then a chef's kiss.
export const M_YUM: Key[] = sortKeys([
  { ...BASE },
  { f: 6, blink: 0.45, mouthOpen: 0.1, mouthWidth: 0.55, cheeks: 0.5, smile: 0.6 },
  ...alternate(8, 44, 9, { mouthOpen: 0.08, cheeks: 0.6, sy: 1 }, { mouthOpen: 0.26, cheeks: 0.35, sy: 0.985 }),
  ...alternate(8, 44, 18, { turn: 0.08, rot: 1.5 }, { turn: -0.08, rot: -1.5 }),
  // hand up to the lips, eyes close, pucker
  { f: 46, armR: 8, curlR: 0, squint: 0, mouthOpen: 0.1 },
  { f: 54, armR: -104, curlR: 0.2, squint: 1, mouthOpen: 0.28, mouthWidth: 0.28, smile: 0.5, cheeks: 0.7, turn: 0, rot: 0, ease: "out" },
  { f: 58, armR: -104, ease: "hold" },
  // ...MWAH: flick the kiss away
  { f: 63, armR: 75, curlR: -0.7, mouthOpen: 0.2, mouthWidth: 0.6, smile: 1, rot: -3, bend: -8, sy: 1.04, browY: -6, ease: "snap" },
  { f: 69, sy: 1, ease: "out" },
  { f: 80, armR: 75, squint: 1, ease: "hold" },
  // eyes open, satisfied smirk
  { f: 92, squint: 0, armR: 8, curlR: 0, rot: 0, bend: 0, cheeks: 0, ...MELO_COOL },
  { f: 110, sy: 1 },
]);

// 05: the one thing that makes him lose his cool... then he pretends it never happened.
export const M_SURPRISE: Key[] = sortKeys([
  { ...BASE, armL: -30, curlL: 1.6, rot: -2 },
  { f: 10, sy: 1, lookX: 0.2 },
  { f: 13, sy: 0.92, y: 4, blink: 0.6, mouthOpen: 0, mouthWidth: 0.4, armL: -30, armR: 8, browY: 6, lookX: 0.2 },
  // TAKE: lids snap wide, stem pings up
  { f: 16, sy: 1.26, y: -36, blink: 0, eyeScale: 1.42, pupil: 0.5, browY: -28, mouthOpen: 0.95, mouthWidth: 0.42, smile: 1, armL: 155, curlL: 0, armR: 155, rot: 0, legSpread: 0.5, lookX: 0, ease: "snap" },
  { f: 21, sy: 1.15, ease: "out" },
  { f: 22, x: 0 },
  { f: 24, x: 5, ease: "linear" },
  { f: 26, x: -5, ease: "linear" },
  { f: 28, x: 3, ease: "linear" },
  { f: 30, x: 0, ease: "linear" },
  { f: 36, sy: 1.15, y: -36, eyeScale: 1.42, armL: 155, armR: 155, ease: "hold" },
  // land, frozen... was anybody watching?
  { f: 44, sy: 1, y: 0, eyeScale: 1.12, pupil: 0.8, browY: -8, mouthOpen: 0.3, mouthWidth: 0.4, smile: 0, armL: 40, armR: 40, legSpread: 0 },
  { f: 46, turn: 0, lookX: 0 },
  { f: 51, turn: -0.3, lookX: -0.8, ease: "out" },
  { f: 58, turn: -0.3, ease: "hold" },
  { f: 63, turn: 0.3, lookX: 0.8, ease: "out" },
  { f: 70, turn: 0.3, ease: "hold" },
  // ...nope. Smooth recovery: lids drop, smirk, hand back on the hip
  { f: 76, turn: 0, lookX: 0, eyeScale: 1, pupil: 1, armL: -30, curlL: 1.6, armR: 8, rot: -2, sy: 1.03, ...MELO_COOL },
  { f: 82, sy: 1 },
  { f: 110, sy: 1 },
  ...coolBlink(90),
]);

// 06: finger guns + wink. "Pew pew."
export const M_WINK: Key[] = sortKeys([
  { ...BASE },
  // lean back, arms load
  { f: 8, rot: -4, bend: -10, sy: 0.96, armL: -10, armR: -10, curlL: 0.3, curlR: 0.3 },
  // snap: both finger guns at the viewer, wink
  { f: 13, rot: 4, bend: 12, sy: 1.04, turn: 0.15, wink: 1, blink: 0.2, armL: 38, armR: 38, curlL: -0.4, curlR: -0.4, browY: -4, mouthOpen: 0.3, mouthWidth: 0.7, smile: 0.9, ease: "snap" },
  { f: 18, sy: 1, ease: "out" },
  // pew (right)...
  { f: 26, armR: 38 },
  { f: 28, armR: 62, ease: "snap" },
  { f: 34, armR: 38, ease: "out" },
  // ...pew (left)
  { f: 38, armL: 38 },
  { f: 40, armL: 62, ease: "snap" },
  { f: 46, armL: 38, ease: "out" },
  { f: 56, wink: 1, turn: 0.15, rot: 4, bend: 12, armL: 38, armR: 38, ease: "hold" },
  // holster
  { f: 68, wink: 0, turn: 0, rot: 0, bend: 0, armL: 8, armR: 8, curlL: 0, curlR: 0, ...MELO_COOL },
  { f: 90, sy: 1 },
]);

// 07: signature, "Trop facile". Blows a perfect bubble without effort, shrugs, pop. Unbothered.
// The bubble itself is drawn by the scene from BUBBLE_KEYS (radius in rig units).
export const M_BUBBLE: Key[] = sortKeys([
  { ...BASE },
  ...alternate(4, 22, 7, { mouthOpen: 0.08, mouthWidth: 0.55, cheeks: 0.4 }, { mouthOpen: 0.24, mouthWidth: 0.55, cheeks: 0.2 }),
  // pucker and blow, perfectly steady
  { f: 26, mouthOpen: 0.3, mouthWidth: 0.28, smile: 0.5, cheeks: 0.7, blink: 0.35 },
  { f: 30, sy: 1, bend: 0 },
  { f: 76, sy: 1.02, cheeks: 0.9 },
  // shrug: "trop facile"
  { f: 84, armL: 8, armR: 8, browY: 2, rot: 0 },
  { f: 92, armL: 62, armR: 62, curlL: -0.6, curlR: -0.6, browY: -10, sy: 1.04, y: -6, rot: 2, ease: "out" },
  { f: 104, armL: 62, armR: 62, ease: "hold" },
  { f: 108, sy: 1, y: 0, armL: 30, armR: 30, curlL: 0, curlR: 0, browY: 2, rot: 0 },
  // POP: he doesn't even flinch, just one slow blink
  { f: 116, cheeks: 0.9, mouthOpen: 0.3, mouthWidth: 0.28 },
  { f: 122, cheeks: 0, armL: 8, armR: 8, ...MELO_COOL },
  { f: 150, sy: 1 },
  ...coolBlink(121),
]);

// [frame, radius]: bubble grows 26 -> 78, holds (gentle wobble added by the scene), pops at 114.
export const BUBBLE_KEYS: [number, number][] = [
  [26, 0], [34, 34], [58, 86], [78, 106], [113, 110],
];
export const BUBBLE_POP = 114;

export const MELO_REACTIONS = [
  { id: "idle", name: "Idle", note: "Appuyé sur la hanche, hoche la tête en rythme", keys: M_IDLE, duration: 120 },
  { id: "yo", name: "Yo !", note: "Salut deux doigts, petit coup de menton", keys: M_YO, duration: 90 },
  { id: "joie", name: "Yesss !", note: "Poing levé… puis il se reprend, l'air de rien", keys: M_JOY, duration: 96 },
  { id: "miam", name: "Miam", note: "Mâche tranquille, puis baiser du chef", keys: M_YUM, duration: 110 },
  { id: "surprise", name: "Surprise !", note: "Il perd son calme… et fait comme si de rien", keys: M_SURPRISE, duration: 110 },
  { id: "clin", name: "Clin d'œil", note: "Doigts pistolets, « pew pew »", keys: M_WINK, duration: 90 },
  { id: "bulle", name: "Trop facile", note: "La bulle parfaite, sans effort. Pop.", keys: M_BUBBLE, duration: 150 },
];
