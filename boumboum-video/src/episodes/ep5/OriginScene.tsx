import type React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { SeriesTitle } from "../../brand/SeriesTitle";
import { alternate, rigBox, rigToScreen, tighten } from "../../final/kit";
import { BoumMonster, bendWeight } from "../../rig/BoumMonster";
import { animatedPose, blinkAt, type Key, type Pose, sortKeys } from "../../rig/pose";
import { candyText, colors, displayFont, scriptFont } from "../../theme";
import { Bubble, type Cam, camAt, clamp, lerp, PINK_GUM, Pop, PopBurst, Say } from "../shared/stage";
import {
  BELT,
  BELT_END,
  BIRTH_BUBBLE,
  DRIP,
  Exterior,
  FirstPack,
  GiantGum,
  Hall,
  PACK_H,
  PACK_X,
  PLATFORM_Y,
  pointOnPath,
  PRESS_UP,
  PRESS_X,
  PressHead,
  PrinterHead,
  SPARK_PATH,
  WrappedBundle,
} from "./FactorySet";

// "Les Aventures Boum Boum", Episode 5: "La Naissance de Boum Boum" (45 s).
// The origin story: one stormy night, in a giant candy factory, a drop of
// filling falls into a gum bubble... and the bubble comes to life.

const WIDTH = 300; // he is tiny in this world
const SCALE = WIDTH / 400;
const AT: [number, number] = [640, BELT];
const XP = (wx: number) => (wx - AT[0]) / SCALE;
const YP = (wy: number) => (wy - BELT) / SCALE;

// beats (30 fps)
const HALL_IN = 92;
const FLASH1 = 170;
const FLASH2 = 198;
const POWER = 226;
const GROW = 236;
const DROP = 270;
const DROP_IN = 288;
const FALL = 300;
const BOUNCE = 312;
const EYES = 350;
const BIRTH = 382;
const LOOK_UP = 428;
const CLANK = 506;
const SLAMS = [610, 650, 690, 730];
const HOP_PRESS = 654;
const SHEET = 736;
const WRAPPED = 748;
const BURST = 778;
const EDGE = 828;
const TRIP = 870;
const OFF = 884;
const IDEA = 905;
const LAND = 1120;
const PRINT = [1145, 1185];
const PRINTED = 1188;
const WINK = 1243;
export const ORIGIN_END = 1268;

// belt displacement (world px); it starts at CLANK and runs at 7.5 px/frame
export const beltPos = (f: number) => (f < CLANK ? 0 : f < CLANK + 10 ? (7.5 * (f - CLANK) ** 2) / 20 : 7.5 * (f - CLANK - 5));
const carried = (x0: number, f0: number, f1: number) => x0 + beltPos(f1) - beltPos(f0);

const X_EXPLORE = 980;
const X_PRESS = carried(X_EXPLORE, 560, 648); // ~1640
const X_AFTER_PRESS = X_PRESS + 440;
const X_WRAP = carried(X_AFTER_PRESS, 670, 742);
const X_FREE = carried(X_WRAP, 748, BURST);
const X_EDGE_RUN = carried(X_FREE, 786, 836);
const X_TRIP = carried(X_EDGE_RUN, TRIP, OFF);
const Y_PLAT = YP(PLATFORM_Y);

// ---------------------------------------------------------------- the monster
const KEYS: Key[] = tighten(
  sortKeys([
    // born curled up, eyes shut
    { f: BIRTH, x: 0, y: 0, sy: 0.55, sx: 1.1, legLift: 1, armL: -40, armR: -40, blink: 1, mouthOpen: 0, mouthWidth: 0.5, smile: 0.5, eyeScale: 1, browY: 0, rot: 0, turn: 0 },
    { f: BIRTH + 6, sy: 0.6, sx: 1.05 },
    // unfolds
    { f: BIRTH + 14, sy: 1.12, sx: 1, legLift: 0, armL: 60, armR: 60, ease: "out" },
    { f: BIRTH + 20, sy: 1, ease: "out" },
    { f: BIRTH + 24, blink: 1 },
    { f: BIRTH + 28, blink: 0, eyeScale: 1.2, browY: -12, mouthOpen: 0.3, mouthWidth: 0.45, smile: 0.6, ease: "out" },
    // looks at his own hands
    { f: 412, lookX: -0.6, lookY: 0.3, armL: 40, curlL: 0.5, armR: 30 },
    { f: 417, armL: 75, curlL: -0.6 },
    { f: 421, armL: 40, curlL: 0.5, lookX: 0.6, armR: 60, curlR: -0.5 },
    { f: 425, armR: 30, curlR: 0.5 },
    // ...and up at the giant factory
    { f: LOOK_UP, lookX: 0, lookY: -0.9, eyeScale: 1.35, pupil: 0.8, mouthOpen: 0.9, mouthWidth: 0.45, smile: 1, browY: -18, armL: 8, armR: 8, curlL: 0, curlR: 0, ease: "out" },
    { f: 448, eyeScale: 1.35, mouthOpen: 0.9 },
    ...blinkAt(440),
    // curious: hops toward the giant gum
    { f: 452, lookY: 0, eyeScale: 1, pupil: 1, squint: 1, mouthOpen: 0.85, mouthWidth: 1, browY: -6, turn: 0.2, lookX: 0.5 },
    { f: 458, squint: 0, sy: 1, y: 0, x: 0, armL: 20, armR: 20 },
    { f: 461, sy: 0.84 },
    { f: 464, sy: 1.08, armL: 70, armR: 70, ease: "out" },
    { f: 467, y: -120, ease: "out" },
    { f: 472, x: XP(820), ease: "inOut" },
    { f: 472, y: 0, ease: "in" },
    { f: 473, sy: 0.84, ease: "snap" },
    { f: 477, sy: 1, armL: 20, armR: 20, ease: "out" },
    { f: 478, x: XP(820), y: 0 },
    { f: 481, sy: 0.84 },
    { f: 484, sy: 1.08, armL: 70, armR: 70, ease: "out" },
    { f: 487, y: -100, ease: "out" },
    { f: 491, x: XP(X_EXPLORE), ease: "inOut" },
    { f: 491, y: 0, ease: "in" },
    { f: 492, sy: 0.84, ease: "snap" },
    { f: 495, sy: 1, armL: 20, armR: 20, ease: "out" },
    // poke!
    { f: 496, armR: 20, turn: 0.35, lookX: 0.8 },
    { f: 499, armR: 45, curlR: -0.3, ease: "snap" },
    { f: 502, armR: 20, curlR: 0, squint: 1, mouthOpen: 1, ease: "out" },
    // CLANK: the line starts
    { f: CLANK - 1, x: XP(X_EXPLORE), y: 0, sy: 1, squint: 1 },
    { f: CLANK + 1, y: -60, sy: 1.22, squint: 0, eyeScale: 1.4, pupil: 0.5, browY: -26, mouthOpen: 0.95, mouthWidth: 0.42, armL: 150, armR: 150, legSpread: 0.5, ease: "snap" },
    { f: CLANK + 8, y: 0, sy: 1, legSpread: 0, ease: "in" },
    // runs against the belt (treadmill)
    { f: CLANK + 10, turn: 0.35, run: 0, rot: 0, x: XP(X_EXPLORE) },
    { f: CLANK + 14, turn: -0.5, lookX: -0.8, run: 1, rot: -9, eyeScale: 1.2, pupil: 0.8, browTilt: 14, browY: -8, mouthOpen: 0.6, mouthWidth: 0.5, ease: "out" },
    ...alternate(CLANK + 14, 552, 4, { armL: 150, armR: 115, y: -10 }, { armL: 115, armR: 150, y: 0 }),
    { f: 556, x: XP(X_EXPLORE), run: 1, rot: -9 },
    // ...exhausted, tongue out, carried away
    { f: 560, run: 0, rot: 0, sy: 0.92, y: 0, armL: -20, armR: -20, tongue: 1, tongueX: 0.4, mouthOpen: 0.6, mouthWidth: 0.6, browTilt: 18, browY: 0, eyeScale: 1, pupil: 1, turn: 0, lookX: 0, ease: "out" },
    { f: 560, x: XP(X_EXPLORE), ease: "linear" },
    { f: 648, x: XP(X_PRESS), ease: "linear" },
    { f: 590, tongue: 0, sy: 1, turn: 0.3, lookX: 0.8, mouthOpen: 0.3, mouthWidth: 0.5, smile: -0.3 },
    { f: SLAMS[0] - 1, blink: 0, sy: 1, eyeScale: 1.15 },
    { f: SLAMS[0], blink: 1, sy: 0.88, ease: "snap" },
    { f: SLAMS[0] + 6, blink: 0, sy: 1, eyeScale: 1.25, ease: "out" },
    { f: 626, mouthOpen: 0.3 },
    { f: 630, mouthOpen: 0, mouthWidth: 0.5, sy: 0.94 },
    { f: 636, sy: 1 },
    { f: SLAMS[1] - 1, blink: 0, sy: 1 },
    { f: SLAMS[1], blink: 1, sy: 0.85, ease: "snap" },
    // determined: jumps through!
    { f: SLAMS[1] + 3, blink: 0, browTilt: -16, browY: 6, eyeScale: 1.1, mouthOpen: 0.3, mouthWidth: 0.6, smile: 0.5, sy: 0.84, armL: -12, armR: -12, ease: "out" },
    { f: HOP_PRESS, x: XP(X_PRESS), y: 0 },
    { f: HOP_PRESS + 3, sy: 1.12, armL: 120, armR: 120, ease: "out" },
    { f: HOP_PRESS + 6, y: -130, legLift: 0.6, ease: "out" },
    { f: HOP_PRESS + 14, x: XP(X_AFTER_PRESS), ease: "inOut" },
    { f: HOP_PRESS + 14, y: 0, legLift: 0, ease: "in" },
    { f: HOP_PRESS + 15, sy: 0.8, ease: "snap" },
    { f: HOP_PRESS + 20, sy: 1, armL: 20, armR: 20, ease: "out" },
    { f: 670, x: XP(X_AFTER_PRESS), ease: "linear" },
    { f: 742, x: XP(X_WRAP), ease: "linear" },
    // BAM behind him
    { f: SLAMS[2] - 1, y: 0, sy: 1, eyeScale: 1.1 },
    { f: SLAMS[2], y: -40, eyeScale: 1.35, pupil: 0.6, browY: -22, browTilt: 0, mouthOpen: 0.9, mouthWidth: 0.45, ease: "snap" },
    { f: SLAMS[2] + 5, y: 0, ease: "in" },
    { f: 698, turn: -0.4, lookX: -0.9, eyeScale: 1.2, pupil: 1 },
    { f: 708, turn: 0, lookX: 0, squint: 1, eyeScale: 1, mouthOpen: 0.85, mouthWidth: 1, smile: 1, browY: -4 },
    { f: 726, squint: 0, lookY: -0.7, turn: 0.2, lookX: 0.3, eyeScale: 1.15 },
    // wrapped like a candy (hidden), then bursts out
    { f: WRAPPED, x: XP(X_WRAP), ease: "linear" },
    { f: BURST, x: XP(X_FREE), y: 0, sy: 0.9, ease: "linear" },
    { f: BURST + 2, y: -80, sy: 1.2, armL: 150, armR: 150, eyeScale: 1.25, lookY: 0, mouthOpen: 1, mouthWidth: 0.9, smile: 1, browY: -14, ease: "snap" },
    { f: BURST + 8, y: 0, sy: 1, armL: 40, armR: 40, ease: "in" },
    { f: 786, x: XP(X_FREE), ease: "linear" },
    { f: 836, x: XP(X_EDGE_RUN), ease: "linear" },
    { f: 800, turn: 0.3, lookX: 0.8, squint: 0, mouthOpen: 0.85, armL: 20, armR: 20, eyeScale: 1 },
    // the end of the line!
    { f: EDGE, eyeScale: 1.4, pupil: 0.5, browY: -26, mouthOpen: 0.9, mouthWidth: 0.42, sy: 1.1, ease: "snap" },
    { f: EDGE + 6, sy: 1 },
    { f: 836, turn: -0.5, lookX: -0.8, run: 1, rot: -10, browTilt: 16, eyeScale: 1.25, ease: "out" },
    ...alternate(838, 866, 4, { armL: 150, armR: 115, y: -10 }, { armL: 115, armR: 150, y: 0 }),
    { f: 868, x: XP(X_EDGE_RUN), y: 0, run: 1, rot: -10 },
    // trips, slides off
    { f: TRIP, run: 0, rot: -35, sy: 0.85, legLift: 0.8, armL: 150, armR: 150, eyeScale: 1.35, ease: "snap" },
    { f: TRIP, x: XP(X_EDGE_RUN), ease: "linear" },
    { f: OFF, x: XP(X_TRIP), rot: -50, y: 0, ease: "linear" },
    // falling...
    { f: OFF + 1, y: 0 },
    { f: IDEA - 1, y: YP(2560), x: XP(X_TRIP + 90), ease: "in" },
    ...alternate(OFF + 2, IDEA - 2, 3, { rot: -20, armL: 160, armR: 120 }, { rot: 15, armL: 120, armR: 160 }),
    { f: IDEA - 2, eyeScale: 1.35, mouthOpen: 0.9, legLift: 0.6 },
    // ...the idea: blow!
    { f: IDEA, rot: 0, eyeScale: 1.1, pupil: 1, browTilt: -16, browY: 4, cheeks: 1, mouthOpen: 0.3, mouthWidth: 0.28, smile: 0.5, armL: 30, armR: 30, legLift: 0.3, ease: "snap" },
    { f: 925, y: YP(2650), x: XP(X_TRIP + 120), ease: "out" },
    // floating over the factory
    { f: 990, y: YP(1500), x: XP(3400), ease: "inOut" },
    { f: 1040, y: YP(900), x: XP(3600), ease: "inOut" },
    { f: 1080, y: YP(1000), x: XP(4100), ease: "inOut" },
    { f: LAND, y: Y_PLAT, x: XP(4400), ease: "inOut" },
    { f: 940, browTilt: 0, browY: -8, eyeScale: 1.15, cheeks: 0.7, armL: 60, armR: 60 },
    { f: 990, lookX: -0.5, lookY: 0.5 },
    { f: 1020, lookX: 0.5, lookY: 0.6, squint: 0 },
    { f: 1050, lookX: 0, lookY: -0.2, eyeScale: 1.25 },
    { f: 1095, lookX: 0.6, lookY: 0.4, eyeScale: 1.1 },
    // landing
    { f: LAND - 1, sy: 1, legLift: 0.3 },
    { f: LAND, sy: 0.8, legLift: 0, ease: "snap" },
    { f: LAND + 6, sy: 1, ease: "out" },
    { f: LAND + 4, cheeks: 0, mouthOpen: 0.4, mouthWidth: 0.6, armL: 20, armR: 20, browY: -6 },
    ...blinkAt(1126),
    { f: 1134, turn: 0.4, lookX: 0.8, lookY: -0.2, eyeScale: 1.1, mouthOpen: 0.3, mouthWidth: 0.45 },
    { f: PRINT[0], lookY: -0.3 },
    { f: PRINT[1], lookY: 0.5 },
    // printed: his face!
    { f: PRINTED - 1, eyeScale: 1.1, sy: 1, y: Y_PLAT },
    { f: PRINTED, eyeScale: 1.45, pupil: 0.6, browY: -26, mouthOpen: 0.95, mouthWidth: 0.42, sy: 1.12, lookY: 0, ease: "snap" },
    { f: PRINTED + 8, sy: 1, ease: "out" },
    { f: 1200, turn: 0, lookX: 0, eyeScale: 1.2, pupil: 1, armR: 45, curlR: -0.3, mouthOpen: 0.6, mouthWidth: 0.6 },
    { f: 1216, armR: 8, curlR: 0 },
    // joy jump
    { f: 1222, y: Y_PLAT, sy: 1, armL: 20, armR: 20 },
    { f: 1225, sy: 0.84, armL: -12, armR: -12, squint: 1, mouthOpen: 1, mouthWidth: 1, smile: 1, browY: -10 },
    { f: 1228, sy: 1.1, armL: 150, armR: 150, ease: "out" },
    { f: 1232, y: Y_PLAT - 160, ease: "out" },
    { f: 1239, y: Y_PLAT, ease: "in" },
    { f: 1240, sy: 0.82, ease: "snap" },
    // wink at the camera
    { f: WINK, sy: 1, squint: 0, rot: 0, bend: 0, wink: 0, armL: 40, armR: 8 },
    { f: WINK + 5, rot: 5, bend: 14, sy: 1.04, turn: 0.25, wink: 1, browY: -4, mouthOpen: 0.35, mouthWidth: 0.75, armR: 70, curlR: 0.35, armL: 8, ease: "snap" },
    { f: WINK + 10, sy: 1, ease: "out" },
    { f: ORIGIN_END, wink: 1, armR: 70 },
  ]),
);

const poseCache = new Map<number, Pose>();
const poseOf = (f: number) => {
  let p = poseCache.get(f);
  if (!p) {
    p = animatedPose(KEYS, f, true);
    poseCache.set(f, p);
  }
  return p;
};
const toWorld = (p: Pose, rx: number, ry: number) => rigToScreen(p, AT, SCALE, rx, ry);
const mouthOf = (p: Pose) => toWorld(p, 200 + p.turn * 105 + p.bend * bendWeight(230), 296);

// ---------------------------------------------------------------- props over time
const power = (f: number) => (f < POWER ? 0 : f < POWER + 12 ? [0, 1, 1, 0.2, 0.2, 1, 1, 0.5, 1, 1, 1, 1][f - POWER] : 1);
const bolt = (f: number) => (f >= FLASH1 && f < FLASH1 + 6 ? 1 - (f - FLASH1) / 6 : f >= FLASH2 && f < FLASH2 + 8 ? 1 - (f - FLASH2) / 8 : 0);
const pressBottom = (f: number) => {
  for (const s of SLAMS) {
    if (f >= s - 5 && f < s) return lerp(f, [s - 5, s], [PRESS_UP, BELT + 4], Easing.in(Easing.quad));
    if (f >= s && f < s + 4) return BELT + 4;
    if (f >= s + 4 && f < s + 22) return lerp(f, [s + 4, s + 22], [BELT + 4, PRESS_UP]);
  }
  return PRESS_UP;
};

// the very first bubble (before he is born)
const BirthBubble: React.FC<{ f: number }> = ({ f }) => {
  if (f < GROW || f >= BIRTH) return null;
  const r = lerp(f, [GROW, GROW + 30], [0, 110], Easing.out(Easing.quad));
  const fallT = lerp(f, [FALL, BOUNCE], [0, 1], Easing.in(Easing.quad));
  const restY = BELT - 110;
  const y = f < FALL ? BIRTH_BUBBLE[1] : f < BOUNCE ? BIRTH_BUBBLE[1] + (restY - BIRTH_BUBBLE[1]) * fallT : restY;
  const sq = f >= BOUNCE && f < BOUNCE + 14 ? Math.sin(((f - BOUNCE) / 14) * Math.PI * 2) * 0.18 * (1 - (f - BOUNCE) / 14) : 0;
  const tremble = f > 330 ? Math.sin(f * 2.3) * lerp(f, [330, BIRTH], [1, 6]) : 0;
  const beat = [334, 350, 366].reduce((a, b) => a + Math.max(0, 1 - Math.abs(f - b) / 5), 0);
  const core = lerp(f, [DROP_IN, DROP_IN + 8], [0, 1]);
  const eyes = lerp(f, [EYES, EYES + 6], [0, 1]);
  const blink = f >= 362 && f < 367 ? 0.1 : 1;
  return (
    <svg style={{ position: "absolute", left: BIRTH_BUBBLE[0] - 160 + tremble, top: y - 160, width: 320, height: 320, overflow: "visible" }} viewBox="-160 -160 320 320">
      <defs>
        <radialGradient id="birthShell" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#FFE3EF" />
          <stop offset="60%" stopColor="#F9A6CB" />
          <stop offset="100%" stopColor="#EE79B1" />
        </radialGradient>
        <radialGradient id="birthCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6F91" stopOpacity={1} />
          <stop offset="100%" stopColor="#E0164A" stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(0 ${r}) scale(${1 + sq + beat * 0.04} ${1 - sq + beat * 0.04}) translate(0 ${-r})`}>
        <circle r={r + beat * 18} fill="#FF8FB8" opacity={beat * 0.25} />
        <circle r={r} fill="url(#birthShell)" opacity={0.95} stroke="rgba(255,255,255,0.7)" strokeWidth={3} />
        <circle r={r * 0.55} fill="url(#birthCore)" opacity={core * (0.7 + beat * 0.3)} />
        <ellipse cx={-r * 0.4} cy={-r * 0.45} rx={r * 0.24} ry={r * 0.12} fill="white" opacity={0.8} transform={`rotate(-35 ${-r * 0.4} ${-r * 0.45})`} />
        {eyes > 0 ? (
          <g opacity={eyes}>
            {[-34, 34].map((ex) => (
              <g key={ex} transform={`translate(${ex} -14) scale(1 ${blink * eyes})`}>
                <ellipse rx={24} ry={28} fill="white" />
                <circle cx={2} cy={4} r={13} fill="#2B5FD9" />
                <circle cx={2} cy={4} r={6} fill="#0B1033" />
                <circle cx={-4} cy={-3} r={4} fill="white" />
              </g>
            ))}
          </g>
        ) : null}
      </g>
    </svg>
  );
};

const Caption: React.FC<{ f: number; from: number; to: number; text: string }> = ({ f, from, to, text }) => {
  const o = interpolate(f, [from, from + 10, to - 10, to], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1590, textAlign: "center", opacity: o, translate: `0px ${(1 - o) * 20}px` }}>
      <span style={{ display: "inline-block", padding: "18px 40px", borderRadius: 40, background: "rgba(12,10,40,0.55)", fontFamily: scriptFont, fontSize: 66, color: "#FFF3C4", textShadow: "0 3px 0 rgba(0,0,0,0.35)", lineHeight: 1.2 }}>{text}</span>
    </div>
  );
};

// ---------------------------------------------------------------- the world
const World: React.FC<{ f: number }> = ({ f }) => {
  const pose = poseOf(f);
  const bp = beltPos(f);
  const pw = power(f);
  const born = f >= BIRTH;
  const wrapped = f >= WRAPPED && f < BURST;

  // the drop of filling
  const dropT = lerp(f, [DROP, DROP_IN], [0, 1], Easing.in(Easing.quad));
  const dropForm = lerp(f, [DROP - 10, DROP], [0, 1]);
  // the giant gum, carried by the belt and flattened by the first slam
  const gumX = 1150 + bp;
  const gumSquash = f >= SLAMS[0] ? 1 : 0;
  // the float bubble
  const floatR = f >= IDEA && f < LAND + 4 ? lerp(f, [IDEA, IDEA + 18, LAND - 10, LAND + 3], [0, 230, 230, 150], Easing.out(Easing.quad)) : 0;
  const mouth = mouthOf(pose);
  // the print
  const headY = f < PRINT[0] ? lerp(f, [1130, PRINT[0]], [980, PLATFORM_Y - PACK_H - 20]) : f < PRINT[1] ? lerp(f, PRINT, [PLATFORM_Y - PACK_H - 20, PLATFORM_Y - 10], Easing.linear) : lerp(f, [PRINT[1] + 4, PRINT[1] + 20], [PLATFORM_Y - 10, 980]);
  const print = lerp(f, PRINT, [0, 1], Easing.linear);
  const glow = interpolate(f, [PRINTED, PRINTED + 6, PRINTED + 30], [0, 1, 0.3], clamp);
  // the falling sheet
  const sheetTop = lerp(f, [SHEET, WRAPPED], [1636, BELT - 300], Easing.in(Easing.quad));
  const feet = toWorld(pose, 200, 470);

  return (
    <>
      <Hall f={f} power={pw} bolt={bolt(f)} beltPos={bp} />
      {/* sparks running down the pipe after the second lightning bolt */}
      {f >= FLASH2 + 2 && f < POWER + 2
        ? [0, 0.08, 0.16].map((d, i) => {
            const [sx, sy] = pointOnPath(SPARK_PATH, lerp(f, [FLASH2 + 2, POWER], [0, 1], Easing.linear) - d);
            return <div key={i} style={{ position: "absolute", left: sx - 30, top: sy - 30, width: 60, height: 60, borderRadius: "50%", background: "radial-gradient(circle, #FFFFFF 0%, #FFF27A 40%, rgba(255,242,122,0) 70%)" }} />;
          })
        : null}
      {/* drop of filling */}
      {f >= DROP - 10 && f < DROP_IN ? (
        <div style={{ position: "absolute", left: DRIP[0] - 18, top: DRIP[1] + 10 + (BIRTH_BUBBLE[1] - DRIP[1] - 10) * dropT - 18, width: 36, height: 46, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: "radial-gradient(circle at 40% 35%, #FF8FAA, #E0164A 60%, #A10A30)", scale: dropForm }} />
      ) : null}
      <BirthBubble f={f} />
      {f < SLAMS[0] + 140 ? <GiantGum x={gumX} squash={gumSquash} jiggle={f >= 499 && f < 512 ? Math.sin((f - 499) * 1.4) * (1 - (f - 499) / 13) : 0} /> : null}
      {floatR > 1 ? <Bubble id="floatB" x={mouth[0]} y={mouth[1] - floatR * 0.92} r={floatR} tone={PINK_GUM} opacity={0.88} wob={Math.sin(f * 0.9) * 0.02} /> : null}
      {f >= 928 && f < LAND
        ? Array.from({ length: 14 }, (_, i) => {
            const back = (i + 1) * 3;
            const p = toWorld(poseOf(Math.max(IDEA, f - back)), 200 + Math.sin(i * 1.7) * 60, 380);
            const o = (1 - i / 14) * 0.9;
            const sz = 30 - i;
            return <div key={i} style={{ position: "absolute", left: p[0] - sz / 2, top: p[1] - sz / 2, width: sz, height: sz, background: i % 2 ? "#FFF3C4" : "#FFC2DB", clipPath: "polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)", opacity: o, rotate: `${f * 4 + i * 30}deg` }} />;
          })
        : null}
      {born && !wrapped ? <BoumMonster pose={pose} style={rigBox(AT, WIDTH)} /> : null}
      {wrapped ? <WrappedBundle x={feet[0]} y={BELT - 120} t={f} /> : null}
      {f >= SHEET && f < WRAPPED ? <div style={{ position: "absolute", left: feet[0] - 190, top: sheetTop, width: 380, height: 300, background: "linear-gradient(180deg, #F06AA8, #E3123B)", borderRadius: 18, rotate: `${Math.sin(f) * 6}deg` }} /> : null}
      <PressHead bottom={pressBottom(f)} />
      <FirstPack print={print} glow={glow} />
      {f >= 1126 ? <PrinterHead y={headY} on={f >= PRINT[0] && f < PRINT[1] ? 1 : 0.3} /> : null}
      {/* pops */}
      <PopBurst f={f} at={BIRTH} x={BIRTH_BUBBLE[0]} y={BELT - 110} r={110} tones={PINK_GUM} n={12} />
      <PopBurst f={f} at={SLAMS[0]} x={PRESS_X} y={BELT - 20} r={60} tones={["#F7A3C5", "#D9709C", "#E0164A"]} n={10} />
      <PopBurst f={f} at={BURST} x={feet[0]} y={BELT - 140} r={140} tones={["#F06AA8", "#E3123B", "#FFD3E6"]} n={14} />
      <PopBurst f={f} at={LAND + 4} x={mouth[0]} y={mouth[1] - 150} r={150} tones={PINK_GUM} n={12} />
      {/* sparkles around the printed pack */}
      {f >= PRINTED && f < PRINTED + 40
        ? Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2 + f * 0.05;
            const d = 260 + ((f - PRINTED) % 20) * 6;
            return <div key={i} style={{ position: "absolute", left: PACK_X + Math.cos(a) * d - 14, top: PLATFORM_Y - PACK_H / 2 + Math.sin(a) * d * 1.3 - 14, width: 28, height: 28, background: "#FFF3C4", clipPath: "polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)", opacity: 1 - (f - PRINTED) / 40 }} />;
          })
        : null}
      <Say f={f} from={1200} to={1220} x={mouth[0] + 30} y={mouth[1] - 250} text="C'est… moi ?!" color={colors.logoRed} tail="left" size={60} />
      {/* edge warning stripes */}
      <div style={{ position: "absolute", left: BELT_END - 60, top: BELT - 12, width: 60, height: 12, background: "repeating-linear-gradient(90deg, #FFD84D 0 15px, #2B2560 15px 30px)" }} />
    </>
  );
};

// ---------------------------------------------------------------- camera
const MAIN: Cam[] = [
  [HALL_IN, 420, 1450, 0.55], // the giant hall, by night
  [165, 640, 1400, 0.6],
  [FLASH2, 620, 950, 0.55], // the storm through the windows
  [POWER, 560, 1300, 0.7], // follow the sparks down
  [250, 640, 1800, 1.3], // the bubble machine + the drip
  [FALL, 640, 1820, 1.3],
  [BOUNCE + 4, 640, 2050, 1.45], // the bubble on the belt
  [BIRTH, 640, 2060, 1.6],
  [418, 640, 2080, 1.6],
  [LOOK_UP + 14, 900, 1250, 0.5], // pull out: how tiny he is
  [452, 900, 1250, 0.5],
  [470, 900, 2000, 1.05],
  [CLANK, 1000, 2000, 1.05],
  [520, 1000, 2000, 0.9],
  [600, 1400, 1900, 0.75], // carried toward the press
  [650, 1700, 1900, 0.75],
  [690, 2000, 1950, 0.8],
  [740, 2500, 1950, 0.85], // the wrapping machine
  [780, 2780, 2000, 0.9],
  [860, 3150, 2000, 0.85],
  [OFF, 3300, 2150, 0.8],
  [IDEA, 3420, 2400, 0.85], // falling
  [925, 3450, 2350, 0.85],
  [990, 3350, 1500, 0.62],
  [1040, 3050, 1000, 0.5], // over the whole factory
  [1080, 3900, 1150, 0.6],
  [LAND, 4500, 1550, 0.95], // the printing platform
  [1140, 4560, 1500, 0.95],
  [PRINTED, 4560, 1500, 0.95],
  [1215, 4480, 1540, 1.1],
  [ORIGIN_END, 4470, 1540, 1.15],
];

export const OriginScene: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camAt(MAIN, f);
  const shake = (from: number, amt: number) => (f >= from && f < from + 10 ? (1 - (f - from) / 10) * amt : 0);
  const s = shake(FLASH2, 10) + SLAMS.reduce((a, sl) => a + shake(sl, 7), 0) + shake(CLANK, 6);
  const cx = cam.cx + Math.sin(f * 2.7) * s;
  const cy = cam.cy + Math.cos(f * 3.1) * s;
  const exterior = interpolate(f, [HALL_IN - 4, HALL_IN + 8], [1, 0], clamp);
  const dark = 0.4 * (1 - power(f)) + 0.04;
  const flash = bolt(f) * 0.85;

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#151845" }}>
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${540 - cx * cam.z}px, ${960 - cy * cam.z}px) scale(${cam.z})` }}>
        <World f={f} />
      </div>
      <AbsoluteFill style={{ background: `rgba(8,10,40,${dark})` }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 50%, rgba(5,5,25,0.35) 100%)" }} />
      <AbsoluteFill style={{ background: "white", opacity: flash }} />
      {exterior > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: exterior }}>
          <Exterior f={f} />
        </div>
      ) : null}

      <SeriesTitle episode={5} title="La Naissance de Boum Boum" titleColor={colors.logoRed} outAt={56} />
      <Caption f={f} from={14} to={HALL_IN} text="Il était une fois… une usine de bonbons." />
      <Caption f={f} from={104} to={166} text="Une nuit d'orage…" />
      <Caption f={f} from={396} to={462} text="…une petite bulle prit vie." />
      <Caption f={f} from={IDEA - 4} to={968} text="Alors il fit ce qu'il savait faire de mieux…" />
      <Caption f={f} from={1214} to={ORIGIN_END + 6} text="Et c'est comme ça que tout a commencé…" />
      <Pop f={f} at={BIRTH} out={BIRTH + 14} top={420}>
        <div style={{ fontFamily: displayFont, fontSize: 150, ...candyText("#FFE3EF", "#B8578C", 13), rotate: "-6deg" }}>POP !</div>
      </Pop>
      <Pop f={f} at={CLANK} out={CLANK + 18} top={360}>
        <div style={{ fontFamily: displayFont, fontSize: 170, ...candyText("#FFD84D", "#3B3570", 15), rotate: "5deg" }}>CLANK !</div>
      </Pop>
      {[SLAMS[0], SLAMS[2]].map((sl) => (
        <Pop key={sl} f={f} at={sl} out={sl + 16} top={330}>
          <div style={{ fontFamily: displayFont, fontSize: 190, ...candyText("#FFFFFF", colors.logoRed, 16), rotate: "-6deg" }}>BAM !</div>
        </Pop>
      ))}
    </AbsoluteFill>
  );
};
