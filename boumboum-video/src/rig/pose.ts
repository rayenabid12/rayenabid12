import { Easing, interpolate } from "remotion";

// Every animatable channel of the Boum Boum monster.
export type Pose = {
  // placement (feet position, in the rig's 400x500 space; y up = negative)
  x: number;
  y: number;
  rot: number; // lean around the feet, degrees
  sx: number;
  sy: number;
  bend: number; // head offset relative to feet, px (jelly bend)
  turn: number; // -1 profile left .. 0 front .. 1 profile right
  back: number; // 1 = seen from behind (turnaround only)
  // eyes + brows
  blink: number;
  squint: number; // happy closed "^ ^"
  wink: number; // right eye closes (0..1)
  lookX: number;
  lookY: number;
  eyeScale: number;
  pupil: number;
  browY: number; // px, negative = raised
  browTilt: number; // degrees, + = worried (inner ends up), - = determined
  // mouth
  mouthOpen: number;
  mouthWidth: number;
  smile: number; // -1 frown .. 1 smile (upper lip curve)
  tongue: number;
  tongueX: number;
  cheeks: number;
  // limbs
  armL: number; // degrees, + raises outward
  armR: number;
  curlL: number;
  curlR: number;
  legLift: number; // 0 standing .. 1 tucked
  legSpread: number;
  // secondary (normally written by the physics pass)
  earL: number;
  earR: number;
  jiggle: number;
  legSwing: number;
};

export const DEFAULT_POSE: Pose = {
  x: 0, y: 0, rot: 0, sx: 1, sy: 1, bend: 0, turn: 0, back: 0,
  blink: 0, squint: 0, wink: 0, lookX: 0, lookY: 0, eyeScale: 1, pupil: 1, browY: 0, browTilt: 0,
  mouthOpen: 0.85, mouthWidth: 1, smile: 1, tongue: 0, tongueX: 0, cheeks: 0,
  armL: 8, armR: 8, curlL: 0, curlR: 0, legLift: 0, legSpread: 0,
  earL: 0, earR: 0, jiggle: 0, legSwing: 0,
};

export type EaseName = "inOut" | "out" | "in" | "linear" | "overshoot" | "snap" | "hold";

const EASES: Record<Exclude<EaseName, "hold">, (t: number) => number> = {
  inOut: Easing.bezier(0.45, 0, 0.25, 1), // slow in, slow out
  out: Easing.bezier(0.15, 0.85, 0.3, 1),
  in: Easing.bezier(0.6, 0, 0.9, 0.6),
  linear: (t) => t,
  overshoot: Easing.bezier(0.3, 1.55, 0.5, 1), // pops past the pose and settles
  snap: Easing.bezier(0.05, 0.9, 0.1, 1), // very fast attack, long settle
};

// A key pose: frame number, the channels it sets, and how we ease INTO it.
export type Key = { f: number; ease?: EaseName } & Partial<Pose>;

const CHANNELS = Object.keys(DEFAULT_POSE) as (keyof Pose)[];

// Pose-to-pose interpolation; each channel only interpolates between keys that set it.
export const primaryPose = (keys: Key[], frame: number): Pose => {
  const out = { ...DEFAULT_POSE };
  for (const ch of CHANNELS) {
    let prev: Key | undefined;
    let next: Key | undefined;
    for (const k of keys) {
      if (k[ch] === undefined) continue;
      if (k.f <= frame) prev = k;
      else {
        next = k;
        break;
      }
    }
    if (!prev && !next) continue;
    // before a channel's first key, ease in from the rest pose at frame 0
    if (!prev) prev = { f: Math.min(0, next!.f), [ch]: DEFAULT_POSE[ch] } as Key;
    if (!next || next.ease === "hold") {
      out[ch] = prev[ch] as number;
      continue;
    }
    const t = (frame - prev.f) / (next.f - prev.f);
    const e = EASES[next.ease ?? "inOut"](Math.max(0, Math.min(1, t)));
    out[ch] = interpolate(e, [0, 1], [prev[ch] as number, next[ch] as number]);
  }
  return out;
};

// Damped spring step (semi-implicit Euler, dt = 1 frame).
type Spring = { x: number; v: number };
const step = (s: Spring, target: number, drive: number, k: number, c: number) => {
  s.v += (target - s.x) * k - s.v * c + drive;
  s.x += s.v;
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// Full pose with secondary motion. The springs are simulated from frame 0, so
// follow-through always reflects how the character actually moved.
export const animatedPose = (keys: Key[], frame: number): Pose => {
  const jig: Spring = { x: 0, v: 0 };
  const bend: Spring = { x: 0, v: 0 };
  const earL: Spring = { x: 0, v: 0 };
  const earR: Spring = { x: 0, v: 0 };
  const curlL: Spring = { x: 0, v: 0 };
  const curlR: Spring = { x: 0, v: 0 };
  const legs: Spring = { x: 0, v: 0 };
  let p0 = primaryPose(keys, -2);
  let p1 = primaryPose(keys, -1);
  let cur = p1;
  const end = Math.max(0, Math.floor(frame));
  for (let i = 0; i <= end; i++) {
    cur = primaryPose(keys, i);
    const vy = cur.y - p1.y;
    const ay = vy - (p1.y - p0.y);
    const vx = cur.x - p1.x;
    const ax = vx - (p1.x - p0.x);
    const dRot = cur.rot - p1.rot;
    const dArmL = cur.armL - p1.armL;
    const dArmR = cur.armR - p1.armR;
    const dSy = cur.sy - p1.sy;
    step(jig, 0, clamp(-ay * 0.0016 + dSy * 0.12, -0.05, 0.05), 0.24, 0.32);
    step(bend, cur.bend, -ax * 1.4 - dRot * 1.2, 0.16, 0.22);
    const earDrive = clamp(ay * 0.35 - dSy * 25, -8, 8);
    step(earL, 0, earDrive + dRot * 0.8 - ax * 0.2, 0.13, 0.17);
    step(earR, 0, earDrive - dRot * 0.8 - ax * 0.2, 0.13, 0.17);
    step(curlL, cur.curlL, clamp(dArmL * 0.014, -0.12, 0.12), 0.22, 0.26);
    step(curlR, cur.curlR, clamp(dArmR * 0.014, -0.12, 0.12), 0.22, 0.26);
    step(legs, 0, clamp(ay * 0.3 + ax * 0.3, -6, 6), 0.15, 0.2);
    p0 = p1;
    p1 = cur;
  }
  // stretch along fast vertical motion (smear-like), volume preserved
  const vy = cur.y - p0.y;
  const stretch = clamp(Math.abs(vy) * 0.0022, 0, 0.1);
  const j = clamp(jig.x, -0.16, 0.16);
  return {
    ...cur,
    sy: cur.sy * (1 + stretch) * (1 - j),
    sx: (cur.sx / Math.sqrt(1 + stretch)) * (1 + j),
    bend: bend.x,
    earL: clamp(earL.x, -35, 35),
    earR: clamp(earR.x, -35, 35),
    curlL: clamp(curlL.x, -0.9, 0.9),
    curlR: clamp(curlR.x, -0.9, 0.9),
    legSwing: clamp(legs.x, -18, 18),
    jiggle: j,
  };
};

// Helper: a natural blink (close fast, open a little slower) starting at frame f.
export const blinkAt = (f: number): Key[] => [
  { f: f - 1, blink: 0 },
  { f: f + 2, blink: 1, ease: "in" },
  { f: f + 3, blink: 1, ease: "hold" },
  { f: f + 7, blink: 0, ease: "out" },
];

export const sortKeys = (keys: Key[]) => [...keys].sort((a, b) => a.f - b.f);
