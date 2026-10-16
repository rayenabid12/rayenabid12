import type React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { SeriesTitle } from "../../brand/SeriesTitle";
import { alternate, rigBox, rigToScreen, tighten } from "../../final/kit";
import { BoumMonster, bendWeight } from "../../rig/BoumMonster";
import { animatedPose, blinkAt, type Key, type Pose, sortKeys } from "../../rig/pose";
import { candyText, colors, displayFont, scriptFont } from "../../theme";
import { type Cam, camAt, clamp, lerp, PINK_GUM, Pop, PopBurst, Say } from "../shared/stage";
import {
  BELT,
  BELT_END,
  BIN_X,
  BinFront,
  BIRTH_BUBBLE,
  DRIP,
  DRIP_Y,
  DripperLights,
  Exterior,
  FirstPack,
  FLOOR,
  Hall,
  LineGum,
  PACK_H,
  PACK_X,
  PLATFORM_Y,
  pointOnPath,
  PrinterHead,
  SCAN_X,
  ScannerFX,
  SPARK_PATH,
  Taster,
  TASTE_X,
  Trapdoor,
  TRAP_X,
} from "./FactorySet";

// "Les Aventures Boum Boum", Episode 5: "La Naissance de Boum Boum" (45 s).
// In a factory where every gum is identical (and empty), a bubble is born by
// accident with a liquid heart. Rejected as a "defect", he tries to hide what
// makes him different... until his difference is exactly what the factory was
// missing. « Ce qui te rend différent, c'est ce qui te rend unique. »

const WIDTH = 300; // he is tiny in this world
const SCALE = WIDTH / 400;
const AT: [number, number] = [640, BELT];
const XP = (wx: number) => (wx - AT[0]) / SCALE;
const YP = (wy: number) => (wy - BELT) / SCALE;
const YF = YP(FLOOR); // standing in the reject bin

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
const CLANK = 475;
const ALARM1 = 606;
const TRAP1 = 612;
const ALARM2 = 710;
const TRAP2 = 716;
const LOW = 734;
const DECIDE = 860;
const STOP = 962;
const WOW = 1002;
const FILL = 1014;
const LAND = 1150;
const PRINT = [1165, 1195];
const PRINTED = 1198;
const WINK = 1246;
export const ORIGIN_END = 1268;

// ---------------------------------------------------------------- the line
// belt displacement (world px): starts at CLANK, 10 px/frame, slows to a stop at the tasting machine
export const beltPos = (f: number) => {
  if (f < CLANK) return 0;
  if (f < CLANK + 10) return (10 * (f - CLANK) ** 2) / 20;
  if (f < STOP) return 10 * (f - CLANK - 5);
  const base = 10 * (STOP - CLANK - 5);
  const d = Math.min(f - STOP, 8);
  return base + 10 * d - (10 * d * d) / 16;
};
const SLOT = (k: number) => 640 + 260 * k; // gum k's starting x; the monster is slot 0
const GUMS = Array.from({ length: 31 }, (_, i) => i - 20).filter((k) => k !== 0 && k !== -4 && k !== -10);
const crossing = (k: number, target: number) => CLANK + 5 + (target - SLOT(k)) / 10;
const SCANNED = GUMS.map((k) => crossing(k, SCAN_X)).filter((t) => t > CLANK + 10 && t < STOP);
const TASTED = GUMS.map((k) => crossing(k, TASTE_X)).filter((t) => t > CLANK + 10 && t < STOP - 4);
const ride = (k: number, f: number) => SLOT(k) + beltPos(f);

// ---------------------------------------------------------------- the monster
const KEYS: Key[] = tighten(
  sortKeys([
    // born curled up, eyes shut, in the row of gums
    { f: BIRTH, x: 0, y: 0, sy: 0.55, sx: 1.1, legLift: 1, armL: -40, armR: -40, blink: 1, mouthOpen: 0, mouthWidth: 0.5, smile: 0.5, eyeScale: 1, browY: 0, browTilt: 0, rot: 0, turn: 0, lookX: 0, lookY: 0, cheeks: 0, squint: 0 },
    { f: BIRTH + 6, sy: 0.6, sx: 1.05 },
    { f: BIRTH + 14, sy: 1.12, sx: 1, legLift: 0, armL: 60, armR: 60, ease: "out" },
    { f: BIRTH + 20, sy: 1, ease: "out" },
    { f: BIRTH + 24, blink: 1 },
    { f: BIRTH + 28, blink: 0, eyeScale: 1.2, browY: -12, mouthOpen: 0.3, mouthWidth: 0.45, smile: 0.6, armL: 20, armR: 20, ease: "out" },
    // ...a glow on his chest? he touches it
    { f: 414, lookY: 0.9, lookX: 0, armL: -50, armR: -50, curlL: 0.4, curlR: 0.4, eyeScale: 1.15, mouthOpen: 0.5, mouthWidth: 0.5 },
    { f: 424, armL: -40, armR: -40, smile: 1, mouthOpen: 0.6, mouthWidth: 0.7 },
    // looks at the gums next to him: they don't have one
    { f: 432, lookY: 0, turn: 0.4, lookX: 0.9, armL: 8, armR: 8, curlL: 0, curlR: 0, browTilt: 8, mouthOpen: 0.3, mouthWidth: 0.5, smile: 0.4 },
    { f: 444, turn: -0.4, lookX: -0.9 },
    // ...he wants to be like them: stands up straight and still, like a gum
    { f: 456, turn: 0, lookX: 0, browTilt: 0, sy: 1.04, sx: 0.96, armL: -10, armR: -10, mouthOpen: 0, mouthWidth: 0.5, smile: 0.6, eyeScale: 1 },
    // the line starts: he marches happily with the others
    { f: CLANK, x: XP(ride(0, CLANK)), y: 0, sy: 1.04, sx: 0.96 },
    { f: CLANK + 2, eyeScale: 1.3, browY: -20, sy: 1.1, ease: "snap" },
    { f: CLANK + 8, eyeScale: 1, browY: -4, sy: 1, sx: 1, squint: 1, mouthOpen: 0.85, mouthWidth: 1, smile: 1, turn: 0.2, lookX: 0.3 },
    ...alternate(CLANK + 10, 590, 6, { y: -16, armL: 40, armR: 10, rot: 3 }, { y: 0, armL: 10, armR: 40, rot: -3 }),
    { f: CLANK + 10, x: XP(ride(0, CLANK + 10)), ease: "linear" },
    { f: TRAP1, x: XP(ride(0, TRAP1)), ease: "linear" },
    // the scanner
    { f: 594, y: 0, rot: 0, squint: 0, lookY: -0.7, lookX: 0.3, eyeScale: 1.1, mouthOpen: 0.4, mouthWidth: 0.6, smile: 0.6, armL: 10, armR: 10 },
    { f: ALARM1 - 1, y: 0, sy: 1 },
    { f: ALARM1, y: -40, sy: 1.18, eyeScale: 1.45, pupil: 0.5, browY: -28, mouthOpen: 0.95, mouthWidth: 0.42, armL: 150, armR: 150, lookY: 0, ease: "snap" },
    { f: ALARM1 + 5, y: 0, sy: 1.05, ease: "in" },
    // trapdoor: he drops into the reject bin
    { f: TRAP1 + 2, y: 0, legLift: 0 },
    { f: TRAP1 + 6, legLift: 0.6, armL: 165, armR: 165 },
    { f: TRAP1 + 14, y: YF, x: XP(BIN_X - 10), ease: "in" },
    { f: TRAP1 + 15, sy: 0.7, legLift: 0, legSpread: 0.5, ease: "snap" },
    { f: TRAP1 + 22, sy: 1, legSpread: 0, armL: 30, armR: 30, eyeScale: 1.1, pupil: 0.8, ease: "out" },
    ...alternate(TRAP1 + 22, 640, 5, { lookX: 0.6, rot: 4 }, { lookX: -0.6, rot: -4 }),
    { f: 644, rot: 0, lookX: 0, pupil: 1, eyeScale: 1, browTilt: 18, browY: 0, smile: -0.6, mouthOpen: 0.1, mouthWidth: 0.5, lookY: 0.4 },
    // he tries to fit in: squeezes himself square and hides his heart
    { f: 656, browTilt: -14, browY: 6, smile: 0.5, mouthOpen: 0.2, mouthWidth: 0.6, lookY: 0, sx: 1, sy: 1 },
    { f: 664, sx: 1.28, sy: 0.78, armL: -62, armR: -62, curlL: 0.4, curlR: 0.4, mouthOpen: 0, mouthWidth: 0.5, smile: 0.3, ease: "out" },
    { f: 672, x: XP(BIN_X - 10), y: YF },
    { f: 676, y: YF + 20, sy: 0.7 },
    { f: 684, y: -120, sy: 0.85, ease: "out" },
    { f: 692, x: XP(ride(-4, 692)), ease: "inOut" },
    { f: 692, y: 0, ease: "in" },
    { f: 693, sy: 0.7, ease: "snap" },
    { f: 698, sy: 0.78, sx: 1.28, ease: "out" },
    { f: 692, x: XP(ride(-4, 692)), ease: "linear" },
    { f: TRAP2, x: XP(ride(-4, TRAP2)), ease: "linear" },
    { f: 700, eyeScale: 1.1, lookX: 0.6, browTilt: 14, smile: 1, mouthOpen: 0.4, mouthWidth: 0.9 },
    // DÉFAUT again: he pops back round
    { f: ALARM2 - 1, sx: 1.28, sy: 0.78, y: 0 },
    { f: ALARM2, sx: 1, sy: 1.2, y: -30, eyeScale: 1.45, pupil: 0.5, browY: -28, browTilt: 0, mouthOpen: 0.95, mouthWidth: 0.42, armL: 150, armR: 150, curlL: 0, curlR: 0, lookX: 0, ease: "snap" },
    { f: ALARM2 + 5, y: 0, sy: 1.05, ease: "in" },
    { f: TRAP2 + 2, y: 0, legLift: 0 },
    { f: TRAP2 + 6, legLift: 0.6, armL: 165, armR: 165 },
    { f: TRAP2 + 14, y: YF, x: XP(BIN_X + 10), ease: "in" },
    { f: TRAP2 + 15, sy: 0.7, legLift: 0, legSpread: 0.5, ease: "snap" },
    // the low point: alone in the bin
    { f: LOW, sy: 0.84, y: YF + 18, legLift: 0.5, legSpread: 0, armL: -30, armR: -30, browTilt: 22, browY: 0, smile: -1, mouthOpen: 0, mouthWidth: 0.6, lookY: 0.6, lookX: 0, eyeScale: 0.95, pupil: 1, turn: 0, ease: "out" },
    ...blinkAt(772),
    ...blinkAt(808),
    // ...« Bof »: he looks toward the tasting machine
    { f: 826, lookY: 0.6, lookX: 0, turn: 0 },
    { f: 834, lookY: -0.2, lookX: 0.9, turn: 0.35, eyeScale: 1.05, ease: "out" },
    // he looks at his heart... and decides to stop hiding it
    { f: DECIDE, lookY: 0.9, lookX: 0, turn: 0, browTilt: 14 },
    { f: 872, smile: 0.6, browTilt: 0, mouthOpen: 0.2, mouthWidth: 0.6 },
    { f: 884, sy: 0.84, y: YF + 18, legLift: 0.5, armL: -30, armR: -30 },
    { f: 892, sy: 1.06, y: YF, legLift: 0, armL: 100, armR: 100, curlL: -0.3, curlR: -0.3, lookY: -0.2, eyeScale: 1.1, browTilt: -14, browY: 4, mouthOpen: 0.6, mouthWidth: 0.9, smile: 1, ease: "out" },
    { f: 900, sy: 1 },
    // climbs out of the bin and back onto the line
    { f: 904, x: XP(BIN_X + 10), y: YF, sy: 1, armL: 100, armR: 100 },
    { f: 907, sy: 0.84, armL: -12, armR: -12 },
    { f: 910, sy: 1.08, armL: 90, armR: 90, ease: "out" },
    { f: 913, y: YF - 220, ease: "out" },
    { f: 920, x: XP(2330), ease: "inOut" },
    { f: 920, y: YF, ease: "in" },
    { f: 921, sy: 0.84, ease: "snap" },
    { f: 924, sy: 1, x: XP(2330), y: YF },
    { f: 927, sy: 0.8 },
    { f: 930, sy: 1.12, armL: 140, armR: 140, ease: "out" },
    { f: 934, y: -150, ease: "out" },
    { f: 940, x: XP(ride(-10, 940)), ease: "inOut" },
    { f: 940, y: 0, ease: "in" },
    { f: 941, sy: 0.8, ease: "snap" },
    { f: 946, sy: 1, armL: 60, armR: 60, curlL: 0, curlR: 0, ease: "out" },
    { f: 942, x: XP(ride(-10, 942)), ease: "linear" },
    { f: STOP, x: XP(ride(-10, STOP)), ease: "linear" },
    { f: STOP + 8, x: XP(ride(-10, STOP + 8)), ease: "out" },
    // the heart bubble
    { f: 966, turn: 0, lookX: 0, lookY: -0.3, cheeks: 0, mouthOpen: 0.6, mouthWidth: 0.9, sy: 1 },
    { f: 972, cheeks: 1, mouthOpen: 0.3, mouthWidth: 0.28, smile: 0.5, browTilt: -10, sy: 1.05, armL: 40, armR: 40, ease: "out" },
    { f: WOW - 1, eyeScale: 1.1, browY: 0 },
    { f: WOW, eyeScale: 1.35, browY: -18, browTilt: 0, sy: 0.95, ease: "snap" },
    // the bubble lifts him: he watches every gum get a heart like his
    { f: WOW + 6, y: 0, x: XP(ride(-10, STOP + 8)), eyeScale: 1.2 },
    { f: 1060, y: YP(1350), x: XP(3080), lookY: 0.8, lookX: -0.4, legLift: 0.3, armL: 70, armR: 70, ease: "inOut" },
    { f: 1092, y: YP(1300), x: XP(3250), ease: "inOut" },
    { f: 1120, y: YP(1150), x: XP(4000), lookY: 0.4, lookX: 0.6, ease: "inOut" },
    { f: LAND, y: YP(PLATFORM_Y), x: XP(4400), ease: "inOut" },
    { f: 1040, squint: 0, eyeScale: 1.25 },
    { f: 1080, eyeScale: 1.15, browY: -10 },
    // landing
    { f: LAND - 1, sy: 1, legLift: 0.3 },
    { f: LAND, sy: 0.8, legLift: 0, ease: "snap" },
    { f: LAND + 6, sy: 1, ease: "out" },
    { f: LAND + 4, cheeks: 0, mouthOpen: 0.5, mouthWidth: 0.8, smile: 1, armL: 20, armR: 20, browY: -6, eyeScale: 1.1 },
    { f: 1160, turn: 0.4, lookX: 0.8, lookY: -0.2, mouthOpen: 0.3, mouthWidth: 0.45 },
    { f: PRINT[0], lookY: -0.3 },
    { f: PRINT[1], lookY: 0.5 },
    // printed: his face, as the original
    { f: PRINTED - 1, eyeScale: 1.1, sy: 1, y: YP(PLATFORM_Y) },
    { f: PRINTED, eyeScale: 1.45, pupil: 0.6, browY: -26, mouthOpen: 0.95, mouthWidth: 0.42, sy: 1.12, lookY: 0, ease: "snap" },
    { f: PRINTED + 8, sy: 1, ease: "out" },
    { f: 1206, turn: 0, lookX: 0, eyeScale: 1.2, pupil: 1, armR: 45, curlR: -0.3, mouthOpen: 0.6, mouthWidth: 0.6 },
    { f: 1222, armR: 8, curlR: 0 },
    // joy
    { f: 1226, y: YP(PLATFORM_Y), sy: 1, armL: 20, armR: 20 },
    { f: 1229, sy: 0.84, armL: -12, armR: -12, squint: 1, mouthOpen: 1, mouthWidth: 1, smile: 1, browY: -10 },
    { f: 1232, sy: 1.1, armL: 150, armR: 150, ease: "out" },
    { f: 1236, y: YP(PLATFORM_Y) - 150, ease: "out" },
    { f: 1242, y: YP(PLATFORM_Y), ease: "in" },
    { f: 1243, sy: 0.82, ease: "snap" },
    // wink
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

// ---------------------------------------------------------------- helpers
const power = (f: number) => (f < POWER ? 0 : f < POWER + 12 ? [0, 1, 1, 0.2, 0.2, 1, 1, 0.5, 1, 1, 1, 1][f - POWER] : 1);
const bolt = (f: number) => (f >= FLASH1 && f < FLASH1 + 6 ? 1 - (f - FLASH1) / 6 : f >= FLASH2 && f < FLASH2 + 8 ? 1 - (f - FLASH2) / 8 : 0);
const near = (f: number, ts: number[], before: number, after: number) => ts.some((t) => f >= t - before && f < t + after);

// how bright his heart glows
const heart = (f: number) => {
  if (f < BIRTH) return 0;
  const pulse = 0.85 + 0.15 * Math.sin(f / 5);
  if (f < 660) return 0.75 * pulse;
  if (f < ALARM2) return lerp(f, [660, 668], [0.75, 0.3]); // hidden under his arms
  if (f < LOW) return 0.75 * pulse;
  if (f < DECIDE) return lerp(f, [LOW, 790], [0.6, 0.25]); // dimmed by sadness
  return lerp(f, [DECIDE, 892], [0.3, 1]) * pulse;
};

// the gums: positions, and when each gets its liquid heart
const gumX = (k: number, f: number) => ride(k, f);
const fillAt = (k: number) => FILL + ((ride(k, STOP + 8) - 220) / (BELT_END - 220)) * 50;

const scannerState = (f: number) => (near(f, [ALARM1, ALARM2], 0, 26) ? 2 : near(f, SCANNED, 2, 10) ? 1 : 0);
const probeY = (f: number) => {
  if (f >= WOW - 30) return lerp(f, [WOW - 30, WOW - 4, WOW + 20, WOW + 34], [1700, 1740, 1740, 1600]);
  for (const t of TASTED) {
    if (f >= t - 5 && f < t + 12) return lerp(f, [t - 5, t, t + 4, t + 12], [1700, BELT - 140, BELT - 140, 1700]);
  }
  return 1700;
};
const needle = (f: number) => {
  if (f >= WOW) return interpolate(f, [WOW, WOW + 6, WOW + 10, WOW + 14], [-70, 88, 70, 75], clamp);
  for (const t of TASTED) {
    if (f >= t && f < t + 14) return interpolate(f, [t, t + 4, t + 14], [-70, -52, -70], clamp);
  }
  return -70 + Math.sin(f / 3) * 1.5;
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

// his glowing liquid heart (rig coordinates, drawn on top of the arms)
const HeartGlow: React.FC<{ v: number }> = ({ v }) =>
  v <= 0 ? null : (
    <g transform="translate(200 340) scale(1.9)">
      <defs>
        <radialGradient id="heartHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6F91" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#FF6F91" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={70 + v * 20} fill="url(#heartHalo)" opacity={v} />
      <path d="M 0 22 C -12 14 -26 4 -26 -8 C -26 -20 -14 -26 -6 -22 C -3 -20 -1 -17 0 -14 C 1 -17 3 -20 6 -22 C 14 -26 26 -20 26 -8 C 26 4 12 14 0 22 Z" fill="#E0164A" opacity={Math.min(1, v * 1.3)} stroke="#FFD3E3" strokeWidth={3} />
      <ellipse cx={-10} cy={-12} rx={6} ry={3} fill="white" opacity={0.8 * v} transform="rotate(-30 -10 -12)" />
    </g>
  );

// the bubble lit from inside by his heart
const HeartBubble: React.FC<{ x: number; y: number; r: number; f: number }> = ({ x, y, r, f }) => (
  <svg style={{ position: "absolute", left: x - r * 1.4, top: y - r * 1.4, width: r * 2.8, height: r * 2.8, overflow: "visible" }} viewBox="-140 -140 280 280">
    <defs>
      <radialGradient id="hbShell" cx="40%" cy="35%" r="75%">
        <stop offset="0%" stopColor="#FFF0F6" stopOpacity={0.95} />
        <stop offset="55%" stopColor="#F9A6CB" stopOpacity={0.85} />
        <stop offset="100%" stopColor="#EE79B1" stopOpacity={0.9} />
      </radialGradient>
      <radialGradient id="hbCore" cx="50%" cy="55%" r="50%">
        <stop offset="0%" stopColor="#FF3D6E" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#FF3D6E" stopOpacity={0} />
      </radialGradient>
      <linearGradient id="hbRainbow" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFD84D" />
        <stop offset="33%" stopColor="#7BFFF0" />
        <stop offset="66%" stopColor="#C77DFF" />
        <stop offset="100%" stopColor="#FF6F91" />
      </linearGradient>
    </defs>
    <circle r={118} fill="#FF8FB8" opacity={0.25 + 0.1 * Math.sin(f / 4)} />
    <circle r={100} fill="url(#hbShell)" />
    <circle r={70} cy={10} fill="url(#hbCore)" opacity={0.85 + 0.15 * Math.sin(f / 5)} />
    <circle r={97} fill="none" stroke="url(#hbRainbow)" strokeWidth={5} opacity={0.7} transform={`rotate(${f * 3})`} />
    <ellipse cx={-38} cy={-44} rx={24} ry={11} fill="white" opacity={0.85} transform="rotate(-35 -38 -44)" />
  </svg>
);

const Caption: React.FC<{ f: number; from: number; to: number; text: string }> = ({ f, from, to, text }) => {
  const o = interpolate(f, [from, from + 10, to - 10, to], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1580, textAlign: "center", opacity: o, translate: `0px ${(1 - o) * 20}px` }}>
      <span style={{ display: "inline-block", padding: "18px 40px", borderRadius: 40, background: "rgba(12,10,40,0.6)", fontFamily: scriptFont, fontSize: 66, color: "#FFF3C4", textShadow: "0 3px 0 rgba(0,0,0,0.35)", lineHeight: 1.2 }}>{text}</span>
    </div>
  );
};

// ---------------------------------------------------------------- the world
const World: React.FC<{ f: number }> = ({ f }) => {
  const pose = poseOf(f);
  const bp = beltPos(f);
  const pw = power(f);
  const born = f >= BIRTH;
  const mouth = mouthOf(pose);

  const dropT = lerp(f, [DROP, DROP_IN], [0, 1], Easing.in(Easing.quad));
  const dropForm = lerp(f, [DROP - 10, DROP], [0, 1]);
  const trap = Math.max(lerp(f, [TRAP1, TRAP1 + 4, TRAP1 + 22, TRAP1 + 30], [0, 1, 1, 0]), lerp(f, [TRAP2, TRAP2 + 4, TRAP2 + 22, TRAP2 + 30], [0, 1, 1, 0]));
  const bubbleR = f >= 970 && f < LAND + 4 ? lerp(f, [970, WOW - 2, LAND - 10, LAND + 3], [0, 190, 190, 120], Easing.out(Easing.quad)) : 0;
  const headY = f < PRINT[0] ? lerp(f, [1152, PRINT[0]], [980, PLATFORM_Y - PACK_H - 20]) : f < PRINT[1] ? lerp(f, PRINT, [PLATFORM_Y - PACK_H - 20, PLATFORM_Y - 10], Easing.linear) : lerp(f, [PRINT[1] + 4, PRINT[1] + 20], [PLATFORM_Y - 10, 980]);
  const print = lerp(f, PRINT, [0, 1], Easing.linear);
  const glow = interpolate(f, [PRINTED, PRINTED + 6, PRINTED + 30], [0, 1, 0.3], clamp);
  const wow = interpolate(f, [WOW, WOW + 6, WOW + 40], [0, 1, 0.4], clamp);

  return (
    <>
      <Hall f={f} power={pw} bolt={bolt(f)} beltPos={bp} />
      {/* sparks */}
      {f >= FLASH2 + 2 && f < POWER + 2
        ? [0, 0.08, 0.16].map((d, i) => {
            const [sx, sy] = pointOnPath(SPARK_PATH, lerp(f, [FLASH2 + 2, POWER], [0, 1], Easing.linear) - d);
            return <div key={i} style={{ position: "absolute", left: sx - 30, top: sy - 30, width: 60, height: 60, borderRadius: "50%", background: "radial-gradient(circle, #FFFFFF 0%, #FFF27A 40%, rgba(255,242,122,0) 70%)" }} />;
          })
        : null}
      {/* the drop of filling */}
      {f >= DROP - 10 && f < DROP_IN ? (
        <div style={{ position: "absolute", left: DRIP[0] - 18, top: DRIP[1] + 10 + (BIRTH_BUBBLE[1] - DRIP[1] - 10) * dropT - 18, width: 36, height: 46, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: "radial-gradient(circle at 40% 35%, #FF8FAA, #E0164A 60%, #A10A30)", scale: dropForm }} />
      ) : null}
      {/* the identical gums */}
      {GUMS.map((k) => {
        const x = gumX(k, f);
        if (x < 230 || x > BELT_END - 40) return null;
        const tScan = crossing(k, SCAN_X);
        const scanned = f >= tScan && f < tScan + 16 && tScan > CLANK + 10 ? interpolate(f, [tScan, tScan + 3, tScan + 12, tScan + 16], [0, 1, 1, 0], clamp) : 0;
        const filled = lerp(f, [fillAt(k) + 8, fillAt(k) + 14], [0, 1]);
        return <LineGum key={k} x={x} filled={filled} scanned={scanned} />;
      })}
      {/* filling drops into every gum */}
      {f >= FILL - 2 && f < FILL + 80
        ? GUMS.map((k) => {
            const x = gumX(k, STOP + 8);
            const t0 = fillAt(k);
            if (x < 230 || x > BELT_END - 40 || f < t0 || f > t0 + 9) return null;
            const y = lerp(f, [t0, t0 + 8], [DRIP_Y + 30, BELT - 90], Easing.in(Easing.quad));
            return <div key={k} style={{ position: "absolute", left: x - 47 - 14, top: y - 18, width: 28, height: 36, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: "radial-gradient(circle at 40% 35%, #FF8FAA, #E0164A 60%, #A10A30)" }} />;
          })
        : null}
      <DripperLights on={lerp(f, [FILL - 6, FILL], [0, 1])} />
      <BirthBubble f={f} />
      {born ? <BoumMonster pose={pose} over={<HeartGlow v={heart(f)} />} style={rigBox(AT, WIDTH)} /> : null}
      {bubbleR > 1 ? <HeartBubble x={mouth[0]} y={mouth[1] + bubbleR * 0.42} r={bubbleR} f={f} /> : null}
      <Trapdoor open={trap} />
      <BinFront />
      <ScannerFX f={f} state={scannerState(f)} power={pw} />
      <Taster probe={f >= WOW - 30 ? Math.min(probeY(f), mouth[1] + bubbleR * 0.42 - bubbleR) : probeY(f)} needle={needle(f)} wow={wow} />
      <FirstPack print={print} glow={glow} />
      {f >= 1152 ? <PrinterHead y={headY} on={f >= PRINT[0] && f < PRINT[1] ? 1 : 0.3} /> : null}
      {/* « Bof... » at each taste */}
      {TASTED.map((t) => {
        const s = interpolate(f, [t + 2, t + 6, t + 16, t + 20], [0, 1, 1, 0], clamp);
        return s > 0 ? (
          <div key={t} style={{ position: "absolute", left: TASTE_X + 120, top: 1460, fontFamily: displayFont, fontSize: 64, color: "#9AA0E8", scale: s, rotate: "-6deg" }}>
            Bof…
          </div>
        ) : null;
      })}
      {/* pops + sparkles */}
      <PopBurst f={f} at={BIRTH} x={BIRTH_BUBBLE[0]} y={BELT - 110} r={110} tones={PINK_GUM} n={12} />
      <PopBurst f={f} at={LAND + 4} x={mouth[0]} y={mouth[1] + 50} r={120} tones={PINK_GUM} n={12} />
      {f >= WOW && f < WOW + 50
        ? Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const d = 200 + (f - WOW) * 9;
            return <div key={i} style={{ position: "absolute", left: mouth[0] + Math.cos(a) * d - 18, top: mouth[1] + 60 + Math.sin(a) * d - 18, width: 36, height: 36, background: ["#FFD84D", "#FF6F91", "#7BFFF0", "#C77DFF"][i % 4], clipPath: "polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)", opacity: 1 - (f - WOW) / 50 }} />;
          })
        : null}
      {f >= PRINTED && f < PRINTED + 40
        ? Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2 + f * 0.05;
            const d = 260 + ((f - PRINTED) % 20) * 6;
            return <div key={i} style={{ position: "absolute", left: PACK_X + Math.cos(a) * d - 14, top: PLATFORM_Y - PACK_H / 2 + Math.sin(a) * d * 1.3 - 14, width: 28, height: 28, background: "#FFF3C4", clipPath: "polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)", opacity: 1 - (f - PRINTED) / 40 }} />;
          })
        : null}
      <Say f={f} from={1206} to={1224} x={mouth[0] + 30} y={mouth[1] - 250} text="C'est… moi ?!" color={colors.logoRed} tail="left" size={60} />
      <div style={{ position: "absolute", left: TRAP_X - 130, top: BELT - 10, width: 260, height: 10, background: "repeating-linear-gradient(90deg, #FFD84D 0 15px, #2B2560 15px 30px)", opacity: 0.8 }} />
    </>
  );
};

// ---------------------------------------------------------------- camera
const MAIN: Cam[] = [
  [HALL_IN, 760, 1650, 0.6], // rows of identical gums, by moonlight
  [165, 860, 1650, 0.6],
  [FLASH2, 640, 1000, 0.55], // the storm through the windows
  [POWER, 560, 1400, 0.7],
  [250, 640, 1800, 1.3], // the bubble machine + the drip
  [FALL, 640, 1820, 1.3],
  [BOUNCE + 4, 640, 2050, 1.45], // the bubble lands in the row
  [BIRTH, 640, 2060, 1.6],
  [406, 640, 2060, 1.6],
  [418, 660, 2080, 1.3], // him and his neighbours
  [452, 660, 2080, 1.3],
  [466, 900, 1500, 0.55], // pull out: one tiny different bubble in a giant factory
  [478, 900, 1500, 0.55],
  [500, 1120, 2050, 1.0], // marching
  [585, 1840, 2000, 0.85], // the scanner
  [TRAP1 + 6, 1950, 2150, 0.85],
  [640, BIN_X, 2330, 1.05], // the bin
  [668, BIN_X - 60, 2300, 0.95],
  [700, 1880, 2200, 0.85], // second try
  [TRAP2 + 18, 1980, 2300, 0.85],
  [LOW + 10, BIN_X, 2420, 1.15], // the low point
  [812, BIN_X, 2460, 1.35],
  [834, 2470, 2200, 0.62], // « Bof »: the bin and the tasting machine
  [856, 2470, 2200, 0.62],
  [870, BIN_X, 2420, 1.25], // the decision
  [900, BIN_X, 2400, 1.2],
  [940, 2550, 2150, 0.8],
  [STOP + 4, 2880, 2000, 0.92],
  [WOW, 2880, 1950, 0.9],
  [FILL + 2, 2700, 1900, 0.62], // every gum gets a heart (pan along the wave)
  [FILL + 50, 1300, 1950, 0.66],
  [1080, 1600, 1750, 0.5],
  [1120, 3800, 1400, 0.6],
  [LAND, 4500, 1550, 0.95],
  [1180, 4560, 1500, 0.95],
  [PRINTED, 4560, 1500, 0.95],
  [1220, 4480, 1540, 1.1],
  [ORIGIN_END, 4470, 1540, 1.15],
];

export const OriginScene: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camAt(MAIN, f);
  const shake = (from: number, amt: number) => (f >= from && f < from + 10 ? (1 - (f - from) / 10) * amt : 0);
  const s = shake(FLASH2, 10) + shake(CLANK, 5) + shake(ALARM1, 6) + shake(ALARM2, 8) + shake(WOW, 10);
  const cx = cam.cx + Math.sin(f * 2.7) * s;
  const cy = cam.cy + Math.cos(f * 3.1) * s;
  const exterior = interpolate(f, [HALL_IN - 4, HALL_IN + 8], [1, 0], clamp);
  const dark = 0.4 * (1 - power(f)) + 0.04 + (f >= LOW && f < DECIDE ? lerp(f, [LOW, 780, 840, DECIDE], [0, 0.25, 0.25, 0]) : 0);
  const warm = f >= FILL ? lerp(f, [FILL, FILL + 60], [0, 0.18]) : 0;
  const alarmTint = near(f, [ALARM1, ALARM2], 0, 24) ? 0.18 * (0.5 + 0.5 * Math.sign(Math.sin(f * 1.3))) : 0;

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#151845" }}>
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${540 - cx * cam.z}px, ${960 - cy * cam.z}px) scale(${cam.z})` }}>
        <World f={f} />
      </div>
      <AbsoluteFill style={{ background: `rgba(8,10,40,${dark})` }} />
      <AbsoluteFill style={{ background: "#FF4F4F", opacity: alarmTint }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, rgba(255,150,190,1) 0%, rgba(255,150,190,0) 70%)", opacity: warm }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 50%, rgba(5,5,25,0.35) 100%)" }} />
      <AbsoluteFill style={{ background: "white", opacity: bolt(f) * 0.85 }} />
      {exterior > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: exterior }}>
          <Exterior f={f} />
        </div>
      ) : null}

      <SeriesTitle episode={5} title="La Naissance de Boum Boum" titleColor={colors.logoRed} outAt={56} />
      <Caption f={f} from={14} to={HALL_IN} text="Il était une fois… une usine de bonbons." />
      <Caption f={f} from={104} to={168} text="Tous les bonbons y étaient… pareils." />
      <Caption f={f} from={410} to={472} text="…mais lui avait un cœur coulant." />
      <Caption f={f} from={746} to={826} text="Il voulait juste être comme les autres…" />
      <Caption f={f} from={FILL + 6} to={1100} text="Ce qui te rend différent…" />
      <Caption f={f} from={1210} to={ORIGIN_END + 6} text="…c'est ce qui te rend unique." />
      <Pop f={f} at={BIRTH} out={BIRTH + 14} top={420}>
        <div style={{ fontFamily: displayFont, fontSize: 150, ...candyText("#FFE3EF", "#B8578C", 13), rotate: "-6deg" }}>POP !</div>
      </Pop>
      {[ALARM1, ALARM2].map((a, i) => (
        <Pop key={a} f={f} at={a} out={a + 22} top={330}>
          <div style={{ fontFamily: displayFont, fontSize: 170 + i * 20, ...candyText("#FFFFFF", "#D11A2A", 16), rotate: `${-6 + Math.sin(f * 2) * 2}deg` }}>DÉFAUT !</div>
        </Pop>
      ))}
      <Pop f={f} at={WOW} out={WOW + 30} top={300}>
        <div style={{ fontFamily: displayFont, fontSize: 210, ...candyText("#FFD84D", colors.logoRed, 17), rotate: "-6deg" }}>WAOUH !</div>
      </Pop>
    </AbsoluteFill>
  );
};
