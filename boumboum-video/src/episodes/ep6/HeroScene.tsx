import type React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { SeriesTitle } from "../../brand/SeriesTitle";
import { alternate, rigBox, tighten } from "../../final/kit";
import { BoumMonster } from "../../rig/BoumMonster";
import { coolBlink, MELO_COOL } from "../../rig/meloKeys";
import { blinkAt, type Key, sortKeys } from "../../rig/pose";
import { candyText, colors, displayFont, scriptFont } from "../../theme";
import { Bubble, type Cam, camAt, clamp, lerp, makeDuo, PINK_GUM, Pop, PopBurst, Say } from "../shared/stage";
import { AWNING_Y, BALCONIES, Cheers, City, Clouds, GROUND, KITTEN_SPOT, KittenShape, LeafUmbrella, Rain, Rainbow, ROOF, StormSky, WALL } from "./StormCity";

// "Les Aventures Boum Boum", Episode 6: "Le Petit Héros" (45 s).
// The pink monster is afraid of heights. A kitten is stuck on a roof in the
// storm. He climbs anyway, freezes, nearly gives up... and goes on.
// « Être courageux, ce n'est pas ne pas avoir peur. C'est y aller quand même. »

const WIDTH = 300;
const SCALE = WIDTH / 400;
const PINK_AT: [number, number] = [470, GROUND];
const MELO_AT: [number, number] = [200, GROUND];
const XP = (wx: number) => (wx - PINK_AT[0]) / SCALE;
const XM = (wx: number) => (wx - MELO_AT[0]) / SCALE;
const Y = (wy: number) => (wy - GROUND) / SCALE;

// beats (30 fps)
const STREET = 92;
const MELO_UP = 104;
const PINK_UP = 140;
const PINK_DOWN = 178;
const MIAOU = 214;
const DECIDE = 296;
const CLIMB = 318;
const FREEZE = 440;
const KITTEN_SLIP = 492;
const SHOUT = 508;
const BREATH = 534;
const RESUME = 560;
const ON_ROOF = 652;
const CATCH = 708;
const CRACK = 738;
const OFF_EDGE = 752;
const BLOW = 790;
const LAND = 930;
const CHEER = 944;
const LICK = 966;
const TO_HEAD = 1088;
export const HERO_END = 1268;

// a jump between two points (rig units), with anticipation and squash
const jump = (s: number, x0: number, y0: number, x1: number, y1: number, h: number, d = 15): Key[] => [
  { f: s, x: x0, y: y0, sy: 1 },
  { f: s + 3, sy: 0.84, armL: -12, armR: -12 },
  { f: s + 4, x: x0, y: y0 },
  { f: s + 6, sy: 1.1, armL: 140, armR: 140, ease: "out" },
  { f: s + 4 + Math.round((d - 4) / 2), y: Math.min(y0, y1) - h, ease: "out" },
  { f: s + d, x: x1, ease: "inOut" },
  { f: s + d, y: y1, ease: "in" },
  { f: s + d + 1, sy: 0.82, ease: "snap" },
  { f: s + d + 5, sy: 1, armL: 30, armR: 30, ease: "out" },
];

// shimmy up the drainpipe: alternate arms while rising from y0 to y1 (rig units)
const shimmy = (s: number, e: number, y0: number, y1: number, every = 8): Key[] => [
  { f: s, y: y0, ease: "linear" },
  { f: e, y: y1, ease: "linear" },
  ...alternate(s, e, every, { armL: 160, armR: 115, legLift: 0.4, rot: 3 }, { armL: 115, armR: 160, legLift: 0.1, rot: -3 }),
];

// ---------------------------------------------------------------- the pink monster
const PINK_KEYS: Key[] = tighten(
  sortKeys([
    { f: 0, x: 0, y: 0, turn: 0.2, lookX: 0.4, armL: 20, armR: 20, mouthOpen: 0.85, eyeScale: 1, browTilt: 0, rot: 0, sy: 1 },
    // the low wall: he tries...
    { f: PINK_UP - 4, turn: -0.3, lookX: -0.6, browTilt: -10, mouthOpen: 0.3, mouthWidth: 0.6, smile: 0.6 },
    ...jump(PINK_UP, 0, 0, XP(215), Y(WALL.top), 70, 14),
    // ...looks down: way too high!
    { f: PINK_UP + 18, lookY: 0.9, lookX: 0, turn: 0, eyeScale: 1, browTilt: 0 },
    { f: PINK_UP + 22, eyeScale: 1.4, pupil: 0.5, browTilt: 22, browY: -10, mouthOpen: 0.5, mouthWidth: 0.45, smile: -1, armL: 120, armR: 120, ease: "snap" },
    ...alternate(PINK_UP + 22, PINK_DOWN - 2, 2, { x: XP(215) + 2.5 }, { x: XP(215) - 2.5 }).map((k) => ({ ...k, ease: "linear" as const })),
    ...jump(PINK_DOWN, XP(215), Y(WALL.top), 0, 0, 30, 12),
    { f: PINK_DOWN + 16, eyeScale: 1.2, pupil: 0.8, browTilt: 18, mouthOpen: 0.9, mouthWidth: 0.6, smile: -0.4, lookY: 0, turn: 0.2, lookX: 0.5 },
    { f: 206, eyeScale: 1, pupil: 1, browTilt: 14, mouthOpen: 0.3, mouthWidth: 0.5, smile: 0.3 },
    // MIAOU! up there, on the roof
    { f: MIAOU, lookY: 0, eyeScale: 1 },
    { f: MIAOU + 4, lookY: -1, lookX: 0.2, eyeScale: 1.3, browY: -16, browTilt: 0, mouthOpen: 0.6, mouthWidth: 0.45, ease: "snap" },
    { f: 286, lookY: -1, eyeScale: 1.2 },
    // the decision: he swallows... and nods
    { f: 290, lookY: 0, turn: -0.35, lookX: -0.8, browTilt: 18, eyeScale: 1.1, mouthOpen: 0.2, mouthWidth: 0.5, smile: -0.3 },
    { f: DECIDE, sy: 0.94, mouthOpen: 0, ease: "snap" },
    { f: DECIDE + 6, sy: 1, browTilt: -16, browY: 6, eyeScale: 1, smile: 0.5, mouthOpen: 0.3, mouthWidth: 0.6, ease: "out" },
    { f: 308, lookY: 0.3 },
    { f: 312, lookY: -0.1, turn: 0.4, lookX: 0.6 },
    // the climb: awning, balcony, drainpipe
    ...jump(CLIMB, 0, 0, XP(720), Y(AWNING_Y), 160, 16),
    ...jump(340, XP(720), Y(AWNING_Y), XP(900), Y(BALCONIES[0]), 120, 16),
    ...jump(362, XP(900), Y(BALCONIES[0]), XP(1090), Y(BALCONIES[0]), 60, 14),
    { f: 378, turn: 0.5, lookX: 0.4, lookY: -0.6, armL: 150, armR: 150 },
    ...shimmy(380, FREEZE - 2, Y(BALCONIES[0]), Y(1800)),
    // FREEZE: a gust... he looks down
    { f: FREEZE, rot: 8, eyeScale: 1.1, lookY: -0.4 },
    { f: 446, rot: 0, lookY: 1, lookX: -0.3, eyeScale: 1.45, pupil: 0.45, browTilt: 22, browY: -10, mouthOpen: 0.5, mouthWidth: 0.42, smile: -1, armL: 165, armR: 165, legLift: 0.6, ease: "snap" },
    { f: 452, y: Y(1800) },
    { f: 458, y: Y(1860), ease: "in" },
    ...alternate(460, 528, 2, { x: XP(1090) + 2 }, { x: XP(1090) - 2 }).map((k) => ({ ...k, ease: "linear" as const })),
    { f: 480, blink: 0, eyeScale: 1.4 },
    { f: 484, blink: 1, squint: 0, mouthOpen: 0.2, mouthWidth: 0.6, ease: "in" },
    { f: 498, blink: 1 },
    { f: 502, blink: 0, lookY: -1, lookX: 0.2, eyeScale: 1.3, pupil: 0.7, ease: "out" },
    // Mélo shouts from below
    { f: SHOUT + 8, lookY: 1, lookX: -0.4, eyeScale: 1.2 },
    // a deep breath
    { f: BREATH, blink: 0, sy: 1, lookY: 0 },
    { f: BREATH + 4, blink: 1, browTilt: 0, smile: 0, mouthOpen: 0.1, mouthWidth: 0.4 },
    { f: BREATH + 12, sy: 1.1, cheeks: 0.8, ease: "inOut" },
    { f: BREATH + 22, sy: 0.95, cheeks: 0, ease: "inOut" },
    { f: RESUME - 2, sy: 1, blink: 1 },
    { f: RESUME, blink: 0, browTilt: -18, browY: 6, eyeScale: 1.05, pupil: 1, mouthOpen: 0.3, mouthWidth: 0.7, smile: 0.4, lookY: -0.7, legLift: 0.2, ease: "snap" },
    ...shimmy(RESUME + 2, 640, Y(1860), Y(760), 6),
    ...jump(642, XP(1090), Y(760), XP(1100), Y(ROOF), 60, 10),
    // across the roof, on all fours
    { f: ON_ROOF + 4, turn: -0.5, lookX: -0.9, lookY: 0.1, sy: 0.82, rot: -6, legLift: 0 },
    { f: ON_ROOF + 4, x: XP(1100), ease: "linear" },
    { f: CATCH - 6, x: XP(690), ease: "linear" },
    ...alternate(ON_ROOF + 6, CATCH - 8, 6, { armL: 90, armR: 40 }, { armL: 40, armR: 90 }),
    // the kitten jumps into his arms
    { f: CATCH - 2, sy: 0.82, rot: -6, eyeScale: 1.1 },
    { f: CATCH + 2, sy: 1.05, rot: 0, armL: -46, armR: -46, browTilt: 0, browY: -6, ease: "snap" },
    { f: CATCH + 8, sy: 1, squint: 1, mouthOpen: 0.85, mouthWidth: 1, smile: 1, cheeks: 0.5, turn: 0, lookX: 0 },
    // CRAC
    { f: CRACK, squint: 0, eyeScale: 1.45, pupil: 0.5, browY: -26, mouthOpen: 0.95, mouthWidth: 0.42, cheeks: 0, rot: -10, ease: "snap" },
    { f: CRACK, x: XP(690), ease: "linear" },
    { f: OFF_EDGE, x: XP(560), y: Y(ROOF) + 30, rot: -25, ease: "in" },
    // the fall
    { f: OFF_EDGE + 1, y: Y(ROOF) + 30 },
    { f: BLOW - 2, y: Y(1700), x: XP(480), ease: "in" },
    ...alternate(OFF_EDGE + 2, BLOW - 4, 3, { rot: -18, legLift: 0.7 }, { rot: 14, legLift: 0.3 }),
    { f: 760, blink: 1, squint: 0 },
    // the idea: blow!
    { f: BLOW, rot: 0, blink: 0, eyeScale: 1.1, browTilt: -14, browY: 4, cheeks: 1, mouthOpen: 0.3, mouthWidth: 0.28, smile: 0.5, legLift: 0.3, ease: "snap" },
    { f: 812, y: Y(1760), x: XP(475), ease: "out" },
    { f: LAND, y: 0, x: XP(540), ease: "inOut" },
    { f: 830, browTilt: 0, browY: -6, cheeks: 0.7, lookY: 0.5, eyeScale: 1.15 },
    { f: 880, lookY: -0.4, lookX: 0.4, eyeScale: 1.2 },
    // landing
    { f: LAND - 1, sy: 1, legLift: 0.3 },
    { f: LAND, sy: 0.8, legLift: 0, ease: "snap" },
    { f: LAND + 6, sy: 1, cheeks: 0, mouthOpen: 0.85, mouthWidth: 1, smile: 1, browY: -8, lookY: 0, lookX: 0, ease: "out" },
    // bravo! the kitten licks his cheek
    { f: CHEER, turn: 0, eyeScale: 1.15, lookY: -0.4 },
    { f: LICK - 4, squint: 0, lookY: 0 },
    { f: LICK + 4, squint: 1, mouthOpen: 1, mouthWidth: 1, smile: 1, browY: -10, cheeks: 0.8, turn: 0.2 },
    { f: 996, squint: 0, cheeks: 0, mouthOpen: 0.85, turn: -0.3, lookX: -0.7 },
    // « Si... mais j'y suis allé quand même ! »
    { f: 1030, browTilt: 12, mouthOpen: 0.4, mouthWidth: 0.6, smile: 0.3, lookY: 0.2 },
    { f: 1050, browTilt: -8, mouthOpen: 0.85, mouthWidth: 1, smile: 1, lookY: 0 },
    { f: TO_HEAD - 4, armL: -46, armR: -46 },
    { f: TO_HEAD + 6, armL: 20, armR: 20, lookY: -0.6, turn: 0, lookX: 0 },
    // proud: chest out, hands on hips
    { f: 1110, sy: 1.05, armL: -30, armR: -30, curlL: 1.4, curlR: 1.4, lookY: -0.2, squint: 1, mouthOpen: 0.85, browY: -8 },
    { f: 1150, squint: 0, turn: 0.15, lookX: 0.3, lookY: 0 },
    ...blinkAt(1190),
    { f: HERO_END, sy: 1.05 },
  ]),
);

// ---------------------------------------------------------------- Mélo
const MELO_KEYS: Key[] = tighten(
  sortKeys([
    { f: 0, ...MELO_COOL, x: 0, y: 0, turn: 0.2, lookX: 0.4, armL: 8, armR: 120, curlR: 0.3, eyeScale: 1, squint: 0, browTilt: 0, rot: 0 },
    // casually hops on the wall and back down
    ...jump(MELO_UP, 0, 0, XM(215), Y(WALL.top), 80, 14).map((k) => ({ ...k, armR: undefined })),
    ...jump(128, XM(215), Y(WALL.top), XM(-90), 0, 40, 12).map((k) => ({ ...k, armR: undefined })),
    { f: 150, turn: 0.35, lookX: 0.8, lookY: -0.3 },
    { f: 188, browTilt: -10, smile: 0.8, mouthOpen: 0, mouthWidth: 0.7, blink: 0.35 },
    { f: 200, ...MELO_COOL, browTilt: 0 },
    // MIAOU!
    { f: MIAOU, lookY: 0, blink: 0.24 },
    { f: MIAOU + 6, lookY: -1, lookX: 0.3, blink: 0, eyeScale: 1.2, browY: -12, ease: "snap" },
    // can't climb... « T'es sûr ? »
    { f: 292, lookY: 0, turn: 0.35, lookX: 0.8, eyeScale: 1, armL: 8 },
    { f: 298, armL: 62, curlL: -0.6, browTilt: 12, browY: 0, mouthOpen: 0.4, mouthWidth: 0.6, smile: 0 },
    { f: 316, armL: 8, curlL: 0 },
    { f: 330, lookY: -0.9, lookX: 0.6, browTilt: 14, mouthOpen: 0.2, mouthWidth: 0.5, smile: -0.3 },
    // « TU PEUX LE FAIRE ! »
    { f: SHOUT - 2, y: 0, sy: 1, armL: 8 },
    { f: SHOUT + 2, y: -50, sy: 1.12, armL: 150, mouthOpen: 1, mouthWidth: 0.8, smile: 0.6, browTilt: -10, browY: -10, blink: 0, eyeScale: 1.15, lookY: -1, ease: "snap" },
    { f: SHOUT + 8, y: 0, sy: 1, ease: "in" },
    { f: SHOUT + 12, y: -30, armL: 140, ease: "out" },
    { f: SHOUT + 18, y: 0, ease: "in" },
    { f: 540, armL: 8, mouthOpen: 0.3, mouthWidth: 0.5, browTilt: 12 },
    // the fall: he covers his eyes, then peeks
    { f: OFF_EDGE, eyeScale: 1.4, browY: -24, browTilt: 0, mouthOpen: 0.9, mouthWidth: 0.45, armL: 150, ease: "snap" },
    { f: 770, armL: -80, curlL: 0.6, blink: 1 },
    { f: 816, blink: 0, armL: -40, eyeScale: 1.2, lookY: -0.8 },
    { f: 840, armL: 8, curlL: 0, mouthOpen: 0.6, mouthWidth: 0.6, smile: 1, browY: -10 },
    // relief: he hops over to his friend, then the question
    ...jump(LAND + 10, XM(-90), 0, XM(300), 0, 60, 16).map((k) => ({ ...k, armR: undefined })),
    { f: LAND + 6, turn: 0.35, lookX: 0.8, lookY: 0, squint: 1, mouthOpen: 1, mouthWidth: 1, smile: 1, eyeScale: 1 },
    { f: 990, squint: 0, ...MELO_COOL, smile: 0.6 },
    { f: 1000, mouthOpen: 0.4, mouthWidth: 0.6, browTilt: -8 },
    { f: 1080, squint: 1, mouthOpen: 0.9, mouthWidth: 1, smile: 1, browY: -6 },
    { f: 1110, squint: 0, ...MELO_COOL, smile: 0.8, armL: 50, curlL: -0.4 },
    ...coolBlink(1160),
  ]).map((k) => {
    const out = { ...k };
    if (out.armR === undefined) delete out.armR;
    return out;
  }),
);

const { poseOf, toWorld, mouthOf } = makeDuo({ pinkAt: PINK_AT, meloAt: MELO_AT, width: WIDTH, pinkKeys: PINK_KEYS, meloKeys: MELO_KEYS });

// ---------------------------------------------------------------- the kitten
const kittenMood = (f: number) => ({
  meow: Math.max(interpolate(f, [MIAOU, MIAOU + 3, MIAOU + 14], [0, 1, 0], clamp), interpolate(f, [KITTEN_SLIP, KITTEN_SLIP + 3, KITTEN_SLIP + 12], [0, 1, 0], clamp), interpolate(f, [1200, 1204, 1214], [0, 1, 0], clamp)),
  scared: f < CATCH + 10 ? 1 : f < OFF_EDGE + 40 ? 0.6 : 0,
  happy: f >= LICK - 2 && f < 1000 ? 1 : 0,
  lick: f >= LICK && f < 992 ? Math.abs(Math.sin((f - LICK) / 3)) : 0,
});

// ---------------------------------------------------------------- the world
const World: React.FC<{ f: number }> = ({ f }) => {
  const pink = poseOf("pink", f);
  const melo = poseOf("melo", f);
  const pm = mouthOf("pink", pink);
  const mood = kittenMood(f);
  const crack = lerp(f, [CRACK, CRACK + 24], [0, 1], Easing.in(Easing.quad));
  const bubbleR = f >= BLOW && f < LAND + 4 ? lerp(f, [BLOW, BLOW + 18, LAND - 10, LAND + 3], [0, 250, 250, 160], Easing.out(Easing.quad)) : 0;

  // where the kitten is
  const slip = lerp(f, [KITTEN_SLIP, KITTEN_SLIP + 6], [0, 26]);
  const onRoof: [number, number] = [KITTEN_SPOT[0] + 30, KITTEN_SPOT[1] - 40 + slip];
  const arms = toWorld("pink", poseOf("pink", CATCH + 2), 200, 372);
  const toArms = lerp(f, [CATCH - 6, CATCH + 2], [0, 1], Easing.inOut(Easing.quad));
  const inHeld = f >= CATCH + 2 && f < TO_HEAD;
  const onHead = f >= TO_HEAD + 10;
  const headFrom = toWorld("pink", poseOf("pink", TO_HEAD), 200, 372);
  const headTo = toWorld("pink", poseOf("pink", TO_HEAD + 10), 200, 90);
  const toHead = lerp(f, [TO_HEAD, TO_HEAD + 10], [0, 1], Easing.inOut(Easing.quad));
  const lift = lerp(f, [LICK - 8, LICK, 990, 998], [0, 1, 1, 0]);

  const kittenWorld = (x: number, y: number, s = 0.75) => (
    <svg style={{ position: "absolute", left: x - 100, top: y - 200, width: 200, height: 220, overflow: "visible" }} viewBox="-100 -200 200 220">
      <g transform={`scale(${s})`}>
        <KittenShape f={f} {...mood} look={-0.5} />
      </g>
    </svg>
  );

  const pinkHeld = inHeld ? (
    <g transform={`translate(${200 + lift * 70} ${372 - lift * 90}) scale(1.05)`}>
      <KittenShape f={f} {...mood} look={0.5} />
    </g>
  ) : null;
  const pinkOver = onHead ? (
    <g transform="translate(200 96) scale(0.95)">
      <KittenShape f={f} {...mood} look={0} />
    </g>
  ) : null;

  return (
    <>
      <City f={f} cheer={lerp(f, [CHEER - 6, CHEER], [0, 1])} crack={crack} />
      {f < CATCH - 6 ? kittenWorld(onRoof[0], onRoof[1]) : null}
      {f >= CATCH - 6 && f < CATCH + 2 ? kittenWorld(onRoof[0] + (arms[0] - onRoof[0]) * toArms, onRoof[1] + (arms[1] - onRoof[1]) * toArms - Math.sin(Math.PI * toArms) * 80) : null}
      {f >= TO_HEAD && f < TO_HEAD + 10 ? kittenWorld(headFrom[0] + (headTo[0] - headFrom[0]) * toHead, headFrom[1] + (headTo[1] - headFrom[1]) * toHead - Math.sin(Math.PI * toHead) * 90) : null}
      {bubbleR > 1 ? <Bubble id="chute" x={pm[0]} y={pm[1] - bubbleR * 0.95} r={bubbleR} tone={PINK_GUM} opacity={0.85} wob={Math.sin(f * 0.8) * 0.02} /> : null}
      <BoumMonster pose={melo} skin="melo" over={<LeafUmbrella open={lerp(f, [CHEER, CHEER + 10], [1, 0])} />} style={rigBox(MELO_AT, WIDTH)} />
      <BoumMonster pose={pink} held={pinkHeld} over={pinkOver} style={rigBox(PINK_AT, WIDTH)} />
      <PopBurst f={f} at={LAND + 4} x={pm[0]} y={pm[1] - 200} r={160} tones={PINK_GUM} n={12} />
      <Cheers f={f} from={CHEER} />
      {/* speech */}
      <Say f={f} from={PINK_DOWN + 4} to={206} x={pm[0] + 30} y={pm[1] - 240} text="Trop haut !!" color={colors.logoRed} tail="left" size={56} />
      <Say f={f} from={300} to={318} x={mouthOf("melo", melo)[0] + 20} y={mouthOf("melo", melo)[1] - 240} text="T'es sûr… ?" color="#2E9E3E" tail="left" size={52} />
      <Say f={f} from={SHOUT} to={SHOUT + 28} x={mouthOf("melo", melo)[0] + 120} y={mouthOf("melo", melo)[1] - 250} text="TU PEUX LE FAIRE !" color="#2E9E3E" tail="left" size={64} />
      <Say f={f} from={1000} to={1028} x={mouthOf("melo", melo)[0] + 20} y={mouthOf("melo", melo)[1] - 240} text="T'avais pas peur ?" color="#2E9E3E" tail="left" size={46} />
      <Say f={f} from={1032} to={1084} x={430} y={pm[1] - 250} text="Si… mais j'y suis allé quand même !" color={colors.logoRed} tail="right" size={34} />
    </>
  );
};

// ---------------------------------------------------------------- camera
const MAIN: Cam[] = [
  [0, 900, 650, 0.55], // the roof in the storm (the kitten is already up there)
  [62, 900, 650, 0.55],
  [STREET, 230, 2760, 1.2], // tilt down: the street, the low wall
  [MIAOU, 230, 2760, 1.2],
  [250, 660, 820, 1.25], // up to the kitten
  [272, 660, 820, 1.25],
  [292, 230, 2760, 1.2],
  [CLIMB, 480, 2650, 0.9],
  [360, 800, 2300, 0.75],
  [FREEZE, 1040, 1950, 0.85],
  [448, 1080, 1960, 1.15], // his face
  [462, 820, 2350, 0.42], // vertigo: the drop below
  [478, 1080, 1940, 1.3],
  [505, 1080, 1940, 1.3],
  [512, 20, 2780, 1.1], // Mélo shouts
  [536, 20, 2780, 1.1],
  [545, 1080, 1900, 1.35], // a deep breath
  [RESUME, 1080, 1880, 1.2],
  [640, 1000, 1000, 0.8],
  [ON_ROOF + 8, 860, 760, 0.85],
  [CATCH - 4, 700, 780, 1.1],
  [CRACK, 700, 780, 1.15],
  [OFF_EDGE, 600, 950, 0.8], // the fall
  [BLOW - 2, 520, 1650, 0.75],
  [812, 500, 1600, 0.6],
  [880, 460, 2250, 0.5], // floating down as the sun comes out
  [LAND, 470, 2550, 0.75], // bravo from the windows
  [990, 470, 2550, 0.75],
  [1006, 420, 2790, 1.4], // the two friends
  [1084, 420, 2790, 1.4],
  [HERO_END, 420, 2770, 1.3],
];

const Caption: React.FC<{ f: number; from: number; to: number; text: string }> = ({ f, from, to, text }) => {
  const o = interpolate(f, [from, from + 10, to - 10, to], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1580, textAlign: "center", opacity: o, translate: `0px ${(1 - o) * 20}px` }}>
      <span style={{ display: "inline-block", padding: "18px 40px", borderRadius: 40, background: "rgba(20,24,48,0.6)", fontFamily: scriptFont, fontSize: 64, color: "#FFF3C4", textShadow: "0 3px 0 rgba(0,0,0,0.35)", lineHeight: 1.2 }}>{text}</span>
    </div>
  );
};

export const HeroScene: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camAt(MAIN, f);
  const gust = Math.max(interpolate(f, [FREEZE - 4, FREEZE + 4, FREEZE + 30], [0, 1, 0], clamp), interpolate(f, [CRACK - 6, CRACK, CRACK + 20], [0, 1, 0], clamp));
  const shake = (from: number, amt: number) => (f >= from && f < from + 10 ? (1 - (f - from) / 10) * amt : 0);
  const s = shake(CRACK, 12) + gust * 6;
  const cx = cam.cx + Math.sin(f * 2.7) * s;
  const cy = cam.cy + Math.cos(f * 3.1) * s;
  const sun = lerp(f, [870, 960], [0, 1]);
  const rain = lerp(f, [860, 930], [1, 0]);
  const flash = [120, FREEZE, CRACK].reduce((a, t) => a + (f >= t && f < t + 5 ? 1 - (f - t) / 5 : 0), 0);
  const fear = f >= 448 && f < BREATH ? lerp(f, [448, 456, 520, BREATH], [0, 1, 1, 0]) : 0;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <StormSky sun={sun} />
      <Clouds f={f} sun={sun} />
      <Rainbow t={lerp(f, [950, 1010], [0, 1])} />
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${540 - cx * cam.z}px, ${960 - cy * cam.z}px) scale(${cam.z})` }}>
        <World f={f} />
      </div>
      <Rain f={f} wind={0.35 + gust * 0.8} amount={rain} />
      <AbsoluteFill style={{ background: "rgba(30,40,80,1)", opacity: 0.25 * (1 - sun) }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 40%, rgba(10,10,30,0.75) 100%)", opacity: fear }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 70% 20%, rgba(255,240,180,0.55) 0%, rgba(255,240,180,0) 60%)", opacity: sun }} />
      <AbsoluteFill style={{ background: "white", opacity: flash * 0.6 }} />

      <SeriesTitle episode={6} title="Le Petit Héros" titleColor={colors.logoRed} outAt={56} />
      <Caption f={f} from={104} to={208} text="Boum Boum avait peur d'une seule chose : le vide." />
      <Caption f={f} from={456} to={520} text="Il avait très, très peur…" />
      <Caption f={f} from={540} to={604} text="…mais le petit chat avait encore plus peur que lui." />
      <Caption f={f} from={1092} to={1176} text="Être courageux, ce n'est pas ne pas avoir peur…" />
      <Caption f={f} from={1180} to={HERO_END + 6} text="…c'est y aller quand même." />
      <Pop f={f} at={MIAOU} out={MIAOU + 22} top={330}>
        <div style={{ fontFamily: displayFont, fontSize: 170, ...candyText("#FFFFFF", "#5B6685", 15), rotate: "-6deg" }}>MIAOU !</div>
      </Pop>
      <Pop f={f} at={CRACK} out={CRACK + 18} top={360}>
        <div style={{ fontFamily: displayFont, fontSize: 190, ...candyText("#FFD84D", "#8C3B23", 16), rotate: "7deg" }}>CRAC !</div>
      </Pop>
    </AbsoluteFill>
  );
};
