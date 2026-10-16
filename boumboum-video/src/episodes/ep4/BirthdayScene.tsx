import type React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { SeriesTitle } from "../../brand/SeriesTitle";
import { alternate, hop, rigBox, tighten } from "../../final/kit";
import { BoumMonster } from "../../rig/BoumMonster";
import { coolBlink, MELO_COOL } from "../../rig/meloKeys";
import { blinkAt, type Key, sortKeys } from "../../rig/pose";
import { candyText, colors, displayFont } from "../../theme";
import { DustPuff } from "../ep2/CitySet";
import { Bubble, type Cam, camAt, clamp, lerp, makeDuo, MELO_GUM, PINK_GUM, Pop, PopBurst, Say } from "../shared/stage";
import { Banner, BubbleBalloon, Cake, Calendar, Confetti, DOOR_X, Gift, GROUND, Home, popIn, Table, TABLE_TOP, TABLE_X } from "./HomeSet";

// "Les Aventures Boum Boum", Episode 4: "Joyeux anniversaire, Mélo !".
// The pink monster prepares a surprise party at home; everything goes wrong;
// Mélo is touched anyway. WORLD coordinates + a keyed virtual camera.

const WIDTH = 440;
const SCALE = WIDTH / 400;
const PINK_AT: [number, number] = [630, GROUND];
const MELO_AT: [number, number] = [1260, GROUND];
const XP = (worldX: number) => (worldX - PINK_AT[0]) / SCALE;
const XM = (worldX: number) => (worldX - MELO_AT[0]) / SCALE;

// beats (30 fps)
const NOTICE = 126;
const IDEA = 184;
const BANNER = 202;
const BALLOONS = [212, 232, 252]; // start blowing
const POPS = [282, 287, 292];
const TOSS = 304;
const CHERRY_LANDS = 318;
const COLLAPSE = 340;
const DING = 376;
const BLOCK = 404;
const DOOR = 410;
const MELO_IN = 420;
const YO = 462;
const REVEAL = 506;
const TOUCHED = 526;
const HUG = 602;
const GIFT = 652;
const HANDOVER = 666;
const CANDLES = 712;
const MERGE = 744;
export const WISH_POP = 766;
export const BDAY_END = 818;

// ---------------------------------------------------------------- the pink monster
const PINK_KEYS: Key[] = tighten(
  sortKeys([
    { f: 0, x: XP(-250), y: 0, turn: 0.15, lookX: 0.4, armL: 20, armR: 20 },
    ...hop(70, XP(-250), XP(20), 100),
    ...hop(89, XP(20), XP(330), 100),
    ...hop(108, XP(330), XP(630), 100),
    // ...wait. What's the date today?
    { f: NOTICE, turn: 0.15, lookX: 0.4, lookY: 0, eyeScale: 1 },
    { f: NOTICE + 6, turn: -0.45, lookX: -0.9, lookY: -0.5, eyeScale: 1.1, browY: -6, ease: "out" },
    { f: NOTICE + 12, eyeScale: 1.35, pupil: 0.7, browY: -20, mouthOpen: 0.9, mouthWidth: 0.45, sy: 1.08, ease: "snap" },
    { f: 176, eyeScale: 1.35, sy: 1.04, mouthOpen: 0.9 },
    // the idea!
    { f: IDEA - 2, sy: 0.92, armR: 8, turn: -0.45 },
    { f: IDEA, sy: 1.04, turn: 0, lookX: 0.3, lookY: -0.5, eyeScale: 1.15, pupil: 1, browY: -16, armR: 150, curlR: -0.3, mouthOpen: 0.45, mouthWidth: 0.7, smile: 1, ease: "snap" },
    { f: IDEA + 5, sy: 1, ease: "out" },
    ...alternate(IDEA + 10, 206, 4, { y: -16, armL: -40 }, { y: 0, armL: -20 }),
    { f: 206, armR: 8, curlR: 0, armL: 20, y: 0, lookY: 0, eyeScale: 1, browY: -6, mouthOpen: 0.85, mouthWidth: 1 },
    // three bubble-balloons
    ...BALLOONS.flatMap((b, i) => [
      { f: b, cheeks: 0, mouthOpen: 0.85, mouthWidth: 1, lookY: 0, sy: 1 },
      { f: b + 4, cheeks: 1, mouthOpen: 0.3, mouthWidth: 0.28, sy: 1.05, lookY: -0.3, lookX: [-0.3, 0.2, 0.6][i], ease: "out" as const },
      { f: b + 14, cheeks: 1, sy: 1.08 },
      { f: b + 16, cheeks: 0, mouthOpen: 0.9, mouthWidth: 1, sy: 0.96, lookY: -0.7, ease: "snap" as const },
    ]),
    { f: 272, armL: 20, armR: 20, squint: 0 },
    { f: 278, armL: 130, armR: 130, squint: 1, ease: "out" },
    // pop, pop, pop
    ...POPS.flatMap((p) => [
      { f: p - 1, sy: 1, blink: 0 },
      { f: p, sy: 0.9, blink: 1, armL: 60, armR: 60, squint: 0, ease: "snap" as const },
      { f: p + 3, sy: 1, ease: "out" as const },
    ]),
    { f: 296, blink: 0, armL: 8, armR: 8, browTilt: 16, smile: -0.6, mouthOpen: 0.3, mouthWidth: 0.6, lookY: -0.4 },
    // the cherry on top
    { f: TOSS - 6, browTilt: 0, smile: 1, mouthOpen: 0.85, mouthWidth: 1, turn: 0.35, lookX: 0.8, lookY: -0.3, armR: -20, curlR: 0.3 },
    { f: TOSS, armR: 110, curlR: -0.4, rot: 3, ease: "snap" },
    { f: CHERRY_LANDS, armR: 60, curlR: 0, rot: 0, browY: -8, squint: 1, armL: 60 },
    { f: 326, squint: 0, eyeScale: 1.05, armL: 20, armR: 20 },
    { f: 336, eyeScale: 1.25, browTilt: 14, mouthOpen: 0.5, mouthWidth: 0.45, smile: -0.4 },
    { f: COLLAPSE, eyeScale: 1.4, pupil: 0.6, browY: -24, browTilt: 0, mouthOpen: 0.9, mouthWidth: 0.42, sy: 1.1, ease: "snap" },
    { f: COLLAPSE + 10, eyeScale: 1.1, pupil: 1, sy: 1 },
    // facepalm
    { f: 350, armR: 20, squint: 0, browTilt: 14 },
    { f: 356, armR: -92, curlR: 0.3, squint: 1, smile: -1, mouthOpen: 0.1, mouthWidth: 0.6, browY: 0, sy: 0.95, ease: "out" },
    { f: 370, armR: -92, sy: 0.95 },
    // DING DONG!
    { f: DING, armR: 8, curlR: 0, squint: 0, y: 0, smile: -1 },
    { f: DING + 2, y: -110, sy: 1.25, eyeScale: 1.4, pupil: 0.5, browY: -26, mouthOpen: 0.95, mouthWidth: 0.42, smile: 1, armL: 160, armR: 160, turn: 0.4, lookX: 0.9, ease: "snap" },
    { f: DING + 8, sy: 1.12, ease: "out" },
    { f: DING + 10, x: XP(630), run: 0 },
    { f: DING + 12, y: 0, sy: 1, ease: "in" },
    { f: DING + 14, run: 1, rot: 8, armL: 130, armR: 150, ease: "out" },
    ...alternate(DING + 14, BLOCK - 4, 4, { y: -18, armL: 150, armR: 120 }, { y: 0, armL: 120, armR: 150 }),
    { f: BLOCK - 2, x: XP(TABLE_X), y: 0, run: 1, rot: 8 },
    // blocks the table, nervous grin
    { f: BLOCK, run: 0, rot: 0, sy: 0.86, turn: 0, lookX: 0.8, armL: 95, armR: 95, curlL: -0.3, curlR: -0.3, eyeScale: 1.12, pupil: 0.9, browTilt: 14, browY: -6, mouthOpen: 0.55, mouthWidth: 0.95, smile: 1, ease: "snap" },
    { f: BLOCK + 6, sy: 1, ease: "out" },
    ...alternate(BLOCK + 8, REVEAL - 4, 3, { x: XP(TABLE_X) + 1.2 }, { x: XP(TABLE_X) - 1.2 }).map((k) => ({ ...k, ease: "linear" as const })),
    { f: 482, lookX: 0.8, mouthOpen: 0.55 },
    { f: 486, mouthOpen: 0.3, mouthWidth: 0.5, smile: 0.4, ease: "out" },
    ...blinkAt(470),
    // ...steps aside: the reveal
    { f: REVEAL, x: XP(TABLE_X), armL: 95, armR: 95, curlL: -0.3, curlR: -0.3, sy: 1 },
    ...hop(REVEAL, XP(TABLE_X), XP(600), 50),
    { f: REVEAL + 20, armL: -30, armR: -30, turn: 0.35, lookX: 0.8, browTilt: 18, browY: 0, eyeScale: 1.05, mouthOpen: 0.1, mouthWidth: 0.5, smile: -0.6 },
    ...blinkAt(560),
    // the hug
    { f: HUG - 4, rot: 0, bend: 0, turn: 0.35, armR: -30, squint: 0, cheeks: 0 },
    { f: HUG + 2, eyeScale: 1.2, browTilt: 0, browY: -12, mouthOpen: 0.6, mouthWidth: 0.6, smile: 0.6, sy: 1.05, ease: "snap" },
    { f: HUG + 8, turn: 0.4, lookX: 0.6, rot: 7, bend: 12, armR: 40, curlR: 0.6, armL: 30, squint: 1, eyeScale: 1, mouthOpen: 0.6, mouthWidth: 1, smile: 1, cheeks: 0.8, sy: 1, ease: "out" },
    ...alternate(HUG + 12, GIFT - 6, 10, { rot: 9, bend: 14 }, { rot: 5, bend: 10 }),
    // the gift
    { f: GIFT - 4, rot: 0, bend: 0, armR: 40, armL: 30, squint: 0, curlR: 0, turn: 0.35 },
    { f: GIFT + 4, armL: -46, armR: -46, squint: 0, mouthOpen: 0.85, browY: -8, ease: "out" },
    { f: HANDOVER - 2, armL: -46, armR: -46 },
    { f: HANDOVER + 4, armL: 30, armR: 30 },
    { f: 690, squint: 1, mouthOpen: 1 },
    // make a wish: blow a bubble over the cake
    { f: CANDLES - 4, squint: 0, mouthOpen: 0.85, cheeks: 0, turn: 0.35, lookX: 0.7, lookY: -0.3, armL: 20, armR: 20 },
    { f: CANDLES + 4, cheeks: 1, mouthOpen: 0.3, mouthWidth: 0.28, sy: 1.04, ease: "out" },
    { f: MERGE + 4, eyeScale: 1.15, browY: -10 },
    { f: WISH_POP, eyeScale: 1.3, cheeks: 0, mouthOpen: 0.9, mouthWidth: 0.6, browY: -20, sy: 0.9, ease: "snap" },
    // party!
    { f: WISH_POP + 6, eyeScale: 1, squint: 1, mouthOpen: 1, mouthWidth: 1, smile: 1, sy: 1, armL: 140, armR: 140, turn: 0.15, lookX: 0.4, ease: "out" },
    ...alternate(WISH_POP + 8, BDAY_END, 6, { y: -40, sy: 1.04, armL: 150, armR: 120, rot: 4 }, { y: 0, sy: 0.94, armL: 120, armR: 150, rot: -4 }),
  ]),
);

// ---------------------------------------------------------------- Mélo
const MELO_KEYS: Key[] = tighten(
  sortKeys([
    { f: 0, ...MELO_COOL, x: XM(DOOR_X + 100), y: 0, turn: -0.3, lookX: -0.4, armL: 8, armR: 8, eyeScale: 1, squint: 0, cheeks: 0 },
    ...hop(MELO_IN, XM(DOOR_X + 100), XM(1450), 70),
    ...hop(MELO_IN + 19, XM(1450), 0, 70),
    { f: MELO_IN + 40, armL: -30, curlL: 1.6, rot: -2 },
    // "Yo."
    { f: YO, armR: 8, curlR: 0, turn: -0.3, lookX: -0.5 },
    { f: YO + 4, armR: 118, curlR: 0.9, browY: -6, rot: -3, ease: "snap" },
    { f: YO + 10, armR: 118, ease: "hold" },
    { f: YO + 15, armR: 70, curlR: -0.5, mouthOpen: 0.5, mouthWidth: 0.5, smile: 0.6, ease: "out" },
    { f: YO + 26, armR: 8, curlR: 0, rot: 0, ...MELO_COOL },
    // ...why is he standing like that? one eyebrow up
    { f: 488, browTilt: 0, lookX: -0.5 },
    { f: 494, browTilt: -12, browY: -2, lookX: -0.7, smile: 0.2, mouthOpen: 0, mouthWidth: 0.6, ease: "out" },
    ...coolBlink(500),
    // the reveal: his cool cracks
    { f: REVEAL + 6, browTilt: -12, lookX: -0.7, lookY: 0, blink: 0.24, eyeScale: 1 },
    { f: REVEAL + 14, lookX: -0.5, lookY: 0.4, ease: "out" },
    { f: TOUCHED, blink: 0.24, eyeScale: 1, browTilt: -12 },
    { f: TOUCHED + 14, blink: 0, eyeScale: 1.18, pupil: 1.15, browTilt: 14, browY: -6, lookY: 0.1, lookX: -0.6, armL: 8, curlL: 0, rot: 0, ease: "out" },
    { f: 544, mouthOpen: 0, mouthWidth: 0.55, smile: 0.3 },
    ...alternate(546, 576, 3, { mouthWidth: 0.5, smile: 0.2 }, { mouthWidth: 0.58, smile: 0.5 }),
    { f: 578, smile: 1, mouthOpen: 0.5, mouthWidth: 0.8 },
    // hop over to his friend
    ...hop(582, 0, XM(840), 60),
    { f: HUG + 2, turn: -0.4, lookX: -0.6, rot: -7, bend: -12, armL: 55, curlL: -0.6, armR: 30, squint: 1, blink: 0, eyeScale: 1, pupil: 1, mouthOpen: 0.5, mouthWidth: 0.8, smile: 1, cheeks: 1, browTilt: 0, browY: -4, ease: "out" },
    ...alternate(HUG + 12, GIFT - 6, 10, { rot: -9, bend: -14 }, { rot: -5, bend: -10 }),
    // the gift
    { f: GIFT - 2, rot: 0, bend: 0, armL: 8, curlL: 0, armR: 8, squint: 0, cheeks: 0.4, blink: 0, mouthOpen: 0.4, mouthWidth: 0.7, smile: 1, eyeScale: 1.15 },
    { f: HANDOVER, armL: -46, armR: -46, eyeScale: 1.2 },
    { f: HANDOVER + 6, armR: 140, curlR: -0.3, armL: 40, squint: 1, mouthOpen: 0.9, mouthWidth: 0.9, browY: -10, sy: 1.05, ease: "snap" },
    { f: HANDOVER + 12, sy: 1, ease: "out" },
    { f: 696, armR: 140, armL: 40, squint: 1 },
    // to the other side of the table
    { f: 700, armR: -46, armL: -46, curlR: 0, squint: 0, eyeScale: 1, mouthOpen: 0.5, mouthWidth: 0.7, browY: 0 },
    ...hop(702, XM(840), XM(1100), 60).map((k) => ({ ...k, armL: undefined, armR: undefined })),
    { f: CANDLES - 2, turn: -0.35, lookX: -0.7, lookY: -0.3, blink: 0.1, cheeks: 0 },
    { f: CANDLES + 6, cheeks: 1, mouthOpen: 0.3, mouthWidth: 0.28, smile: 0.6, sy: 1.04, ease: "out" },
    { f: MERGE + 4, eyeScale: 1.15, browY: -10, blink: 0 },
    { f: WISH_POP, eyeScale: 1.3, cheeks: 0, mouthOpen: 0.9, mouthWidth: 0.6, browY: -20, sy: 0.9, ease: "snap" },
    // party! (he dances too)
    { f: WISH_POP + 6, eyeScale: 1, squint: 1, mouthOpen: 1, mouthWidth: 1, smile: 1, sy: 1, turn: -0.15, lookX: -0.4, ease: "out" },
    ...alternate(WISH_POP + 10, BDAY_END, 6, { y: -30, sy: 1.04, rot: -4 }, { y: 0, sy: 0.95, rot: 4 }),
  ]).map((k) => {
    const out = { ...k };
    if (out.armL === undefined) delete out.armL;
    if (out.armR === undefined) delete out.armR;
    return out;
  }),
);

const { poseOf, mouthOf, handOf } = makeDuo({ pinkAt: PINK_AT, meloAt: MELO_AT, width: WIDTH, pinkKeys: PINK_KEYS, meloKeys: MELO_KEYS });

// ---------------------------------------------------------------- props
const BALLOON_TARGETS: [number, number, string, string][] = [
  [520, 560, "#F9A6CB", "#FFE3EF"],
  [860, 500, "#A8E68A", "#EFFFE0"],
  [1200, 560, "#F9A6CB", "#FFE3EF"],
];

const Heart: React.FC<{ x: number; y: number; s: number; wob: number }> = ({ x, y, s, wob }) => (
  <svg style={{ position: "absolute", left: x - 130 * s, top: y - 120 * s, width: 260 * s, height: 240 * s, overflow: "visible" }} viewBox="-130 -120 260 240">
    <defs>
      <linearGradient id="heartTone" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#F38DBE" />
        <stop offset="45%" stopColor="#F9B3D2" />
        <stop offset="55%" stopColor="#BDEB9F" />
        <stop offset="100%" stopColor="#7FD15A" />
      </linearGradient>
    </defs>
    <g transform={`scale(${1 + wob} ${1 - wob})`} opacity={0.94}>
      <path d="M 0 100 C -60 60 -120 20 -120 -40 C -120 -90 -70 -115 -30 -100 C -15 -94 -6 -84 0 -72 C 6 -84 15 -94 30 -100 C 70 -115 120 -90 120 -40 C 120 20 60 60 0 100 Z" fill="url(#heartTone)" stroke="rgba(255,255,255,0.8)" strokeWidth={4} />
      <ellipse cx={-62} cy={-58} rx={24} ry={11} fill="white" opacity={0.85} transform="rotate(-35 -62 -58)" />
    </g>
  </svg>
);

const SmallHeart: React.FC<{ x: number; y: number; s: number; o: number }> = ({ x, y, s, o }) => (
  <svg style={{ position: "absolute", left: x - 30 * s, top: y - 28 * s, width: 60 * s, height: 56 * s, opacity: o }} viewBox="-30 -28 60 56">
    <path d="M 0 24 C -14 14 -28 4 -28 -10 C -28 -22 -16 -28 -7 -24 C -3 -22 -1 -19 0 -16 C 1 -19 3 -22 7 -24 C 16 -28 28 -22 28 -10 C 28 4 14 14 0 24 Z" fill="#FF4F8B" />
  </svg>
);

// sweat drop (pink) / tear (Mélo), in rig coordinates
const Drop: React.FC<{ x: number; y: number; o: number; color: string }> = ({ x, y, o, color }) => (
  <path d={`M ${x} ${y - 16} C ${x + 10} ${y - 2} ${x + 10} ${y + 10} ${x} ${y + 10} C ${x - 10} ${y + 10} ${x - 10} ${y - 2} ${x} ${y - 16} Z`} fill={color} opacity={o} stroke="white" strokeWidth={2} />
);

// ---------------------------------------------------------------- the world
const World: React.FC<{ f: number }> = ({ f }) => {
  const pink = poseOf("pink", f);
  const melo = poseOf("melo", f);
  const pm = mouthOf("pink", pink);
  const mm = mouthOf("melo", melo);

  // balloons: grow at the mouth, then drift up to the ceiling
  const balloons = BALLOONS.map((b, i) => {
    const [tx, ty, tone, light] = BALLOON_TARGETS[i];
    if (f < b + 4 || f >= POPS[i]) return null;
    const mouth = mouthOf("pink", poseOf("pink", Math.min(f, b + 16)));
    const r = lerp(f, [b + 4, b + 15], [0, 54], Easing.out(Easing.quad));
    if (f < b + 16) return <Bubble key={i} id={`bb${i}`} x={mouth[0]} y={mouth[1] + r * 0.42} r={r} tone={i === 1 ? MELO_GUM : PINK_GUM} />;
    const t = lerp(f, [b + 16, b + 34], [0, 1], Easing.out(Easing.cubic));
    const start: [number, number] = [mouth[0], mouth[1] + 54 * 0.42];
    return <BubbleBalloon key={i} x={start[0] + (tx - start[0]) * t} y={start[1] + (ty - start[1]) * t} r={54} tone={tone} light={light} />;
  });

  // cherry: tossed from his hand onto the top of the cake
  const cherryFrom = handOf("pink", poseOf("pink", TOSS), "R");
  const cherryTo: [number, number] = [TABLE_X, TABLE_TOP - 290];
  const ct = lerp(f, [TOSS, CHERRY_LANDS], [0, 1], Easing.linear);
  const cherryAt: [number, number] = f < TOSS ? handOf("pink", pink, "R") : [cherryFrom[0] + (cherryTo[0] - cherryFrom[0]) * ct, cherryFrom[1] + (cherryTo[1] - cherryFrom[1]) * ct - Math.sin(Math.PI * ct) * 260];
  const wobble = f >= CHERRY_LANDS && f < COLLAPSE ? Math.sin((f - CHERRY_LANDS) * 0.9) * lerp(f, [CHERRY_LANDS, COLLAPSE], [1, 9], Easing.in(Easing.quad)) : 0;
  const squash = lerp(f, [COLLAPSE, COLLAPSE + 5], [0, 1], Easing.out(Easing.back(1.5)));

  // gift
  const giftScale = lerp(f, [GIFT, GIFT + 6], [0, 1], Easing.out(Easing.back(2)));
  const pinkHeld =
    f >= GIFT && f < HANDOVER ? (
      <g transform={`translate(200 390) scale(${giftScale * 0.85})`}>
        <Gift />
      </g>
    ) : null;
  const raised = f >= HANDOVER + 2 && f < 700;
  const meloHeld =
    f >= HANDOVER && !raised ? (
      <g transform={`translate(200 396) scale(0.85)`}>
        <Gift />
      </g>
    ) : null;
  const meloHand = handOf("melo", melo, "R");

  // the wish: two bubbles meet over the cake and merge into a heart
  const meet: [number, number] = [TABLE_X, TABLE_TOP - 300];
  const travel = lerp(f, [CANDLES + 6, MERGE], [0, 1], Easing.inOut(Easing.quad));
  const br = f < MERGE + 6 ? lerp(f, [CANDLES + 6, MERGE, MERGE + 6], [0, 70, 0]) : 0;
  const pinkBall: [number, number] = [pm[0] + (meet[0] - 60 - pm[0]) * travel, pm[1] + (meet[1] - pm[1]) * travel];
  const meloBall: [number, number] = [mm[0] + (meet[0] + 60 - mm[0]) * travel, mm[1] + (meet[1] - mm[1]) * travel];
  const heartS = f < WISH_POP ? lerp(f, [MERGE, MERGE + 10], [0, 1], Easing.out(Easing.back(2))) : 0;

  const sweat = f >= BLOCK && f < REVEAL + 10 ? <Drop x={318} y={130 + ((f - BLOCK) % 30) * 1.2} o={1} color="#9FE0F7" /> : null;
  const tear = f >= TOUCHED + 18 && f < HUG ? <Drop x={270} y={lerp(f, [TOUCHED + 18, 590], [234, 284])} o={lerp(f, [TOUCHED + 18, TOUCHED + 24, 588, HUG], [0, 1, 1, 0])} color="#BFEFFF" /> : null;

  return (
    <>
      <Home door={lerp(f, [DOOR, DOOR + 8], [0, 1], Easing.out(Easing.cubic))} />
      <svg viewBox="-900 0 3600 2600" style={{ position: "absolute", left: -900, top: 0, width: 3600, height: 2600, overflow: "visible" }}>
        <Calendar circle={lerp(f, [146, 162], [0, 1])} />
        <Banner appear={popIn(f, BANNER)} drop={lerp(f, [394, 402], [0, 1], Easing.out(Easing.bounce))} />
      </svg>
      {balloons}
      <Table />
      <Cake x={TABLE_X} y={TABLE_TOP} wobble={wobble} squash={squash} />
      {f >= TOSS - 6 && f < CHERRY_LANDS + 22 ? (
        <div style={{ position: "absolute", left: cherryAt[0] - 16, top: (f >= CHERRY_LANDS ? cherryTo[1] + Math.sin(Math.max(0, f - CHERRY_LANDS) * 0.9) * 4 : cherryAt[1]) - 16, width: 32, height: 32, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #FF8FA8, #C70D3A)", rotate: `${wobble}deg`, opacity: f < COLLAPSE ? 1 : 0 }} />
      ) : null}
      {f >= MELO_IN - 6 ? <BoumMonster pose={melo} skin="melo" held={meloHeld} over={<g>{tear}</g>} style={rigBox(MELO_AT, WIDTH)} /> : null}
      <BoumMonster pose={pink} held={pinkHeld} over={<g>{sweat}</g>} style={rigBox(PINK_AT, WIDTH)} />
      {/* during the hug Mélo's arm goes around his friend: draw Mélo on top */}
      {f >= HUG && f < GIFT ? <BoumMonster pose={melo} skin="melo" style={rigBox(MELO_AT, WIDTH)} /> : null}
      {raised ? (
        <svg style={{ position: "absolute", left: meloHand[0] - 120, top: meloHand[1] - 110, width: 240, height: 160, overflow: "visible" }} viewBox="-120 -80 240 160">
          <g transform={`scale(${0.95}) rotate(-8)`}>
            <Gift />
          </g>
        </svg>
      ) : null}
      {/* hearts during the hug */}
      {f >= HUG + 6 && f < GIFT + 6
        ? Array.from({ length: 7 }, (_, i) => {
            const t = ((f - HUG - 6 + i * 7) % 40) / 40;
            return <SmallHeart key={i} x={730 + Math.sin(i * 2.1 + t * 6) * 60 + (i - 3) * 30} y={1050 - t * 300} s={0.8 + (i % 3) * 0.3} o={Math.sin(Math.PI * t)} />;
          })
        : null}
      {/* wish bubbles + heart */}
      {br > 1 ? <Bubble id="wishP" x={pinkBall[0]} y={pinkBall[1]} r={br} tone={PINK_GUM} /> : null}
      {br > 1 ? <Bubble id="wishM" x={meloBall[0]} y={meloBall[1]} r={br} tone={MELO_GUM} /> : null}
      {heartS > 0 ? <Heart x={meet[0]} y={meet[1] - 40 - lerp(f, [MERGE, WISH_POP], [0, 60])} s={heartS * 1.05} wob={Math.sin(f * 1.5) * 0.03} /> : null}
      {POPS.map((p, i) => (
        <PopBurst key={i} f={f} at={p} x={BALLOON_TARGETS[i][0]} y={BALLOON_TARGETS[i][1]} r={54} tones={i === 1 ? MELO_GUM.slice(1) : PINK_GUM.slice(1)} n={8} />
      ))}
      <PopBurst f={f} at={WISH_POP} x={meet[0]} y={meet[1] - 100} r={130} tones={[...PINK_GUM.slice(1), ...MELO_GUM.slice(1)]} n={16} />
      {/* dust */}
      {[[86, 20], [105, 330], [124, 630], [BLOCK, TABLE_X], [MELO_IN + 15, 1450], [MELO_IN + 34, 1260], [REVEAL + 15, 600], [597, 840], [717, 1100]].map(([at, x], i) => (
        <DustPuff key={i} at={at} x={x} y={GROUND} />
      ))}
      {/* speech */}
      <Say f={f} from={YO + 4} to={YO + 24} x={mm[0] - 30} y={mm[1] - 290} text="Yo." color="#2E9E3E" tail="right" />
      <Say f={f} from={482} to={504} x={pm[0] + 40} y={pm[1] - 300} text="Surprise… ?" color={colors.logoRed} tail="left" size={56} />
      <Say f={f} from={HANDOVER + 8} to={698} x={mm[0] + 20} y={mm[1] - 320} text="Merci !" color="#2E9E3E" tail="right" />
      {/* "POP!" on the balloons */}
      {POPS.map((p, i) => {
        const s = interpolate(f, [p, p + 3, p + 10, p + 14], [0, 1, 1, 0], clamp);
        return s > 0 ? (
          <div key={i} style={{ position: "absolute", left: BALLOON_TARGETS[i][0] - 90, top: BALLOON_TARGETS[i][1] - 60, width: 180, textAlign: "center", fontFamily: displayFont, fontSize: 64, color: "white", WebkitTextStroke: "6px #E3123B", paintOrder: "stroke", scale: s, rotate: `${(i - 1) * 10}deg` }}>
            POP!
          </div>
        ) : null;
      })}
    </>
  );
};

// ---------------------------------------------------------------- camera
const MAIN: Cam[] = [
  [0, 760, 150, 0.8],
  [62, 760, 150, 0.8],
  [100, 520, 1140, 0.9], // tilt down: the living room
  [NOTICE, 560, 1140, 0.9],
  [142, 380, 900, 2.0], // the calendar
  [174, 380, 900, 2.0],
  [IDEA, 620, 1150, 1.05],
  [BANNER, 620, 1150, 1.05],
  [216, 820, 1000, 0.82], // wide: banner + balloons
  [296, 820, 1000, 0.82],
  [310, 760, 1180, 1.0], // the cake
  [372, 760, 1180, 1.0],
  [386, 1060, 1120, 0.85], // the door
  [REVEAL, 1060, 1120, 0.85],
  [TOUCHED + 2, 1000, 1150, 0.88], // wide: Mélo sees the mess
  [TOUCHED + 22, 1220, 1170, 1.42], // push on Mélo
  [580, 1230, 1170, 1.45],
  [HUG + 2, 740, 1150, 1.0],
  [700, 760, 1150, 1.0],
  [CANDLES + 10, 850, 1100, 0.9],
  [WISH_POP - 2, 850, 1080, 0.92],
  [BDAY_END, 850, 1060, 0.86],
];

export const BirthdayScene: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camAt(MAIN, f);
  const shake = (from: number, amt: number) => (f >= from && f < from + 10 ? (1 - (f - from) / 10) * amt : 0);
  const s = shake(COLLAPSE, 8) + shake(DING, 6) + shake(WISH_POP, 14);
  const cx = cam.cx + Math.sin(f * 2.7) * s;
  const cy = cam.cy + Math.cos(f * 3.1) * s;

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#FFE3EF" }}>
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${540 - cx * cam.z}px, ${960 - cy * cam.z}px) scale(${cam.z})` }}>
        <World f={f} />
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 60%, rgba(120,30,70,0.18) 100%)" }} />

      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(184,87,140,0.55) 0%, rgba(184,87,140,0.35) 35%, rgba(184,87,140,0) 60%)", opacity: interpolate(f, [50, 66], [1, 0], clamp) }} />
      <SeriesTitle episode={4} title="Joyeux anniv' Mélo !" titleColor={colors.logoRed} outAt={58} />
      <Pop f={f} at={IDEA} out={IDEA + 18} top={360}>
        <div style={{ fontFamily: displayFont, fontSize: 260, ...candyText("#FFD84D", "#B8578C", 16), rotate: "8deg" }}>!</div>
      </Pop>
      <Pop f={f} at={COLLAPSE + 2} out={COLLAPSE + 24} top={330}>
        <div style={{ fontFamily: displayFont, fontSize: 150, ...candyText("#FFF3F8", "#B8578C", 13), rotate: "-6deg" }}>SPLOUF…</div>
      </Pop>
      <Pop f={f} at={DING} out={DING + 26} top={280}>
        <div style={{ fontFamily: displayFont, fontSize: 170, ...candyText("#FFD84D", colors.logoRed, 15), rotate: `${-6 + Math.sin(f * 2.4) * 3}deg` }}>DING DONG !</div>
      </Pop>
      <Confetti from={WISH_POP} />
      <Pop f={f} at={WISH_POP + 4} out={BDAY_END + 10} top={250}>
        <div style={{ fontFamily: displayFont, fontSize: 132, lineHeight: 1.05, ...candyText(colors.logoRed, colors.white, 13), rotate: "-4deg" }}>
          Joyeux
          <br />
          anniversaire
          <br />
          <span style={{ ...candyText("#2E9E3E", colors.white, 13) }}>Mélo !</span>
        </div>
      </Pop>
    </AbsoluteFill>
  );
};
