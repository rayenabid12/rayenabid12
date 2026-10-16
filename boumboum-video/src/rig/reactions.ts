import { blinkAt, type Key, sortKeys } from "./pose";

// Six core reactions, keyed pose-to-pose. Frames at 30 fps; y < 0 is up (rig units).
// Secondary motion (jiggle, ears, arm whip, legs, jelly bend) comes from the physics pass.

const alternate = (from: number, to: number, every: number, a: Record<string, number>, b: Record<string, number>): Key[] => {
  const keys: Key[] = [];
  let i = 0;
  for (let f = from; f <= to; f += every) {
    keys.push({ f, ...(i % 2 === 0 ? a : b) });
    i++;
  }
  return keys;
};

export const IDLE: Key[] = sortKeys([
  { f: 0, bend: 0, sy: 1, rot: 0, armL: 8, armR: 8, lookX: 0, turn: 0, mouthOpen: 0.85 },
  { f: 22, bend: 8, sy: 1.015, rot: 1.5, armL: 13, armR: 4 },
  { f: 45, bend: -6, sy: 0.99, rot: -1, armL: 6, armR: 12, mouthOpen: 0.65 },
  { f: 42, lookX: 0, turn: 0 },
  { f: 48, lookX: 0.6, turn: 0.18, ease: "out" },
  { f: 60, lookX: 0.6, turn: 0.18, ease: "hold" },
  { f: 68, lookX: 0, turn: 0, mouthOpen: 0.85, bend: 4 },
  { f: 90, bend: 0, sy: 1, rot: 0, armL: 8, armR: 8 },
  ...blinkAt(28),
  ...blinkAt(74),
]);

export const HELLO: Key[] = sortKeys([
  { f: 0, sy: 1, y: 0, armR: 8, bend: 0, browY: 0, mouthOpen: 0.85, rot: 0, turn: 0, curlR: 0 },
  // anticipation: dip and pull the arm in
  { f: 7, sy: 0.92, y: 10, armR: -20, bend: -8, browY: 4, mouthOpen: 0.55 },
  // snap up into the wave
  { f: 12, sy: 1.06, y: -8, armR: 112, bend: 10, browY: -12, mouthOpen: 1, rot: -3, turn: 0.12, ease: "snap" },
  { f: 17, sy: 1, y: 0, ease: "out" },
  // wave: hand swings out and back, body bobs on each swing
  ...alternate(17, 53, 6, { armR: 112, curlR: -0.5, sy: 1 }, { armR: 84, curlR: 0.5, sy: 0.975 }),
  { f: 23, rot: 3 },
  { f: 35, rot: -3 },
  { f: 47, rot: 2 },
  { f: 60, armR: 108, curlR: 0, ease: "out" },
  // arm drops, settle
  { f: 72, armR: 8, bend: -4, sy: 0.97, rot: 0, turn: 0 },
  { f: 82, sy: 1, bend: 0, mouthOpen: 0.85, browY: 0 },
  { f: 90, sy: 1 },
  ...blinkAt(40),
]);

export const JOY_JUMP: Key[] = sortKeys([
  { f: 0, y: 0, sy: 1, armL: 8, armR: 8, squint: 0, mouthOpen: 0.85, legSpread: 0, legLift: 0, browY: 0 },
  // anticipation crouch
  { f: 10, y: 22, sy: 0.78, armL: -30, armR: -30, squint: 1, mouthOpen: 0.3, mouthWidth: 0.7, browY: 6, legSpread: 0.35 },
  { f: 13, y: 22, sy: 0.78, ease: "hold" },
  // launch
  { f: 18, y: -230, sy: 1.12, armL: 150, armR: 150, mouthOpen: 1, mouthWidth: 1, browY: -12, legSpread: 0, legLift: 1, ease: "out" },
  { f: 25, y: -262, sy: 1, ease: "out" },
  { f: 29, y: -252, ease: "inOut" },
  // fall and land
  { f: 36, legLift: 0, ease: "in" },
  { f: 37, y: 0, ease: "in" },
  { f: 38, sy: 0.76, legSpread: 0.45, armL: 115, armR: 115, ease: "snap" },
  { f: 45, sy: 1.06, legSpread: 0, ease: "out" },
  { f: 51, sy: 1 },
  // happy little bounce, arms up in victory
  { f: 56, y: -46, ease: "out" },
  { f: 62, y: 0, ease: "in" },
  { f: 63, sy: 0.86, ease: "snap" },
  { f: 69, sy: 1, armL: 145, armR: 145, ease: "out" },
  { f: 96, y: 0, sy: 1, armL: 140, armR: 140 },
]);

export const YUM: Key[] = sortKeys([
  { f: 0, squint: 0, mouthOpen: 0.85, mouthWidth: 1, cheeks: 0, armL: 8, armR: 8, browY: 0, sy: 1, turn: 0, rot: 0 },
  { f: 6, squint: 1, mouthOpen: 0.1, mouthWidth: 0.55, cheeks: 0.8, armL: -45, armR: -45, browY: -6, ease: "out" },
  // chewing: jaw, cheeks and a little body bob, hands rubbing the belly
  ...alternate(8, 50, 6, { mouthOpen: 0.1, cheeks: 1, sy: 1 }, { mouthOpen: 0.32, cheeks: 0.55, sy: 0.97 }),
  ...alternate(8, 50, 12, { turn: 0.12, rot: 2 }, { turn: -0.12, rot: -2 }),
  ...alternate(8, 50, 8, { armL: -45, armR: -30 }, { armL: -30, armR: -45 }),
  { f: 52, squint: 1, browY: -6, eyeScale: 1, mouthWidth: 0.55 },
  // swallow, then eyes pop open with delight
  { f: 54, mouthOpen: 0, mouthWidth: 0.6, sy: 0.94, turn: 0, rot: 0, cheeks: 0.4 },
  { f: 58, sy: 1.03, cheeks: 0, squint: 0, eyeScale: 1.1, browY: -14, ease: "out" },
  // lick the lips
  { f: 62, mouthOpen: 0.55, mouthWidth: 0.7, tongue: 0, tongueX: -0.6, lookX: 0, lookY: 0, sy: 1 },
  { f: 65, tongue: 1, ease: "out" },
  { f: 76, tongueX: 0.8, lookX: 0.5, lookY: 0.3 },
  { f: 79, tongue: 1 },
  { f: 83, tongue: 0, mouthOpen: 0.9, mouthWidth: 1, squint: 1, eyeScale: 1, lookX: 0, lookY: 0, armL: 40, armR: 40, browY: -8 },
  { f: 100, armL: 40, armR: 40 },
]);

export const SURPRISE: Key[] = sortKeys([
  { f: 0, lookX: 0.3, sy: 1, y: 0, armL: 8, armR: 8, eyeScale: 1, pupil: 1, browY: 0, mouthOpen: 0.85, mouthWidth: 1 },
  { f: 12, lookX: 0 },
  // brace
  { f: 13, blink: 0, browY: 0, mouthOpen: 0.85, mouthWidth: 1, armL: 8, armR: 8 },
  { f: 16, sy: 0.86, y: 6, blink: 0.5, browY: 8, mouthOpen: 0, mouthWidth: 0.5, armL: -10, armR: -10 },
  // the take
  { f: 19, sy: 1.3, y: -40, blink: 0, eyeScale: 1.45, pupil: 0.5, browY: -30, mouthOpen: 1, mouthWidth: 0.45, armL: 160, armR: 160, legSpread: 0.6, ease: "snap" },
  { f: 24, sy: 1.18, eyeScale: 1.35, ease: "out" },
  // hold, trembling
  { f: 24, x: 0 },
  { f: 26, x: 5, ease: "linear" },
  { f: 28, x: -5, ease: "linear" },
  { f: 30, x: 4, ease: "linear" },
  { f: 32, x: -3, ease: "linear" },
  { f: 34, x: 0, ease: "linear" },
  { f: 36, sy: 1.18, y: -40, ease: "hold" },
  // settle into worry, look around, gulp
  { f: 46, sy: 1, y: 0, eyeScale: 1.15, pupil: 0.8, browY: -8, browTilt: 16, mouthOpen: 0.35, mouthWidth: 0.45, smile: -0.4, armL: 30, armR: 30, legSpread: 0 },
  { f: 47, turn: 0, lookX: 0 },
  { f: 53, turn: -0.35, lookX: -0.8, ease: "out" },
  { f: 62, turn: 0.35, lookX: 0.8, ease: "out" },
  { f: 71, turn: 0, lookX: 0 },
  { f: 75, sy: 1, mouthOpen: 0.35 },
  { f: 77, sy: 0.93, mouthOpen: 0, mouthWidth: 0.5 },
  { f: 83, sy: 1 },
  { f: 90, sy: 1 },
  ...blinkAt(79),
]);

export const WINK: Key[] = sortKeys([
  { f: 0, rot: 0, bend: 0, sy: 1, turn: 0, wink: 0, armR: 8, mouthOpen: 0.85, mouthWidth: 1, browY: 0, y: 0 },
  // lean back...
  { f: 8, rot: -4, bend: -10, sy: 0.96, mouthOpen: 0.7, wink: 0, turn: 0, armR: 8, browY: 0, mouthWidth: 1, curlR: 0 },
  // ...and snap into the cheeky wink, pointing at the viewer
  { f: 13, rot: 5, bend: 14, sy: 1.04, turn: 0.25, wink: 1, browY: -4, mouthOpen: 0.35, mouthWidth: 0.75, armR: 70, curlR: 0.35, ease: "snap" },
  { f: 18, sy: 1, ease: "out" },
  { f: 30, y: -8 },
  { f: 36, y: 0 },
  { f: 52, wink: 1, turn: 0.25, rot: 5, armR: 70, ease: "hold" },
  { f: 62, wink: 0, turn: 0, rot: 0, bend: 0, armR: 8, curlR: 0, mouthOpen: 0.85, mouthWidth: 1 },
  { f: 80, sy: 1 },
]);

export const REACTIONS = [
  { id: "idle", name: "Idle", note: "Respiration, balancement, regard curieux", keys: IDLE, duration: 90 },
  { id: "hello", name: "Coucou !", note: "Anticipation, salut avec bras élastique", keys: HELLO, duration: 90 },
  { id: "joy", name: "Saut de joie", note: "Accroupi, envol, réception gélatineuse", keys: JOY_JUMP, duration: 96 },
  { id: "yum", name: "Miam", note: "Mâche, avale, se lèche les babines", keys: YUM, duration: 100 },
  { id: "surprise", name: "Surprise !", note: "« Take » cartoon, tremble, inquiet", keys: SURPRISE, duration: 90 },
  { id: "wink", name: "Clin d'œil", note: "Recul, puis clin d'œil complice", keys: WINK, duration: 80 },
];
