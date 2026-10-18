import type React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { SeriesTitle } from "../../brand/SeriesTitle";
import { alternate, rigBox, rigToScreen, tighten } from "../../final/kit";
import { BoumMonster, bendWeight } from "../../rig/BoumMonster";
import { animatedPose, type Key, type Pose, sortKeys } from "../../rig/pose";
import { scriptFont } from "../../theme";
import { Bubble, type Cam, camAt, clamp, lerp, PINK_GUM, PopBurst } from "../shared/stage";
import { CandyMountain, CandySky, CloudFriend, FishShape, FlowerFriend, GROUND, GroundChunk, Gumdrop, GumHouse, GumTree, HeartSun, Lollipop, RAVINE, RIVER, STONES } from "./CandyLand";

// "Les Aventures Boum Boum", Episode 8: "Le Pays sans couleurs" (44 s).
// One morning Boum Boum Land has lost its colours. Every time the pink monster
// helps someone (a drooping flower, a cloud stuck in a tree, a fish out of the
// syrup river) the colour comes back around them. At the ravine he is stuck and
// alone... until those he helped come to help him. His biggest BOUM brings the
// whole world back to colour.
// « Prends soin du monde… et le monde prendra soin de toi. »

const WIDTH = 380;
const SCALE = WIDTH / 400;
const HOUSE_X = 420;
const FLOWER_X = 1300;
const TREE_X = 2330;
const FISH_X = 2950;
const TOP_X = 4600; // across the ravine

// beats (30 fps)
const OUT = 58;
const SEE_FLOWER = 174;
const LIFT = 196;
const BLOOM = 222;
const SEE_CLOUD = 304;
const BLOW = 356;
const FREE = 392;
const SEE_FISH = 466;
const PICK = 480;
const TOSS = 498;
const SPLASH = 508;
const HOPS = [560, 574, 588];
const EDGE = 662;
const SIT = 700;
const HELP = 770;
const MOUNT = 800;
const RIDE = 812;
const LAND = 890;
const BIG_BLOW = 904;
export const BOUM = 966;
const MOUNT2 = 1086;
export const COLORS_END = 1240;

// the colour comes back in waves around each good deed
type Wave = { x: number; at: number; R: number; sp: number };
const WAVES: Wave[] = [
  { x: FLOWER_X, at: BLOOM, R: 560, sp: 22 },
  { x: 2250, at: FREE + 2, R: 600, sp: 24 },
  { x: 3170, at: SPLASH, R: 640, sp: 24 },
  { x: TOP_X, at: BOUM, R: 1e5, sp: 64 },
];
const litAt = (f: number, x: number) =>
  Math.max(0, ...WAVES.map((w) => Math.max(0, Math.min(1, (Math.min((f - w.at) * w.sp, w.R) - Math.abs(x - w.x)) / 160))));

// ---------------------------------------------------------------- where he is
const WAY: [number, number][] = [
  [0, HOUSE_X], [130, HOUSE_X], [170, 1090], [262, 1090], [300, 2060], [SEE_CLOUD + 116, 2060], [462, 2880], [PICK + 8, 2880], [494, 2960],
  [HOPS[0] + 4, 2960], [HOPS[0] + 14, STONES[0]], [HOPS[1] + 4, STONES[0]], [HOPS[1] + 14, STONES[1]], [HOPS[2] + 4, STONES[1]], [HOPS[2] + 14, 3400],
  [612, 3400], [EDGE - 2, 3850], [686, 3850], [694, 3770], [RIDE, 3770], [LAND, TOP_X],
];
const pinkX = (f: number) => interpolate(f, WAY.map((w) => w[0]), WAY.map((w) => w[1]), clamp);

const blend = (a: [number, number], b: [number, number], t: number, arc = 0): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(Math.PI * t) * arc];

const cloudAt = (f: number): [number, number] => {
  if (f < FREE) return [2250 + Math.sin(f / 5) * 6, 1010];
  if (f < 440) {
    const t = lerp(f, [FREE, 440], [0, 1], Easing.inOut(Easing.sin));
    return [2250 - 120 * t + Math.sin(t * Math.PI * 2) * 90, 1010 - 420 * t + Math.cos(t * Math.PI * 2) * 40 - 40];
  }
  if (f < MOUNT) return blend([3250, 980], [3770, 1440], lerp(f, [HELP - 4, MOUNT - 4], [0, 1]), -60);
  if (f < LAND) return blend([3770, 1440], [TOP_X, 1440], lerp(f, [RIDE, LAND], [0, 1], Easing.inOut(Easing.sin)), 240);
  if (f < MOUNT2 - 10) return blend([TOP_X, 1440], [4360, 1220], lerp(f, [LAND + 4, 930], [0, 1]), 0).map((v, i) => v + (i === 1 ? Math.sin(f / 9) * 10 : 0)) as [number, number];
  if (f < MOUNT2 + 6) return blend([4360, 1220], [TOP_X, 1440], lerp(f, [MOUNT2 - 10, MOUNT2], [0, 1]), 0);
  return [TOP_X, lerp(f, [MOUNT2 + 6, 1140], [1440, 1240]) + Math.sin(f / 10) * 10];
};
const showCloud = (f: number) => f < 446 || f >= HELP - 4;

// his feet: on the ground, or riding the cloud
const feetY = (f: number) => {
  if (f >= MOUNT && f < RIDE) return lerp(f, [MOUNT, RIDE], [GROUND, cloudAt(RIDE)[1] - 60]) - Math.sin(Math.PI * lerp(f, [MOUNT, RIDE], [0, 1])) * 60;
  if (f >= RIDE && f < LAND) return cloudAt(f)[1] - 60;
  if (f >= LAND && f < LAND + 8) return lerp(f, [LAND, LAND + 8], [cloudAt(LAND)[1] - 60, GROUND]);
  if (f >= MOUNT2 && f < MOUNT2 + 8) return lerp(f, [MOUNT2, MOUNT2 + 8], [GROUND, cloudAt(MOUNT2 + 8)[1] - 60]) - Math.sin(Math.PI * lerp(f, [MOUNT2, MOUNT2 + 8], [0, 1])) * 60;
  if (f >= MOUNT2 + 8) return cloudAt(f)[1] - 60;
  return GROUND;
};

// ---------------------------------------------------------------- the pink monster
const walk = (s: number, e: number): Key[] => [
  { f: s, run: 0, y: 0, turn: 0.35, lookX: 0.7 },
  { f: s + 3, run: 0.8 },
  ...alternate(s + 4, e - 4, 4, { y: -12, armL: 34, armR: 6 }, { y: 0, armL: 6, armR: 34 }),
  { f: e - 3, run: 0.8 },
  { f: e, run: 0, y: 0, armL: 20, armR: 20 },
];
const hopKeys = (s: number, h = 110): Key[] => [
  { f: s, y: 0, sy: 1 },
  { f: s + 3, sy: 0.86 },
  { f: s + 4, y: 0 },
  { f: s + 6, sy: 1.08, armL: 70, armR: 70, ease: "out" },
  { f: s + 9, y: -h, ease: "out" },
  { f: s + 14, y: 0, ease: "in" },
  { f: s + 15, sy: 0.84, ease: "snap" },
  { f: s + 19, sy: 1, armL: 20, armR: 20, ease: "out" },
];
const pucker = { cheeks: 1, mouthOpen: 0.3, mouthWidth: 0.28 };

const KEYS: Key[] = tighten(
  sortKeys([
    { f: 0, x: 0, y: 0, turn: 0, lookX: 0, lookY: 0, armL: 20, armR: 20, curlL: 0, curlR: 0, mouthOpen: 0.6, mouthWidth: 0.6, smile: 0.6, eyeScale: 1, browY: 0, browTilt: 0, sy: 1, rot: 0, bend: 0, squint: 0, cheeks: 0, legLift: 0, blink: 0, run: 0 },
    // good morning... a big stretch
    { f: OUT + 6, armL: 20, armR: 20, sy: 1 },
    { f: OUT + 14, armL: 150, armR: 150, sy: 1.08, squint: 1, mouthOpen: 1, mouthWidth: 0.5, ease: "out" },
    { f: OUT + 30, armL: 150, armR: 150, sy: 1.08 },
    { f: OUT + 38, armL: 20, armR: 20, sy: 1, squint: 0, mouthOpen: 0.6, mouthWidth: 0.6 },
    // ...where are the colours?
    { f: 104, turn: -0.4, lookX: -0.8 },
    { f: 114, turn: 0.4, lookX: 0.8 },
    { f: 124, turn: 0, lookX: 0, eyeScale: 1.15, browTilt: 16, smile: -0.2, mouthOpen: 0.3, mouthWidth: 0.5 },
    ...walk(130, 170),
    // a sad little flower
    { f: SEE_FLOWER, lookX: 0.8, lookY: 0.5, browTilt: 14, eyeScale: 1.1 },
    { f: 184, sy: 1, bend: 0, rot: 0 },
    { f: LIFT - 4, sy: 0.88, bend: 10, rot: 6, armL: -10, armR: -10, lookY: 0.7, ease: "out" },
    { f: LIFT + 18, armL: 40, armR: 40, lookY: 0.2, sy: 0.95, bend: 4, rot: 2, browTilt: 4, smile: 0.4, mouthOpen: 0.4 },
    ...alternate(LIFT + 20, BLOOM - 2, 4, { armR: 60 }, { armR: 44 }),
    { f: BLOOM, armL: 20, armR: 20, sy: 1, bend: 0, rot: 0, eyeScale: 1.1 },
    { f: BLOOM + 4, eyeScale: 1.3, browY: -14, browTilt: 0, mouthOpen: 0.8, mouthWidth: 0.5, smile: 0.6, ease: "snap" },
    { f: BLOOM + 14, squint: 1, mouthOpen: 0.9, mouthWidth: 1, smile: 1, cheeks: 0.6, eyeScale: 1, browY: 0 },
    ...hopKeys(BLOOM + 16, 90),
    { f: BLOOM + 34, armL: 150, armR: 150 },
    { f: 258, squint: 0, cheeks: 0, armL: 20, armR: 20, mouthOpen: 0.6, mouthWidth: 0.6 },
    ...walk(262, 300),
    // a cloud stuck in the tree
    { f: SEE_CLOUD, lookY: -0.8, lookX: 0.6, browTilt: 14, eyeScale: 1.1, smile: -0.2, mouthOpen: 0.3, mouthWidth: 0.5 },
    ...hopKeys(316, 150),
    { f: 320, armL: 150, armR: 150 },
    ...hopKeys(334, 150),
    { f: 338, armL: 150, armR: 150 },
    { f: 346, browTilt: 14, armL: 20, armR: 20 },
    { f: 350, eyeScale: 1.25, browY: -12, browTilt: 0, mouthOpen: 0.5, mouthWidth: 0.45, smile: 0.5, ease: "snap" },
    { f: BLOW, ...pucker, eyeScale: 1, browY: 0, lookY: -0.6, sy: 1.04 },
    { f: 374, ...pucker, sy: 1.08 },
    { f: 378, cheeks: 0, mouthOpen: 0.6, mouthWidth: 0.6, sy: 1, lookY: -0.9 },
    { f: FREE, eyeScale: 1.1, lookY: -1 },
    { f: FREE + 8, squint: 1, mouthOpen: 0.9, mouthWidth: 1, smile: 1, cheeks: 0.6, armL: 150, armR: 150 },
    ...alternate(FREE + 12, 414, 6, { armR: 150, curlR: -0.4 }, { armR: 120, curlR: 0.4 }),
    { f: 418, squint: 0, cheeks: 0, armL: 20, armR: 20, curlR: 0, lookY: 0, mouthOpen: 0.6, mouthWidth: 0.6 },
    ...walk(420, 462),
    // a fish out of the river
    { f: SEE_FISH, lookY: 0.7, lookX: 0.6, eyeScale: 1.2, browTilt: 14, smile: -0.3, mouthOpen: 0.5, mouthWidth: 0.45 },
    { f: PICK - 6, sy: 1, bend: 0, armL: 20, armR: 20 },
    { f: PICK, sy: 0.86, bend: 10, rot: 6, armL: -30, armR: -30, ease: "out" },
    { f: PICK + 6, sy: 1, bend: 0, rot: 0, armL: -46, armR: -46, lookY: 0.5, browTilt: 4, smile: 0.4 },
    { f: TOSS - 4, armL: -46, armR: -46, sy: 0.92 },
    { f: TOSS, armL: 100, armR: 100, sy: 1.06, lookY: 0, ease: "snap" },
    { f: SPLASH, armL: 20, armR: 20, sy: 1 },
    { f: SPLASH + 4, eyeScale: 1.25, browY: -10, mouthOpen: 0.7, browTilt: 0 },
    { f: 522, squint: 1, mouthOpen: 0.9, mouthWidth: 1, smile: 1, cheeks: 0.6, lookY: -0.5, eyeScale: 1, browY: 0 },
    { f: 552, squint: 0, cheeks: 0, lookY: 0 },
    // across the stepping stones
    ...HOPS.flatMap((s) => hopKeys(s, 100)),
    ...walk(612, EDGE - 2),
    // the end of the path
    { f: EDGE, eyeScale: 1.3, browY: -16, mouthOpen: 0.7, mouthWidth: 0.4, smile: -0.3, lookY: 0.8, ease: "snap" },
    ...alternate(EDGE + 2, 684, 5, { rot: 10, armL: 150, armR: 60 }, { rot: -6, armL: 60, armR: 150 }),
    { f: 690, rot: 0, armL: 20, armR: 20, eyeScale: 1.1, browY: 0 },
    { f: SIT - 6, sy: 1, y: 0, legLift: 0 },
    { f: SIT + 4, sy: 0.84, y: 18, legLift: 0.5, lookY: -0.1, lookX: 0.8, browTilt: 20, smile: -0.7, mouthOpen: 0.1, mouthWidth: 0.5, armL: -20, armR: -20, eyeScale: 1, ease: "out" },
    { f: 730, sy: 0.8, lookY: 0.5 },
    { f: 744, sy: 0.84 },
    { f: 760, sy: 0.82, lookY: 0.6 },
    // ...a friend comes back
    { f: HELP + 6, turn: 0.35, lookX: 0.7, eyeScale: 1 },
    { f: HELP + 12, turn: -0.4, lookX: -0.8, lookY: -0.4, eyeScale: 1.25, browTilt: 0, browY: -10, mouthOpen: 0.5, mouthWidth: 0.45, smile: 0.3, ease: "snap" },
    { f: 790, smile: 1, mouthOpen: 0.8, mouthWidth: 0.9, cheeks: 0.4, eyeScale: 1.1, browY: 0 },
    { f: MOUNT - 4, sy: 0.84, y: 18, legLift: 0.5 },
    { f: MOUNT, sy: 1, y: 0, legLift: 0, ease: "out" },
    { f: RIDE, turn: 0.35, lookX: 0.7, lookY: 0, armL: 150, armR: 150, squint: 1, mouthOpen: 0.9, mouthWidth: 1, smile: 1 },
    ...alternate(RIDE + 6, LAND - 10, 10, { armL: 160, armR: 140 }, { armL: 140, armR: 160 }),
    { f: LAND, armL: 20, armR: 20, squint: 0, cheeks: 0 },
    // his biggest BOUM, for the whole world
    { f: LAND + 8, lookY: -0.5, lookX: 0.6, turn: 0.25, browTilt: -10, mouthOpen: 0.4, mouthWidth: 0.6, smile: 0.6 },
    { f: BIG_BLOW, mouthOpen: 0.4 },
    { f: BIG_BLOW + 6, ...pucker, sy: 1.05, ease: "out" },
    { f: 950, sy: 1.1, squint: 0.5, armL: 40, armR: 40 },
    { f: BOUM - 2, sy: 1.12, squint: 0.6 },
    { f: BOUM, cheeks: 0, mouthOpen: 0.9, mouthWidth: 1, eyeScale: 1.3, squint: 0, sy: 0.9, browTilt: 0, ease: "snap" },
    { f: BOUM + 6, sy: 1, lookY: -1, armL: 150, armR: 150, ease: "out" },
    { f: 984, squint: 1, smile: 1, cheeks: 0.6, eyeScale: 1 },
    // he watches the colour run back over the world
    { f: 1000, squint: 0, armL: 20, armR: 20, turn: -0.4, lookX: -0.8, lookY: 0, eyeScale: 1.15, mouthOpen: 0.8, mouthWidth: 0.7 },
    { f: 1060, turn: -0.4, lookX: -0.8 },
    { f: 1074, turn: 0, lookX: 0, smile: 1, mouthOpen: 0.85, mouthWidth: 1, cheeks: 0.5 },
    { f: MOUNT2 + 10, armR: 20 },
    { f: 1104, armR: 140, squint: 1 },
    ...alternate(1108, 1228, 8, { armR: 150, curlR: -0.4 }, { armR: 115, curlR: 0.4 }),
    { f: COLORS_END, squint: 1 },
  ]),
);
const poseCache = new Map<number, Pose>();
const P = (f: number) => {
  let p = poseCache.get(f);
  if (!p) {
    p = animatedPose(KEYS, f, true);
    poseCache.set(f, p);
  }
  return p;
};
const anchorAt = (f: number): [number, number] => [pinkX(f), feetY(f)];
const toWorld = (f: number, rx: number, ry: number) => rigToScreen(P(f), anchorAt(f), SCALE, rx, ry);
const mouthAt = (f: number) => {
  const p = P(f);
  return toWorld(f, 200 + p.turn * 105 + p.bend * bendWeight(230), 296);
};

// ---------------------------------------------------------------- props
const fishAt = (f: number): { p: [number, number]; rot: number; show: boolean } => {
  if (f < PICK + 2) return { p: [FISH_X, GROUND - 26 - Math.abs(Math.sin(f / 3)) * 20], rot: Math.sin(f / 3) * 30, show: true };
  if (f < TOSS) return { p: [0, 0], rot: 0, show: false };
  if (f < SPLASH) {
    const hand = toWorld(TOSS, 200, 300);
    return { p: blend(hand, [3150, GROUND + 50], lerp(f, [TOSS, SPLASH], [0, 1], Easing.linear), 120), rot: lerp(f, [TOSS, SPLASH], [-20, 70]), show: true };
  }
  if (f >= 520 && f < 544) return { p: blend([3110, GROUND + 50], [3250, GROUND + 50], lerp(f, [520, 544], [0, 1], Easing.linear), 260), rot: lerp(f, [520, 544], [-50, 50]), show: true };
  if (f >= 776 && f < 798) return { p: blend([3240, GROUND + 50], [3330, GROUND + 50], lerp(f, [776, 798], [0, 1], Easing.linear), 300), rot: lerp(f, [776, 798], [-50, 50]), show: true };
  return { p: [0, 0], rot: 0, show: false };
};
const helpBubbleR = (f: number) => (f >= BLOW + 2 && f < FREE ? lerp(f, [BLOW + 2, 374], [0, 70]) : 0);
const helpBubbleAt = (f: number): [number, number] => {
  const m = mouthAt(Math.min(f, 376));
  const start: [number, number] = [m[0] + 60, m[1] - 20];
  if (f < 376) return [m[0] + helpBubbleR(f) * 0.9, m[1] - helpBubbleR(f) * 0.3];
  return blend(start, [2250, 1080], lerp(f, [376, FREE], [0, 1], Easing.inOut(Easing.sin)), 30);
};
const bigR = (f: number) => (f >= BIG_BLOW + 4 && f < BOUM ? lerp(f, [BIG_BLOW + 4, BOUM - 4], [0, 250], Easing.inOut(Easing.quad)) : 0);

// ---------------------------------------------------------------- the world
// the ground is cut in slices so that each one can get its colour back on its own
const STOPS = [...new Set([...Array.from({ length: 21 }, (_, i) => -1400 + i * 400), ...RIVER, ...RAVINE])]
  .filter((x) => !((x > RIVER[0] && x < RIVER[1]) || (x > RAVINE[0] && x < RAVINE[1])))
  .sort((a, b) => a - b);
const PIECES: [number, number][] = STOPS.slice(0, -1).map((a, i) => [a, STOPS[i + 1]]);

type Deco = { x: number; kind: "pop" | "drop"; h?: number; r?: number; s?: number; color: string };
const DECOS: Deco[] = [
  { x: -200, kind: "pop", h: 260, r: 70, color: "#7FD3FF" },
  { x: 80, kind: "drop", s: 1, color: "#FFE066" },
  { x: 760, kind: "pop", h: 220, r: 60, color: "#FF6F91" },
  { x: 900, kind: "drop", s: 0.8, color: "#7FD3FF" },
  { x: 1620, kind: "pop", h: 300, r: 80, color: "#B48CFF" },
  { x: 1760, kind: "drop", s: 1.1, color: "#FF8FC6" },
  { x: 1900, kind: "pop", h: 200, r: 55, color: "#FFE066" },
  { x: 2620, kind: "pop", h: 260, r: 70, color: "#FF6F91" },
  { x: 2760, kind: "drop", s: 0.9, color: "#7BD06A" },
  { x: 3520, kind: "drop", s: 1, color: "#FFE066" },
  { x: 3640, kind: "pop", h: 240, r: 64, color: "#7FD3FF" },
  { x: 4520, kind: "drop", s: 0.9, color: "#FF8FC6" },
  { x: 4800, kind: "pop", h: 280, r: 74, color: "#FFE066" },
  { x: 5000, kind: "drop", s: 1.2, color: "#7FD3FF" },
  { x: 5200, kind: "pop", h: 220, r: 60, color: "#FF6F91" },
];

// Everything that loses its colour, drawn once in colour and once in grey.
const Land: React.FC<{ f: number }> = ({ f }) => {
  const [cx, cy] = cloudAt(f);
  const fish = fishAt(f);
  return (
    <>
      <HeartSun x={4950} y={lerp(f, [BOUM + 4, BOUM + 70], [920, 620], Easing.out(Easing.cubic))} awake={lerp(f, [BOUM + 10, BOUM + 30], [0, 1])} />
      <CandyMountain x={5000} />
      {PIECES.map(([a, b]) => (
        <GroundChunk key={a} x0={a} x1={b} />
      ))}
      {DECOS.map((d) => (d.kind === "pop" ? <Lollipop key={d.x} x={d.x} h={d.h ?? 240} r={d.r ?? 60} color={d.color} sway={Math.sin(f / 20 + d.x) * 2} /> : <Gumdrop key={d.x} x={d.x} s={d.s ?? 1} color={d.color} />))}
      <GumHouse x={HOUSE_X} door={lerp(f, [36, 50], [0, 1])} />
      <GumTree x={TREE_X} />
      {STONES.map((x) => (
        <Gumdrop key={x} x={x} s={0.55} color={x === STONES[0] ? "#FFE066" : "#7FD3FF"} />
      ))}
      <FlowerFriend x={FLOWER_X} droop={lerp(f, [LIFT, LIFT + 18], [1, 0], Easing.out(Easing.back(1.4)))} happy={f >= BLOOM ? 1 : 0} f={f} />
      {/* before they are helped, the cloud and the fish are grey too */}
      {f < FREE ? <CloudFriend x={cx} y={cy} happy={0} f={f} /> : null}
      {fish.show && f < SPLASH ? <FishSprite x={fish.p[0]} y={fish.p[1]} rot={fish.rot} happy={0} /> : null}
    </>
  );
};

const FishSprite: React.FC<{ x: number; y: number; rot: number; happy: number }> = ({ x, y, rot, happy }) => (
  <svg style={{ position: "absolute", left: x - 80, top: y - 80, width: 160, height: 160, overflow: "visible" }} viewBox="-80 -80 160 160">
    <g transform={`rotate(${rot})`}>
      <FishShape happy={happy} />
    </g>
  </svg>
);

// The grey copy is masked by how much colour each x has got back.
const X0 = -1400;
const XW = 8000;
const greyMask = (f: number) => {
  const stops: string[] = [];
  for (let x = X0; x <= X0 + XW; x += 60) stops.push(`rgba(0,0,0,${(1 - litAt(f, x)).toFixed(3)}) ${(((x - X0) / XW) * 100).toFixed(2)}%`);
  return `linear-gradient(to right, ${stops.join(", ")})`;
};

const World: React.FC<{ f: number }> = ({ f }) => {
  const pose = P(f);
  const [px, py] = anchorAt(f);
  const [cx, cy] = cloudAt(f);
  const fish = fishAt(f);
  const riding = f >= RIDE && f < LAND;
  const held =
    f >= PICK + 2 && f < TOSS ? (
      <g transform="translate(200 392) scale(1.1)">
        <FishShape happy={0} />
      </g>
    ) : null;
  const hb = helpBubbleR(f);
  const [hx, hy] = helpBubbleAt(f);
  const br = bigR(f);
  const m = mouthAt(Math.min(f, BOUM));
  const allLit = f > BOUM + 110;
  const mask = allLit ? "" : greyMask(f);
  const pink = <BoumMonster pose={pose} held={held} style={rigBox([px, py], WIDTH)} />;
  const cloud =
    f >= FREE && showCloud(f) ? (
      <div style={{ opacity: f < 446 ? lerp(f, [430, 446], [1, 0]) : lerp(f, [HELP - 4, HELP + 6], [0, 1]) }}>
        <CloudFriend x={cx} y={cy} happy={1} f={f} s={f >= HELP ? 1.2 : 1} />
      </div>
    ) : null;

  return (
    <>
      <Land f={f} />
      {allLit ? null : (
        <div style={{ position: "absolute", left: X0, top: -4000, width: XW, height: 9000, maskImage: mask, WebkitMaskImage: mask }}>
          <div style={{ position: "absolute", left: -X0, top: 4000, filter: "grayscale(1) brightness(0.92) contrast(0.85)" }}>
            <Land f={f} />
          </div>
        </div>
      )}
      {fish.show && f >= SPLASH ? <FishSprite x={fish.p[0]} y={fish.p[1]} rot={fish.rot} happy={1} /> : null}
      {/* the little bubble that frees the cloud */}
      {hb > 1 || (f >= 376 && f < FREE) ? <Bubble id="help" x={hx} y={hy} r={Math.max(hb, f >= 376 ? 70 : 0)} tone={PINK_GUM} /> : null}
      <PopBurst f={f} at={FREE} x={2250} y={1060} r={70} tones={PINK_GUM} n={10} />
      {/* he stands in front of the cloud... except when he rides it */}
      {riding || f >= MOUNT2 + 6 ? (
        <>
          {pink}
          {cloud}
        </>
      ) : (
        <>
          {cloud}
          {pink}
        </>
      )}
      <PopBurst f={f} at={SPLASH} x={3150} y={GROUND + 40} r={50} tones={["#FF5C8A", "#FFB3C8", "#FFFFFF"]} n={10} />
      <PopBurst f={f} at={544} x={3250} y={GROUND + 40} r={40} tones={["#FF5C8A", "#FFB3C8", "#FFFFFF"]} n={8} />
      {/* his biggest bubble */}
      {br > 1 ? <Bubble id="big" x={m[0] + br * 0.95} y={m[1] - br * 0.3} r={br} tone={PINK_GUM} opacity={0.75} wob={Math.sin(f * 0.7) * 0.02} /> : null}
      <PopBurst f={f} at={BOUM} x={m[0] + 240} y={m[1] - 75} r={250} tones={[...PINK_GUM, "#FFE066", "#7FD3FF"]} n={16} />
      {/* the colour waves */}
      {WAVES.map((w, i) => {
        const r = (f - w.at) * w.sp;
        const life = i === 3 ? 90 : 26;
        if (f < w.at || f > w.at + life) return null;
        const o = interpolate(f, [w.at, w.at + 4, w.at + life], [0, 0.9, 0], clamp);
        return <div key={i} style={{ position: "absolute", left: w.x - r, top: GROUND - 200 - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `${i === 3 ? 40 : 18}px solid rgba(255,255,255,0.8)`, boxShadow: "0 0 60px 20px rgba(255,220,240,0.6)", opacity: o }} />;
      })}
    </>
  );
};

// ---------------------------------------------------------------- camera
// keeps the ground line at the same height on screen whatever the zoom
const at = (f: number, cx: number, z: number, ground = 1330): Cam => [f, cx, GROUND - (ground - 960) / z, z];
const MAIN: Cam[] = [
  at(0, 760, 0.62, 1250), // a grey world
  at(40, 600, 0.8),
  at(126, 600, 0.85),
  at(176, 1240, 0.9),
  at(256, 1240, 0.9),
  at(300, 2160, 0.78, 1380), // the cloud in the tree
  at(420, 2160, 0.78, 1380),
  at(464, 2990, 0.86), // the fish
  at(552, 3120, 0.8),
  at(604, 3360, 0.86),
  at(EDGE, 3880, 0.86), // the ravine
  at(SIT + 10, 3860, 1.0),
  at(HELP - 6, 3860, 1.0),
  at(HELP + 20, 3700, 0.78), // a friend comes back
  at(RIDE + 6, 3800, 0.74, 1380),
  at(LAND, 4500, 0.78),
  at(BIG_BLOW + 4, 4700, 0.92),
  at(BOUM, 4700, 0.92),
  at(BOUM + 14, 4600, 0.7),
  at(1052, 2900, 0.3, 1430), // the whole world, in colour
  at(1066, 2900, 0.3, 1430),
  at(1110, 4600, 0.8, 1430),
  at(COLORS_END, 4600, 0.86, 1430),
];

const Caption: React.FC<{ f: number; from: number; to: number; text: string }> = ({ f, from, to, text }) => {
  const o = interpolate(f, [from, from + 10, to - 10, to], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1600, textAlign: "center", opacity: o, translate: `0px ${(1 - o) * 20}px` }}>
      <span style={{ display: "inline-block", padding: "18px 40px", borderRadius: 40, background: "rgba(60,30,70,0.5)", fontFamily: scriptFont, fontSize: 62, color: "#FFF3C4", textShadow: "0 3px 0 rgba(0,0,0,0.35)", lineHeight: 1.2 }}>{text}</span>
    </div>
  );
};

// floating petals the flower sends, when he needs help
const Petals: React.FC<{ f: number }> = ({ f }) =>
  f < HELP || f > LAND + 20 ? null : (
    <>
      {Array.from({ length: 18 }, (_, i) => {
        const t = (f - HELP - i * 4) / 70;
        if (t < 0 || t > 1) return null;
        return <div key={i} style={{ position: "absolute", left: -60 + t * 1250, top: 300 + ((i * 263) % 900) + Math.sin(t * 8 + i) * 60, width: 34, height: 22, borderRadius: "50%", background: i % 2 ? "#FF8FC6" : "#FFB3DA", rotate: `${t * 400 + i * 40}deg`, opacity: Math.sin(Math.PI * t) }} />;
      })}
    </>
  );

export const ColorsScene: React.FC = () => {
  const f = useCurrentFrame();
  const { cx, cy, z } = camAt(MAIN, f);
  const sad = lerp(f, [SIT, 720, HELP, HELP + 14], [0, 0.35, 0.35, 0]);

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#C4C6CE" }}>
      <CandySky lit={litAt(f, cx)} />
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${540 - cx * z}px, ${960 - cy * z}px) scale(${z})` }}>
        <World f={f} />
      </div>
      <Petals f={f} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 35%, rgba(30,20,50,0.7) 100%)", opacity: sad }} />
      <AbsoluteFill style={{ background: "white", opacity: interpolate(f, [BOUM, BOUM + 2, BOUM + 10], [0, 0.6, 0], clamp) }} />

      <SeriesTitle episode={8} title="Le Pays sans couleurs" titleColor="#FF8FC6" outAt={56} />
      <Caption f={f} from={64} to={160} text="Un matin, le Pays de Boum Boum avait perdu ses couleurs." />
      <Caption f={f} from={178} to={232} text="Une petite fleur était toute triste…" />
      <Caption f={f} from={236} to={300} text="Un petit geste… et la couleur revint !" />
      <Caption f={f} from={424} to={512} text="Alors il aida tous ceux qu'il croisait." />
      <Caption f={f} from={668} to={768} text="Mais le chemin s'arrêtait là…" />
      <Caption f={f} from={776} to={888} text="…alors ceux qu'il avait aidés vinrent l'aider à leur tour." />
      <Caption f={f} from={1076} to={1158} text="Prends soin du monde…" />
      <Caption f={f} from={1162} to={COLORS_END + 6} text="…et le monde prendra soin de toi." />
    </AbsoluteFill>
  );
};
