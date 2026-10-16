import type React from "react";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { SeriesTitle } from "../../brand/SeriesTitle";
import { alternate, hop, offset, rigBox, tighten } from "../../final/kit";
import { BoumMonster } from "../../rig/BoumMonster";
import { coolBlink, M_YO, MELO_COOL } from "../../rig/meloKeys";
import { blinkAt, type Key, type Pose, sortKeys } from "../../rig/pose";
import { GumPiece, Starburst } from "../../story/Props";
import { candyText, colors, displayFont } from "../../theme";
import { DustPuff } from "../ep2/CitySet";
import { DaySky, DaySkyline, GROUND, Park, Scoreboard } from "./ParkSet";
import { Bubble, type Cam, camAt, clamp, lerp, makeDuo, MELO_GUM, PINK_GUM, Pop, PopBurst, Say } from "../shared/stage";

// "Les Aventures Boum Boum", Episode 3: "Le Duel de Bulles".
// Everything is in WORLD coordinates; a keyed virtual camera frames each beat,
// and the two rounds are shown as a split screen (two cameras on the same world).

const WIDTH = 440;
const SCALE = WIDTH / 400;
const PINK_AT: [number, number] = [380, GROUND];
const MELO_AT: [number, number] = [1000, GROUND];
const XP = (worldX: number) => (worldX - PINK_AT[0]) / SCALE;
const XM = (worldX: number) => (worldX - MELO_AT[0]) / SCALE;
const BOARD_X = 690;
const BOARD_Y = 720;

// beats (30 fps)
const PROUD = 140;
const PROUD_POP = 170;
const YO = 185;
const DEFI = 224;
const BOARD = 236;
const PACKS = 268;
const CHOMP = 312;
const R1_CARD = 330;
const SPLIT1 = [345, 445];
const P_POP1 = 412;
const SCORE1 = 452;
const R2_CARD = 466;
const LIFT = 515;
const P_POP2 = 548;
const LAND2 = 560;
const DOUBLE = 568;
const SCORE2 = 606;
const SAD = 614;
const OFFER = 660;
const SWAP = 678;
const CHOMP2 = 690;
const BLOW = 698;
const RISE = 740;
export const BOUM = 772;
const LAND3 = 786;
const TEAM = 792;
export const DUEL_END = 818;


// ---------------------------------------------------------------- Pink
const PINK_KEYS: Key[] = tighten(sortKeys([
  { f: 0, x: XP(-300), y: 0, turn: 0.15, lookX: 0.4, armL: 20, armR: 20 },
  ...hop(80, XP(-300), XP(-70), 110),
  ...hop(99, XP(-70), XP(160), 110),
  ...hop(118, XP(160), XP(380), 110),
  // proud little bubble
  { f: 137, turn: 0.15, lookX: 0.4, cheeks: 0, mouthOpen: 0.85, browTilt: 0 },
  { f: PROUD, turn: 0, lookX: 0, cheeks: 0.9, mouthOpen: 0.3, mouthWidth: 0.28, browTilt: -8, sy: 1.04, ease: "out" },
  { f: PROUD_POP - 1, sy: 1.06, cheeks: 1, mouthOpen: 0.3, browTilt: -8 },
  { f: PROUD_POP, eyeScale: 1.2, cheeks: 0, mouthOpen: 0.9, mouthWidth: 1, browTilt: 0, browY: -14, sy: 0.92, ease: "snap" },
  { f: PROUD_POP + 4, eyeScale: 1, squint: 1, sy: 1, armL: 60, armR: 60, ease: "out" },
  { f: 182, squint: 1, armL: 60, armR: 60 },
  // "Yo." ... he turns to Mélo
  { f: 192, squint: 0, browY: 0, turn: 0.35, lookX: 0.8, armL: 8, armR: 8, mouthOpen: 0.5, mouthWidth: 0.7 },
  { f: 200, eyeScale: 1.1 },
  { f: 214, eyeScale: 1, sy: 1 },
  // the challenge: anticipation, then he points at Mélo
  { f: DEFI - 6, sy: 0.92, y: 0, armR: -20, browTilt: -10, rot: -2, bend: -6 },
  { f: DEFI, sy: 1.04, armR: 55, curlR: -0.2, browTilt: -16, browY: 6, mouthOpen: 0.3, mouthWidth: 0.6, smile: 0.5, rot: 4, bend: 10, ease: "snap" },
  { f: DEFI + 5, sy: 1, ease: "out" },
  { f: 254, armR: 55, rot: 4, bend: 10, ease: "hold" },
  { f: 262, armR: 8, curlR: 0, rot: 0, bend: 0, mouthOpen: 0.85, mouthWidth: 1, smile: 1, browTilt: -8, browY: 2 },
  // pack out, gum in
  { f: PACKS, armL: 8, armR: 8 },
  { f: PACKS + 8, armL: -46, armR: -46, lookY: 0.4, ease: "out" },
  { f: 296, armL: -46, armR: -46, lookY: 0.4 },
  { f: 304, lookY: -0.2, mouthOpen: 1, mouthWidth: 0.7, armL: 8, armR: 8 },
  { f: CHOMP, mouthOpen: 0, mouthWidth: 0.55, sy: 0.86, squint: 1, lookY: 0, ease: "snap" },
  { f: CHOMP + 4, sy: 1, ease: "out" },
  ...alternate(CHOMP + 4, 338, 5, { mouthOpen: 0.08, cheeks: 1 }, { mouthOpen: 0.28, cheeks: 0.55 }),
  // ROUND 1: he strains... and it pops on his face
  { f: 344, squint: 0, turn: 0, lookX: 0, cheeks: 1, mouthOpen: 0.3, mouthWidth: 0.28, browTilt: -14, browY: 4, sy: 1.04 },
  { f: 380, eyeScale: 1, squint: 0 },
  { f: 404, eyeScale: 1.15, squint: 0.35, sy: 1.08, browTilt: -18 },
  ...alternate(384, P_POP1 - 2, 2, { x: 1.5 }, { x: -1.5 }).map((k) => ({ ...k, ease: "linear" as const })),
  { f: P_POP1 - 1, x: 0, eyeScale: 1.15, sy: 1.08 },
  { f: P_POP1, x: 0, eyeScale: 1.3, squint: 0, sy: 0.86, cheeks: 0, browY: -18, browTilt: 0, mouthOpen: 0.45, mouthWidth: 0.5, smile: -0.4, ease: "snap" },
  { f: P_POP1 + 5, sy: 1, eyeScale: 1.05, ease: "out" },
  ...blinkAt(424),
  ...blinkAt(434),
  // wipes his face
  { f: 440, armR: 8, browTilt: 14, browY: 0, smile: -0.4 },
  { f: 446, armR: -92, curlR: 0.3, squint: 1, ease: "out" },
  { f: 450, armR: -92 },
  { f: 455, armR: 40, curlR: -0.3, squint: 0, eyeScale: 1, mouthOpen: 0.3, mouthWidth: 0.6, smile: -0.2, ease: "out" },
  { f: 462, armR: 8, curlR: 0, browTilt: 8 },
  // ROUND 2: the trick bubble lifts him off the ground
  { f: 480, browTilt: 8, mouthOpen: 0.3, mouthWidth: 0.6, smile: -0.2, cheeks: 0, sy: 1, y: 0 },
  { f: 486, browTilt: -16, browY: 6, cheeks: 1, mouthOpen: 0.3, mouthWidth: 0.28, smile: 0.5, sy: 1.04 },
  { f: LIFT - 2, y: 0, legLift: 0, armL: 8, armR: 8, eyeScale: 1, lookY: 0 },
  { f: LIFT + 8, legLift: 0.6, armL: 150, armR: 150, eyeScale: 1.25, browTilt: 14, browY: -12, lookY: 0.6, ease: "out" },
  { f: P_POP2 - 2, y: -300, ease: "inOut" },
  ...alternate(LIFT + 8, P_POP2 - 2, 4, { armL: 150, armR: 120 }, { armL: 120, armR: 150 }),
  { f: P_POP2, eyeScale: 1.45, pupil: 0.5, browY: -28, browTilt: 0, cheeks: 0, mouthOpen: 0.95, mouthWidth: 0.42, smile: 1, lookY: 0, armL: 160, armR: 160, ease: "snap" },
  { f: P_POP2 + 2, y: -310, ease: "out" },
  { f: LAND2, y: 0, ease: "in" },
  { f: LAND2 + 1, sy: 0.72, legLift: 0, legSpread: 0.6, ease: "snap" },
  { f: LAND2 + 7, sy: 1.05, legSpread: 0, eyeScale: 1, pupil: 0.8, armL: 30, armR: 30, mouthOpen: 0.4, mouthWidth: 0.55, browY: -4, ease: "out" },
  { f: LAND2 + 12, sy: 1 },
  ...alternate(LAND2 + 8, 584, 6, { lookX: 0.6, rot: 3 }, { lookX: -0.6, rot: -3 }),
  { f: 590, lookX: 0.7, rot: 0, turn: 0.3, pupil: 1 },
  // sad: sits down
  { f: SAD - 2, sy: 1, y: 0, legLift: 0, armL: 30, armR: 30, browTilt: 0, smile: 0.5 },
  { f: SAD + 8, sy: 0.84, y: 18, legLift: 0.5, armL: -30, armR: -30, browTilt: 20, browY: 0, smile: -1, mouthOpen: 0, mouthWidth: 0.6, lookY: 0.5, lookX: 0, turn: 0.1, ease: "out" },
  ...blinkAt(640),
  // Mélo offers a gum: he looks up, smiles, and offers one back
  { f: OFFER + 4, lookY: 0.5, lookX: 0, turn: 0.1, eyeScale: 1 },
  { f: OFFER + 10, lookY: -0.1, lookX: 0.6, turn: 0.3, eyeScale: 1.12, browTilt: 8, ease: "out" },
  { f: OFFER + 16, smile: -1, mouthOpen: 0 },
  { f: OFFER + 20, smile: 1, mouthOpen: 0.85, mouthWidth: 1, browTilt: 0, browY: -8, sy: 0.84, y: 18, legLift: 0.5, eyeScale: 1 },
  { f: SWAP - 4, sy: 1, y: 0, legLift: 0, armR: 8, armL: -30 },
  { f: SWAP, armR: 40, armL: 8, ease: "out" },
  { f: SWAP + 8, armR: 40 },
  { f: CHOMP2 - 4, armR: 8, mouthOpen: 1, mouthWidth: 0.7 },
  { f: CHOMP2, mouthOpen: 0, mouthWidth: 0.55, sy: 0.86, squint: 1, ease: "snap" },
  { f: CHOMP2 + 4, sy: 1, ease: "out" },
  // together: one giant bubble
  { f: BLOW - 2, squint: 0, cheeks: 0, mouthOpen: 0.3, turn: 0.3, lookX: 0.6, lookY: 0 },
  { f: BLOW + 4, cheeks: 1, mouthOpen: 0.3, mouthWidth: 0.28, lookY: -0.6, lookX: 0.4, sy: 1.05, ease: "out" },
  { f: RISE - 2, y: 0, legLift: 0, armL: 8, armR: 8, eyeScale: 1 },
  { f: RISE + 10, armL: 140, armR: 140, legLift: 0.35, eyeScale: 1.2, browY: -12, ease: "out" },
  { f: BOUM - 1, y: -330, ease: "inOut" },
  { f: BOUM, eyeScale: 1.4, browY: -26, cheeks: 0, mouthOpen: 0.95, mouthWidth: 0.45, lookY: 0, ease: "snap" },
  { f: BOUM + 2, y: -340, ease: "out" },
  { f: LAND3, y: 0, ease: "in" },
  { f: LAND3 + 1, sy: 0.74, legLift: 0, legSpread: 0.5, ease: "snap" },
  // laughing together
  { f: LAND3 + 6, sy: 1, legSpread: 0, eyeScale: 1, squint: 1, mouthOpen: 1, mouthWidth: 1, smile: 1, browY: -10, armL: 60, armR: 60, turn: 0.2, lookX: 0.4, ease: "out" },
  ...alternate(LAND3 + 8, DUEL_END, 4, { y: -12, sy: 1.02 }, { y: 0, sy: 0.97 }),
]));

// ---------------------------------------------------------------- Mélo
const COOL: Key = { f: 0, ...MELO_COOL };
const MELO_KEYS: Key[] = tighten(sortKeys([
  { ...COOL, x: 0, y: 0, rot: 7, bend: 6, turn: -0.12, lookX: -0.3, armL: -30, curlL: 1.6, armR: 8, eyeScale: 1, squint: 0 },
  ...alternate(6, 180, 12, { sy: 0.98, browY: 4 }, { sy: 1, browY: 2 }),
  ...coolBlink(120),
  // "Yo." (pushes off the tree)
  ...offset(M_YO.slice(1), YO),
  { f: YO + 10, armL: -30, curlL: 1.6 },
  { f: YO + 40, armL: 8, curlL: 0 },
  // accepts the challenge with a smirk
  { f: 250, turn: -0.12, lookX: -0.3 },
  { f: 256, turn: -0.25, lookX: -0.6, browTilt: -10, browY: 4, smile: 0.8, mouthOpen: 0, mouthWidth: 0.7, blink: 0.35, ease: "out" },
  { f: 262, sy: 0.97, lookY: 0.15 },
  { f: 267, sy: 1, lookY: 0 },
  // pack out, gum in
  { f: PACKS + 2, armL: 8, armR: 8 },
  { f: PACKS + 10, armL: -46, armR: -46, lookY: 0.4, ease: "out" },
  { f: 298, armL: -46, armR: -46, lookY: 0.4 },
  { f: 306, lookY: -0.2, armL: 8, armR: 8, mouthOpen: 0.6, mouthWidth: 0.6, smile: 0.6 },
  { f: CHOMP + 2, mouthOpen: 0, mouthWidth: 0.55, sy: 0.92, lookY: 0, ease: "snap" },
  { f: CHOMP + 6, sy: 1, ease: "out" },
  ...alternate(CHOMP + 6, 340, 8, { mouthOpen: 0.08, cheeks: 0.4 }, { mouthOpen: 0.22, cheeks: 0.2 }),
  // ROUND 1: the perfect bubble, then a shrug
  { f: 350, turn: -0.25, lookX: -0.6, browTilt: -10, smile: 0.8 },
  { f: 356, turn: 0, lookX: 0, browTilt: 0, browY: 2, mouthOpen: 0.3, mouthWidth: 0.28, smile: 0.5, cheeks: 0.7, blink: 0.35, ease: "out" },
  { f: 418, armL: 8, armR: 8, browY: 2, sy: 1 },
  { f: 426, armL: 62, armR: 62, curlL: -0.6, curlR: -0.6, browY: -10, sy: 1.04, y: -6, ease: "out" },
  { f: 438, armL: 62, armR: 62, ease: "hold" },
  { f: 446, armL: 8, armR: 8, curlL: 0, curlR: 0, sy: 1, y: 0, cheeks: 0, ...MELO_COOL },
  { f: SCORE1 + 2, turn: 0, lookX: 0 },
  { f: SCORE1 + 8, turn: -0.2, lookX: -0.6, browTilt: -10, smile: 0.8, mouthOpen: 0, ease: "out" },
  ...coolBlink(500),
  // ROUND 2: a bubble inside a bubble
  { f: DOUBLE - 6, turn: -0.2, lookX: -0.6, browTilt: -10, smile: 0.8, cheeks: 0 },
  { f: DOUBLE, turn: 0, lookX: 0, browTilt: 0, mouthOpen: 0.3, mouthWidth: 0.28, smile: 0.5, cheeks: 0.7, blink: 0.35, ease: "out" },
  { f: 598, browY: 2 },
  { f: 602, browY: -8, browTilt: -10, ease: "out" },
  { f: SCORE2 + 2, cheeks: 0.7, mouthOpen: 0.3 },
  { f: SCORE2 + 8, cheeks: 0, ...MELO_COOL, browTilt: -10, smile: 0.8, mouthOpen: 0 },
  // ...but he sees his friend is sad
  { f: SAD + 6, turn: 0, lookX: 0, browTilt: -10, smile: 0.8 },
  { f: SAD + 14, turn: -0.25, lookX: -0.7, browTilt: 12, browY: 0, smile: 0, mouthOpen: 0, mouthWidth: 0.6, blink: 0.1, ease: "out" },
  ...hop(624, 0, XM(880), 60),
  ...hop(642, XM(880), XM(770), 60),
  { f: 662, turn: -0.3, lookX: -0.7, armL: 20, armR: 20 },
  // "Ensemble ?" ... offers a gum
  { f: OFFER + 6, armL: 42, curlL: -0.3, smile: 0.7, mouthOpen: 0.4, mouthWidth: 0.7, browTilt: 0, browY: -4, blink: 0.2, ease: "out" },
  { f: SWAP + 2, armL: 42 },
  { f: SWAP + 10, armL: 8, curlL: 0 },
  { f: CHOMP2 - 2, mouthOpen: 0.6, mouthWidth: 0.6 },
  { f: CHOMP2 + 2, mouthOpen: 0, mouthWidth: 0.55, sy: 0.9, ease: "snap" },
  { f: CHOMP2 + 6, sy: 1, ease: "out" },
  // together
  { f: BLOW, cheeks: 0, mouthOpen: 0.3, turn: -0.3, lookX: -0.6 },
  { f: BLOW + 6, cheeks: 0.9, mouthOpen: 0.3, mouthWidth: 0.28, smile: 0.5, lookY: -0.6, lookX: -0.4, blink: 0.25, sy: 1.04, ease: "out" },
  { f: RISE - 2, y: 0, legLift: 0, armL: 8, armR: 8, eyeScale: 1 },
  { f: RISE + 10, armL: 140, armR: 140, legLift: 0.35, ease: "out" },
  { f: 756, blink: 0.25, eyeScale: 1 },
  // even Mélo is impressed
  { f: 762, blink: 0, eyeScale: 1.2, browY: -10, ease: "out" },
  { f: BOUM - 1, y: -330, ease: "inOut" },
  { f: BOUM, eyeScale: 1.4, browY: -26, cheeks: 0, mouthOpen: 0.95, mouthWidth: 0.45, smile: 1, lookY: 0, ease: "snap" },
  { f: BOUM + 2, y: -340, ease: "out" },
  { f: LAND3, y: 0, ease: "in" },
  { f: LAND3 + 1, sy: 0.76, legLift: 0, legSpread: 0.5, ease: "snap" },
  // ...and for the first time, he really laughs
  { f: LAND3 + 6, sy: 1, legSpread: 0, eyeScale: 1, squint: 1, blink: 0, mouthOpen: 1, mouthWidth: 1, smile: 1, browY: -10, armL: 60, armR: 60, turn: -0.2, lookX: -0.4, ease: "out" },
  ...alternate(LAND3 + 10, DUEL_END, 4, { y: -10, sy: 1.02 }, { y: 0, sy: 0.97 }),
]));

// ---------------------------------------------------------------- rig helpers
const { poseOf, toWorld, mouthOf, handOf } = makeDuo({ pinkAt: PINK_AT, meloAt: MELO_AT, width: WIDTH, pinkKeys: PINK_KEYS, meloKeys: MELO_KEYS });

// ---------------------------------------------------------------- bubbles
// The giant two-flavour bubble (pink on Pink's side, green on Mélo's side).
const DuoBubble: React.FC<{ x: number; y: number; r: number; wob: number }> = ({ x, y, r, wob }) => (
  <svg style={{ position: "absolute", left: x - r * 1.2, top: y - r * 1.2, width: r * 2.4, height: r * 2.4, overflow: "visible" }} viewBox="-120 -120 240 240">
    <defs>
      <linearGradient id="duoTone" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#F38DBE" />
        <stop offset="42%" stopColor="#F9B3D2" />
        <stop offset="58%" stopColor="#BDEB9F" />
        <stop offset="100%" stopColor="#7FD15A" />
      </linearGradient>
      <radialGradient id="duoShine" cx="36%" cy="30%" r="70%">
        <stop offset="0%" stopColor="white" stopOpacity={0.75} />
        <stop offset="45%" stopColor="white" stopOpacity={0.1} />
        <stop offset="100%" stopColor="white" stopOpacity={0} />
      </radialGradient>
    </defs>
    <g transform={`scale(${1 + wob} ${1 - wob})`} opacity={0.94}>
      <circle r={100} fill="url(#duoTone)" stroke="rgba(255,255,255,0.75)" strokeWidth={2.5} />
      <circle r={100} fill="url(#duoShine)" />
      <ellipse cx={-40} cy={-50} rx={22} ry={10} fill="white" opacity={0.85} transform="rotate(-35 -40 -50)" />
      <circle cx={-64} cy={-14} r={5} fill="white" opacity={0.7} />
    </g>
  </svg>
);

// gum all over his face (rig coordinates, drawn in Pink's `over` slot)
const FaceSplat: React.FC<{ f: number }> = ({ f }) => {
  if (f < P_POP1 || f > 456) return null;
  const grow = interpolate(f, [P_POP1, P_POP1 + 4], [0.4, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  const wipe = interpolate(f, [446, 456], [1, 0], clamp);
  const drip = interpolate(f, [P_POP1 + 4, 444], [0, 30], clamp);
  return (
    <g opacity={wipe} transform={`translate(200 250) scale(${grow}) translate(-200 -250)`}>
      <path d="M 92 150 C 120 104 280 104 310 150 C 340 190 330 300 300 330 C 270 356 140 356 104 330 C 70 300 62 196 92 150 Z" fill="#F9A6CB" opacity={0.92} />
      <ellipse cx={130} cy={340 + drip * 0.6} rx={14} ry={22 + drip * 0.4} fill="#F9A6CB" />
      <ellipse cx={262} cy={346 + drip} rx={12} ry={20 + drip * 0.6} fill="#F9A6CB" />
      <ellipse cx={200} cy={352 + drip * 0.3} rx={10} ry={14} fill="#F9A6CB" />
      <ellipse cx={150} cy={160} rx={34} ry={14} fill="white" opacity={0.6} transform="rotate(-20 150 160)" />
      {/* two eye holes */}
      <ellipse cx={148} cy={196} rx={30} ry={26} fill="#FFF7FB" />
      <ellipse cx={252} cy={196} rx={30} ry={26} fill="#FFF7FB" />
      <circle cx={152} cy={200} r={10} fill="#2B0F1E" />
      <circle cx={256} cy={200} r={10} fill="#2B0F1E" />
    </g>
  );
};

// ---------------------------------------------------------------- the world
const pinkBubbleR = (f: number) => {
  if (f >= PROUD + 4 && f < PROUD_POP) return lerp(f, [PROUD + 4, PROUD_POP - 2], [0, 80], Easing.out(Easing.quad));
  if (f >= 352 && f < P_POP1) return lerp(f, [352, 404, P_POP1 - 1], [0, 170, 182], Easing.inOut(Easing.quad));
  if (f >= 490 && f < P_POP2) return lerp(f, [490, LIFT, P_POP2 - 1], [0, 210, 225], Easing.inOut(Easing.quad));
  return 0;
};
const meloBubbleR = (f: number) => {
  if (f >= 360 && f < 452) return f < 440 ? lerp(f, [360, 412], [0, 150], Easing.inOut(Easing.quad)) : lerp(f, [440, 448], [150, 0], Easing.in(Easing.quad));
  if (f >= DOUBLE + 2 && f < SCORE2 + 6) return f < SCORE2 ? lerp(f, [DOUBLE + 2, 590], [0, 160], Easing.inOut(Easing.quad)) : lerp(f, [SCORE2, SCORE2 + 6], [160, 0], Easing.in(Easing.quad));
  return 0;
};
const meloInnerR = (f: number) => (f >= 578 && f < SCORE2 + 6 ? (f < SCORE2 ? lerp(f, [578, 596], [0, 74], Easing.out(Easing.back(1.6))) : lerp(f, [SCORE2, SCORE2 + 6], [74, 0])) : 0);
const duoR = (f: number) => (f >= BLOW + 4 && f < BOUM ? lerp(f, [BLOW + 4, RISE, BOUM - 1], [0, 300, 320], Easing.inOut(Easing.quad)) : 0);

const World: React.FC<{ f: number; pink: Pose; melo: Pose }> = ({ f, pink, melo }) => {
  const pm = mouthOf("pink", pink);
  const mm = mouthOf("melo", melo);
  const pr = pinkBubbleR(f);
  const mr = meloBubbleR(f);
  const mi = meloInnerR(f);
  const dr = duoR(f);
  const duoAt: [number, number] = [(pm[0] + mm[0]) / 2, Math.min(pm[1], mm[1]) - dr * 0.92];
  const wobble = (amp: number) => Math.sin(f * 1.6) * amp;

  // gum flights: pack -> mouth, then the swap
  const flip = (t0: number, t1: number, a: [number, number], b: [number, number]) => {
    const t = lerp(f, [t0, t1], [0, 1], Easing.inOut(Easing.quad));
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(Math.PI * t) * 160, t] as const;
  };
  const pinkPackAt = toWorld("pink", poseOf("pink", 296), 200, 400);
  const meloPackAt = toWorld("melo", poseOf("melo", 298), 200, 400);
  const g1 = flip(298, CHOMP, pinkPackAt, mouthOf("pink", poseOf("pink", CHOMP)));
  const g2 = flip(300, CHOMP + 2, meloPackAt, mouthOf("melo", poseOf("melo", CHOMP + 2)));
  const meloOfferHand = handOf("melo", poseOf("melo", SWAP), "L");
  const pinkOfferHand = handOf("pink", poseOf("pink", SWAP + 2), "R");
  const s1 = flip(SWAP + 2, CHOMP2, meloOfferHand, mouthOf("pink", poseOf("pink", CHOMP2)));
  const s2 = flip(SWAP + 4, CHOMP2 + 2, pinkOfferHand, mouthOf("melo", poseOf("melo", CHOMP2 + 2)));

  const pinkHeld =
    f >= PACKS + 4 && f < 300 ? (
      <g transform={`translate(200 400) scale(${lerp(f, [PACKS + 4, PACKS + 10, 294, 300], [0, 1, 1, 0], Easing.out(Easing.back(2)))})`}>
        <image href={staticFile("pack-fraise.webp")} x={-62} y={-114} width={124} height={228} />
      </g>
    ) : null;
  const meloHeld =
    f >= PACKS + 6 && f < 302 ? (
      <g transform={`translate(200 396) scale(${lerp(f, [PACKS + 6, PACKS + 12, 296, 302], [0, 1, 1, 0], Easing.out(Easing.back(2)))}) rotate(-8)`}>
        <image href={staticFile("pack-pasteque-single.webp")} x={-120} y={-58} width={240} height={115} />
      </g>
    ) : null;

  const gum = (x: number, y: number, flavor: "fraise" | "pasteque", rot: number, sc = 1) => (
    <GumPiece flavor={flavor} style={{ position: "absolute", width: 120 * sc, left: x - 60 * sc, top: y - 48 * sc, rotate: `${rot}deg` }} />
  );
  const showOffer = f >= OFFER + 6 && f <= SWAP + 2;
  const showPinkOffer = f >= SWAP && f <= SWAP + 4;

  return (
    <>
      <Park />
      <Scoreboard
        x={BOARD_X}
        y={BOARD_Y}
        rose={0}
        melo={f >= SCORE2 ? 2 : f >= SCORE1 ? 1 : 0}
        appear={lerp(f, [BOARD, BOARD + 10], [0, 1], Easing.out(Easing.back(1.8)))}
        team={lerp(f, [TEAM, TEAM + 10], [0, 1], Easing.out(Easing.back(1.5)))}
        bumpAt={f >= TEAM ? TEAM : f >= SCORE2 ? SCORE2 : SCORE1}
      />
      {dr > 1 ? <DuoBubble x={duoAt[0]} y={duoAt[1]} r={dr} wob={wobble(0.02)} /> : null}
      <BoumMonster pose={pink} held={pinkHeld} over={<FaceSplat f={f} />} style={rigBox(PINK_AT, WIDTH)} />
      <BoumMonster pose={melo} skin="melo" held={meloHeld} style={rigBox(MELO_AT, WIDTH)} />
      {/* bubbles in front of the faces */}
      {pr > 1 ? <Bubble id="pinkB" x={pm[0]} y={pm[1] + pr * 0.42} r={pr} tone={PINK_GUM} wob={f > 380 && f < P_POP1 ? wobble(0.05) : wobble(0.015)} /> : null}
      {mr > 1 ? <Bubble id="meloB" x={mm[0]} y={mm[1] + mr * 0.42} r={mr} tone={MELO_GUM} wob={wobble(0.008)} opacity={mi > 0 ? 0.55 : 0.85} /> : null}
      {mi > 1 ? <Bubble id="meloI" x={mm[0]} y={mm[1] + mr * 0.42} r={mi} tone={["#FFFFFF", "#FFC2D6", "#FF8FAB"]} wob={wobble(0.02)} /> : null}
      {/* gums */}
      {f >= 298 && f < CHOMP ? gum(g1[0], g1[1], "fraise", g1[2] * 300, 1 - g1[2] * 0.6) : null}
      {f >= 300 && f < CHOMP + 2 ? gum(g2[0], g2[1], "pasteque", -g2[2] * 300, 1 - g2[2] * 0.6) : null}
      {showOffer ? gum(handOf("melo", melo, "L")[0], handOf("melo", melo, "L")[1] - 30, "pasteque", -10, interpolate(f, [OFFER + 6, OFFER + 10], [0, 1], clamp)) : null}
      {showPinkOffer ? gum(handOf("pink", pink, "R")[0], handOf("pink", pink, "R")[1] - 30, "fraise", 10) : null}
      {f > SWAP + 2 && f < CHOMP2 ? gum(s1[0], s1[1], "pasteque", s1[2] * 280, 1 - s1[2] * 0.5) : null}
      {f > SWAP + 4 && f < CHOMP2 + 2 ? gum(s2[0], s2[1], "fraise", -s2[2] * 280, 1 - s2[2] * 0.5) : null}
      {/* pops */}
      <PopBurst f={f} at={PROUD_POP} x={pm[0]} y={pm[1] + 34} r={70} tones={PINK_GUM} n={8} />
      <PopBurst f={f} at={P_POP2} x={toWorld("pink", poseOf("pink", P_POP2 - 1), 200, 296)[0]} y={toWorld("pink", poseOf("pink", P_POP2 - 1), 200, 296)[1] + 94} r={200} tones={PINK_GUM} />
      <PopBurst f={f} at={BOUM} x={(pm[0] + mm[0]) / 2} y={Math.min(pm[1], mm[1]) - 290} r={300} tones={[...PINK_GUM.slice(1), ...MELO_GUM.slice(1)]} n={18} />
      {/* dust */}
      {[[96, -70], [115, 160], [134, 380], [LAND2, 380], [639, 880], [657, 770], [LAND3, 380], [LAND3, 770]].map(([at, x], i) => (
        <DustPuff key={i} at={at} x={x} y={GROUND} />
      ))}
      {/* speech */}
      <Say f={f} from={YO + 14} to={YO + 40} x={mm[0] + 40} y={mm[1] - 300} text="Yo." color="#2E9E3E" tail="right" />
      <Say f={f} from={428} to={446} x={mm[0] + 30} y={mm[1] - 310} text="Trop facile." color="#2E9E3E" tail="right" size={54} />
      <Say f={f} from={OFFER + 8} to={SWAP + 6} x={mm[0] + 20} y={mm[1] - 300} text="Ensemble ?" color="#2E9E3E" tail="right" size={58} />
    </>
  );
};

// ---------------------------------------------------------------- cameras
const MAIN: Cam[] = [
  [0, 690, -420, 0.8],
  [62, 690, -420, 0.8],
  [110, 640, 1130, 0.85], // tilt down: wide park
  [138, 520, 1170, 1.05], // push on Pink's proud bubble
  [178, 520, 1170, 1.05],
  [192, 880, 1150, 1.1], // pan: Mélo leaning on the tree
  [214, 880, 1150, 1.1],
  [226, 690, 1120, 0.85], // two-shot: the challenge
  [262, 690, 1120, 0.85],
  [276, 690, 1260, 1.15], // closer: the packs
  [328, 690, 1260, 1.15],
  [SPLIT1[1], 690, 1120, 0.85],
  [SCORE1 + 10, 690, 1100, 0.85],
  [484, 420, 1130, 1.0], // round 2 on Pink
  [LIFT, 420, 1100, 1.0],
  [P_POP2, 420, 820, 0.95], // follow him up
  [LAND2, 420, 1100, 0.95],
  [570, 420, 1100, 0.95],
  [584, 1000, 1150, 1.1], // pan: Mélo's double bubble
  [600, 1000, 1150, 1.1],
  [SCORE2 + 6, 690, 1100, 0.85],
  [634, 620, 1150, 0.95],
  [OFFER + 6, 575, 1230, 1.25], // the gesture
  [CHOMP2, 575, 1230, 1.25],
  [RISE, 575, 1020, 0.9],
  [BOUM - 4, 575, 680, 0.7], // they float above the park
  [BOUM + 6, 575, 780, 0.72],
  [LAND3, 620, 1080, 0.88],
  [DUEL_END, 640, 1060, 0.92],
];
const PINK_CAM: Cam[] = [[0, 430, 1200, 1.0]];
const MELO_CAM: Cam[] = [[0, 960, 1200, 1.0]];

const View: React.FC<{ f: number; cam: { cx: number; cy: number; z: number }; h: number; pink: Pose; melo: Pose; shake?: number }> = ({ f, cam, h, pink, melo, shake = 0 }) => {
  const cx = cam.cx + Math.sin(f * 2.7) * shake;
  const cy = cam.cy + Math.cos(f * 3.1) * shake;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: h, overflow: "hidden" }}>
      <DaySky cy={cy} />
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${540 - cx * cam.z}px, ${h / 2 - cy * cam.z}px) scale(${cam.z})` }}>
        <div style={{ position: "absolute", left: 0, top: 0, translate: `${(cx - 700) * 0.5}px 0px` }}>
          <DaySkyline cx={700} />
        </div>
        <World f={f} pink={pink} melo={melo} />
      </div>
    </div>
  );
};

const Card: React.FC<{ f: number; at: number; text: string }> = ({ f, at, text }) => {
  const s = interpolate(f, [at, at + 6, at + 12, at + 16], [0, 1.15, 1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  if (f < at || f > at + 16) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: `rgba(255,255,255,${0.35 * Math.min(1, s)})` }}>
      <div style={{ position: "relative", scale: s, rotate: "-5deg" }}>
        <Starburst color="#FFD84D" style={{ position: "absolute", width: 860, height: 600, left: -430 + 270, top: -300 + 110 }} />
        <div style={{ position: "relative", width: 540, textAlign: "center", fontFamily: displayFont, fontSize: 170, lineHeight: 1.3, ...candyText(colors.logoRed, colors.white, 15) }}>{text}</div>
      </div>
    </AbsoluteFill>
  );
};

export const DuelScene: React.FC = () => {
  const f = useCurrentFrame();
  const pink = poseOf("pink", f);
  const melo = poseOf("melo", f);
  const shake = (from: number, amt: number) => (f >= from && f < from + 12 ? (1 - (f - from) / 12) * amt : 0);
  const split = f >= SPLIT1[0] && f < SPLIT1[1];
  const splitIn = lerp(f, [SPLIT1[0], SPLIT1[0] + 8], [1, 0], Easing.out(Easing.cubic));

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#9FE0F7" }}>
      {split ? (
        <>
          <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 960, translate: `${-splitIn * 1080}px 0px` }}>
            <View f={f} cam={camAt(PINK_CAM, f)} h={960} pink={pink} melo={melo} shake={shake(P_POP1, 10)} />
          </div>
          <div style={{ position: "absolute", left: 0, top: 960, width: 1080, height: 960, translate: `${splitIn * 1080}px 0px` }}>
            <View f={f} cam={camAt(MELO_CAM, f)} h={960} pink={pink} melo={melo} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 948, height: 24, background: "white", boxShadow: "0 0 18px rgba(0,0,0,0.2)" }} />
          <div style={{ position: "absolute", left: 40, top: 40, padding: "8px 26px", borderRadius: 999, background: colors.logoRed, color: "white", fontFamily: displayFont, fontSize: 56 }}>Boum Boum · Fraise</div>
          <div style={{ position: "absolute", left: 40, top: 1000, padding: "8px 26px", borderRadius: 999, background: "#2E9E3E", color: "white", fontFamily: displayFont, fontSize: 56 }}>Mélo · Pastèque</div>
        </>
      ) : (
        <View f={f} cam={camAt(MAIN, f)} h={1920} pink={pink} melo={melo} shake={shake(P_POP2, 12) + shake(BOUM, 18)} />
      )}

      <SeriesTitle episode={3} title="Le Duel de Bulles" titleColor={colors.logoRed} outAt={64} />
      <Pop f={f} at={DEFI} out={DEFI + 26} top={330}>
        <div style={{ fontFamily: displayFont, fontSize: 190, ...candyText(colors.logoRed, colors.white, 15), rotate: `${-6 + Math.sin(f * 2.4) * 2}deg` }}>DÉFI !</div>
      </Pop>
      <Card f={f} at={R1_CARD} text="ROUND 1" />
      <Card f={f} at={R2_CARD} text="ROUND 2" />
      <Pop f={f} at={P_POP1 + 2} out={P_POP1 + 22} top={300}>
        <div style={{ fontFamily: displayFont, fontSize: 130, ...candyText("#F9A6CB", "#8C2C5B", 12), rotate: "6deg" }}>SPLOTCH !</div>
      </Pop>
      {f >= BOUM && f < BOUM + 28 ? (
        <div style={{ position: "absolute", left: 160, top: 330, width: 760, height: 560, display: "flex", alignItems: "center", justifyContent: "center", scale: interpolate(f, [BOUM, BOUM + 6, BOUM + 22, BOUM + 28], [2.2, 1, 1, 0], { ...clamp, easing: Easing.out(Easing.back(1.6)) }), rotate: "-7deg" }}>
          <Starburst color="#FFD84D" style={{ position: "absolute", width: 760, height: 560 }} />
          <div style={{ position: "relative", fontFamily: displayFont, fontSize: 210, ...candyText(colors.logoRed, colors.white, 16) }}>BOUM !</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
