import type React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { SeriesTitle } from "../../brand/SeriesTitle";
import { alternate, rigBox, tighten } from "../../final/kit";
import { BoumMonster } from "../../rig/BoumMonster";
import { blinkAt, type Key, sortKeys } from "../../rig/pose";
import { colors, scriptFont } from "../../theme";
import { Bubble, type Cam, camAt, clamp, lerp, makeDuo, PINK_GUM, PopBurst } from "../shared/stage";
import { BUSH_X, DOOR_X, FLOWERS_X, GAP, Garden, GROUND, NightSky, StarBush, StarShape } from "./NightGarden";

// "Les Aventures Boum Boum", Episode 6: "L'Étoile tombée" (45 s).
// A little star falls into the garden. They become best friends. But far from
// the sky, a star cannot shine for long... He could keep her, or help her home.
// « Aimer quelqu'un, c'est parfois l'aider à rentrer chez lui. »

const WIDTH = 360;
const SCALE = WIDTH / 400;
const PINK_AT: [number, number] = [700, GROUND];
const XP = (wx: number) => (wx - PINK_AT[0]) / SCALE;
const SPOT = 1000; // where he sits with her

// beats (30 fps)
const FALL = 70;
const LANDED = 118;
const DOOR = 126;
const PEEK = 196;
const REVEAL = 206;
const TO_HANDS = 246;
const HIDE = 300;
const FOUND = 342;
const BUBBLES = [364, 380, 396];
const BOUNCES = [384, 400, 416];
const SKY = 432;
const WEAK = 500;
const REALIZE = 620;
const HUG = 640;
const DECIDE = 730;
const STAND = 760;
const BLOW = 772;
const INSIDE = 866;
const RELEASE = 900;
const HOME = 1010;
const SPARKLE = 1095;
export const STAR_END = 1268;

// ---------------------------------------------------------------- the pink monster
const KEYS: Key[] = tighten(
  sortKeys([
    { f: 0, x: XP(DOOR_X), y: 0, turn: 0.3, lookX: 0.6, armL: 20, armR: 20, mouthOpen: 0.6, mouthWidth: 0.6, smile: 0.6, eyeScale: 1, browY: 0, browTilt: 0, sy: 1, rot: 0, bend: 0, squint: 0, cheeks: 0 },
    // out of the house, curious
    { f: DOOR + 4, eyeScale: 1.15, browY: -8, lookX: 0.8 },
    { f: DOOR + 6, x: XP(DOOR_X), y: 0, sy: 1 },
    { f: DOOR + 9, sy: 0.88 },
    { f: DOOR + 12, sy: 1.06, ease: "out" },
    { f: DOOR + 15, y: -70, ease: "out" },
    { f: DOOR + 22, x: XP(500), ease: "inOut" },
    { f: DOOR + 22, y: 0, ease: "in" },
    { f: DOOR + 23, sy: 0.88, ease: "snap" },
    { f: DOOR + 27, sy: 1, ease: "out" },
    ...[156, 170, 184].flatMap((s, i) => [
      { f: s, x: XP(500 + i * 90), y: 0 },
      { f: s + 6, y: -22, ease: "out" as const },
      { f: s + 12, x: XP(590 + i * 90), y: 0, ease: "in" as const },
    ]),
    // parts the leaves
    { f: PEEK, turn: 0.4, lookX: 0.8, lookY: 0.4, rot: 6, bend: 10, armR: 30, curlR: -0.3, eyeScale: 1.1, mouthOpen: 0.3, mouthWidth: 0.45 },
    { f: REVEAL, eyeScale: 1.3, browY: -16, mouthOpen: 0.6, mouthWidth: 0.42, ease: "snap" },
    // offers his hand, gently
    { f: 222, sy: 0.9, rot: 4, bend: 6, eyeScale: 1.1, browY: -6, mouthOpen: 0.4, mouthWidth: 0.7, smile: 1, armR: 40 },
    { f: TO_HANDS + 4, sy: 1, rot: 0, bend: 0, armL: -46, armR: -46, curlR: 0, turn: 0.1, lookX: 0.1, lookY: 0.5 },
    { f: 266, squint: 1, mouthOpen: 0.85, mouthWidth: 1, cheeks: 0.6, lookY: 0.3 },
    // hide and seek: covers his eyes...
    { f: HIDE, squint: 0, cheeks: 0, armL: 112, armR: 112, curlL: 1.3, curlR: 1.3, lookY: 0, turn: 0, lookX: 0 },
    ...alternate(HIDE + 4, 320, 8, { rot: 3 }, { rot: -3 }),
    { f: 324, rot: 0, armL: 20, armR: 20, curlL: 0, curlR: 0 },
    { f: 330, turn: -0.4, lookX: -0.8, eyeScale: 1.1 },
    { f: 338, turn: 0.4, lookX: 0.8 },
    { f: FOUND, eyeScale: 1.25, browY: -12, smile: 1, mouthOpen: 0.85, ease: "snap" },
    { f: FOUND + 4, x: XP(800), y: 0, sy: 1 },
    { f: FOUND + 8, y: -40, ease: "out" },
    { f: FOUND + 14, x: XP(SPOT), y: 0, ease: "in" },
    { f: 356, squint: 1, mouthOpen: 1, eyeScale: 1 },
    // bubbles to bounce on
    ...BUBBLES.flatMap((b) => [
      { f: b, squint: 0, cheeks: 0, mouthOpen: 0.85, mouthWidth: 1 },
      { f: b + 4, cheeks: 0.8, mouthOpen: 0.3, mouthWidth: 0.28, ease: "out" as const },
      { f: b + 12, cheeks: 0, mouthOpen: 0.85, mouthWidth: 1, ease: "snap" as const },
    ]),
    { f: 404, lookY: -0.6, lookX: 0.5, squint: 1, mouthOpen: 1 },
    // sitting on the grass, looking at the sky
    { f: SKY, y: 0, sy: 1, legLift: 0, squint: 0 },
    { f: SKY + 8, sy: 0.84, y: 18, legLift: 0.5, armL: -20, armR: -20, ease: "out" },
    { f: 446, lookY: -1, lookX: 0, eyeScale: 1.15, mouthOpen: 0.5, mouthWidth: 0.6, turn: 0 },
    // she gets weak
    { f: WEAK, lookY: 0.5, armL: -46, armR: -46, eyeScale: 1 },
    { f: 530, browTilt: 18, eyeScale: 1.1, smile: -0.2, mouthOpen: 0.3, mouthWidth: 0.5 },
    { f: 560, sy: 0.88, bend: 4 },
    { f: 600, lookY: -1, turn: 0, eyeScale: 1.1 },
    { f: REALIZE, eyeScale: 1.25, browY: -8, mouthOpen: 0.5, mouthWidth: 0.45, ease: "snap" },
    { f: 632, eyeScale: 1, browY: 0, browTilt: 20, smile: -0.8, mouthOpen: 0.1, mouthWidth: 0.5, lookY: 0.5 },
    // holds her close... a tear... the decision
    { f: HUG, sy: 0.86, bend: 0 },
    { f: 660, sy: 0.9, rot: 3 },
    { f: 700, blink: 0, rot: 0 },
    { f: 706, blink: 1 },
    { f: 722, blink: 1 },
    { f: DECIDE, blink: 0, browTilt: 6, smile: 0.3, mouthOpen: 0.2, mouthWidth: 0.6, lookY: 0.4 },
    { f: DECIDE + 6, lookY: 0.7, sy: 0.86 },
    { f: DECIDE + 12, lookY: 0.4, sy: 0.9 },
    // stands up and blows the biggest bubble of his life
    { f: STAND, sy: 0.9, y: 18, legLift: 0.5 },
    { f: STAND + 8, sy: 1, y: 0, legLift: 0, armL: 20, armR: 20, turn: 0.35, lookX: 0.7, lookY: 0, browTilt: -10, ease: "out" },
    { f: BLOW, cheeks: 0, mouthOpen: 0.3 },
    { f: BLOW + 6, cheeks: 1, mouthOpen: 0.3, mouthWidth: 0.28, sy: 1.05, ease: "out" },
    { f: 820, sy: 1.1, squint: 0.5, armL: 40, armR: 40 },
    { f: 850, sy: 1.1, squint: 0.5 },
    { f: 854, sy: 1, squint: 0, cheeks: 0, mouthOpen: 0.4, mouthWidth: 0.6, smile: 0.6, browTilt: 8, eyeScale: 1.05, armL: 20, armR: 20, ease: "out" },
    // their hands meet through the bubble
    { f: 876, armR: 52, curlR: -0.2 },
    // he lets her go: waves, crying and smiling
    { f: RELEASE, armR: 52, lookY: 0 },
    { f: 930, armR: 120, lookY: -0.6, smile: 0.7, squint: 0.4, mouthOpen: 0.4, ease: "out" },
    ...alternate(936, 996, 8, { armR: 145, curlR: -0.4 }, { armR: 110, curlR: 0.4 }),
    { f: HOME, armR: 30, curlR: 0, lookY: -1, squint: 0, eyeScale: 1.15, mouthOpen: 0.5, mouthWidth: 0.5 },
    // alone again
    { f: 1046, sy: 1, y: 0, lookY: -1 },
    { f: 1056, sy: 0.84, y: 18, legLift: 0.5, armL: -20, armR: -20, lookY: 0.3, browTilt: 18, smile: -0.3, mouthOpen: 0.1, eyeScale: 1, turn: 0, lookX: 0 },
    ...alternate(1064, 1088, 8, { sy: 0.82 }, { sy: 0.86 }),
    ...blinkAt(1080),
    // a sparkle on his nose: she shines for him
    { f: SPARKLE + 18, lookY: -0.3, eyeScale: 1.2, browTilt: 0, browY: -10, mouthOpen: 0.3, mouthWidth: 0.45 },
    { f: SPARKLE + 24, squint: 1, mouthOpen: 0.85, mouthWidth: 1, smile: 1, cheeks: 0.7, eyeScale: 1 },
    { f: 1150, squint: 0, lookY: -1, armR: 140, cheeks: 0.3 },
    ...alternate(1154, 1214, 8, { armR: 150, curlR: -0.4 }, { armR: 115, curlR: 0.4 }),
    { f: 1222, armR: 20, curlR: 0, smile: 1, mouthOpen: 0.6 },
    { f: STAR_END, lookY: -1 },
  ]),
);

const { poseOf, toWorld, mouthOf } = makeDuo({ pinkAt: PINK_AT, meloAt: PINK_AT, width: WIDTH, pinkKeys: KEYS, meloKeys: [{ f: 0 }] });
const P = (f: number) => poseOf("pink", f);

// ---------------------------------------------------------------- the star
const head = (f: number): [number, number] => {
  const p = toWorld("pink", P(f), 200, 70);
  return [p[0], p[1] - 40];
};
const hands = (f: number): [number, number] => toWorld("pink", P(f), 200, 392);
const bigBubbleR = (f: number) => (f >= BLOW + 4 && f < HOME ? lerp(f, [BLOW + 4, 850], [0, 230], Easing.inOut(Easing.quad)) : 0);
const bubbleCenter = (f: number): [number, number] => {
  const m = mouthOf("pink", P(Math.min(f, RELEASE)));
  const start: [number, number] = [m[0] + 230 * 0.95, m[1] - 230 * 0.3];
  if (f < RELEASE) {
    const r = bigBubbleR(f);
    return [m[0] + r * 0.95, m[1] - r * 0.3];
  }
  const t = lerp(f, [RELEASE, HOME], [0, 1], Easing.inOut(Easing.sin));
  return [start[0] + (GAP[0] - start[0]) * t + Math.sin(t * Math.PI * 3) * 60 * (1 - t), start[1] + (GAP[1] - start[1]) * t];
};
const BUBBLE_SPOTS: [number, number][] = [[1080, 1080], [1190, 960], [1300, 1050]];

const blend = (a: [number, number], b: [number, number], t: number, arc = 0): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(Math.PI * t) * arc];

const starAt = (f: number): [number, number] => {
  if (f < LANDED) {
    const t = lerp(f, [FALL, LANDED], [0, 1], Easing.in(Easing.quad));
    return blend([-300, -2300], [BUSH_X, GROUND - 90], t);
  }
  if (f < TO_HANDS) return [BUSH_X, GROUND - 90];
  if (f < TO_HANDS + 16) return blend([BUSH_X, GROUND - 90], hands(TO_HANDS + 16), lerp(f, [TO_HANDS, TO_HANDS + 16], [0, 1]), 60);
  if (f < HIDE) return hands(f);
  if (f < HIDE + 10) return blend(hands(HIDE), [FLOWERS_X, GROUND - 50], lerp(f, [HIDE, HIDE + 10], [0, 1]), 120);
  if (f < 352) return [FLOWERS_X, GROUND - 50];
  if (f < 362) return blend([FLOWERS_X, GROUND - 50], [FLOWERS_X - 40, GROUND - 200], lerp(f, [352, 362], [0, 1]), 40);
  if (f < BOUNCES[2] + 14) {
    const pts: [number, number][] = [[FLOWERS_X - 40, GROUND - 200], ...BUBBLE_SPOTS.map(([x, y]) => [x, y - 70] as [number, number]), [1120, 1180]];
    const times = [362, ...BOUNCES, BOUNCES[2] + 14];
    let i = 0;
    while (i < times.length - 2 && f >= times[i + 1]) i++;
    return blend(pts[i], pts[i + 1], lerp(f, [times[i], times[i + 1]], [0, 1], Easing.linear), 90);
  }
  if (f < SKY + 10) return blend([1120, 1180], head(SKY + 10), lerp(f, [BOUNCES[2] + 14, SKY + 10], [0, 1]), 60);
  if (f < WEAK) return head(f);
  if (f < WEAK + 12) return blend(head(WEAK), hands(WEAK + 12), lerp(f, [WEAK, WEAK + 12], [0, 1]), 20);
  if (f < STAND + 8) return hands(f);
  if (f < 852) return blend(hands(STAND + 8), [hands(STAND + 8)[0] + 150, hands(STAND + 8)[1] - 120], lerp(f, [STAND + 8, 790], [0, 1]), 30);
  if (f < INSIDE) return blend([hands(STAND + 8)[0] + 150, hands(STAND + 8)[1] - 120], bubbleCenter(INSIDE), lerp(f, [852, INSIDE], [0, 1]), 40);
  if (f < HOME) return bubbleCenter(f);
  return GAP;
};
const starGlow = (f: number) => {
  if (f < LANDED) return 1.2;
  if (f < TO_HANDS) return 0.6;
  if (f < 480) return 1;
  if (f < HUG) return lerp(f, [480, HUG], [1, 0.32]);
  if (f < RELEASE) return lerp(f, [HUG, 760], [0.32, 0.24]);
  if (f < HOME) return lerp(f, [RELEASE, HOME], [0.24, 1.1]);
  return 1.25;
};
const starMood = (f: number) => (f < TO_HANDS ? 0 : f < HIDE ? 1 : f < SKY ? 3 : f < WEAK ? 1 : f < 760 ? 2 : 1);

// ---------------------------------------------------------------- the world
const Tear: React.FC<{ y: number; o: number }> = ({ y, o }) => (
  <path d={`M 282 ${y - 16} C 292 ${y - 2} 292 ${y + 10} 282 ${y + 10} C 272 ${y + 10} 272 ${y - 2} 282 ${y - 16} Z`} fill="#BFEFFF" opacity={o} stroke="white" strokeWidth={2} />
);

const World: React.FC<{ f: number }> = ({ f }) => {
  const pink = P(f);
  const [sx, sy] = starAt(f);
  const glow = starGlow(f);
  const inSky = f >= HOME;
  const lit = lerp(f, [HOME + 2, HOME + 30], [0, 1]);
  const bubR = bigBubbleR(f);
  const [bx, by] = bubbleCenter(f);
  const showPink = f >= DOOR + 2;
  const tear =
    f >= 666 && f < 740 ? <Tear y={lerp(f, [666, 736], [232, 300])} o={lerp(f, [666, 672, 730, 740], [0, 1, 1, 0])} /> : f >= 920 && f < 1000 ? <Tear y={lerp(f, [920, 996], [232, 300])} o={lerp(f, [920, 926, 990, 1000], [0, 1, 1, 0])} /> : null;
  const nose = toWorld("pink", P(SPARKLE + 18), 200 + P(SPARKLE + 18).turn * 105, 250);
  const sparkle = blend(GAP, nose, lerp(f, [SPARKLE, SPARKLE + 18], [0, 1], Easing.in(Easing.quad)));

  return (
    <>
      <NightSky f={f} lit={lit} gapHint={f >= 446 && f < WEAK ? 1 : f >= 990 && f < HOME ? 1 : 0} />
      <Garden f={f} door={lerp(f, [DOOR - 6, DOOR + 2, 160, 170], [0, 1, 1, 0])} />
      {/* the shooting star's trail */}
      {f >= FALL && f < LANDED + 2
        ? Array.from({ length: 14 }, (_, i) => {
            const [tx, ty] = starAt(Math.max(FALL, f - i * 1.5));
            return <div key={i} style={{ position: "absolute", left: tx - (40 - i * 2), top: ty - (40 - i * 2), width: (40 - i * 2) * 2, height: (40 - i * 2) * 2, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,240,180,0.9), rgba(255,240,180,0))", opacity: 1 - i / 14 }} />;
          })
        : null}
      {/* small bubbles for the bouncing game */}
      {BUBBLES.map((b, i) => {
        if (f < b + 4 || f > BOUNCES[i] + 3) return null;
        const m = mouthOf("pink", P(Math.min(f, b + 12)));
        const t = lerp(f, [b + 4, b + 16], [0, 1], Easing.out(Easing.quad));
        const pos = blend([m[0] + 40, m[1]], BUBBLE_SPOTS[i], t);
        return <Bubble key={i} id={`sb${i}`} x={pos[0]} y={pos[1]} r={lerp(f, [b + 4, b + 12], [10, 55])} tone={PINK_GUM} />;
      })}
      {BUBBLES.map((_, i) => (
        <PopBurst key={i} f={f} at={BOUNCES[i] + 3} x={BUBBLE_SPOTS[i][0]} y={BUBBLE_SPOTS[i][1]} r={55} tones={PINK_GUM} n={8} />
      ))}
      {f >= TO_HANDS + 4 ? <StarBush part={1} glow={0} /> : null}
      {showPink ? <BoumMonster pose={pink} over={<g>{tear}</g>} style={rigBox(PINK_AT, WIDTH)} /> : null}
      {/* the star */}
      {f >= FALL ? (
        <svg style={{ position: "absolute", left: sx - 150, top: sy - 150, width: 300, height: 300, overflow: "visible" }} viewBox="-150 -150 300 300">
          <StarShape f={f} glow={glow} mood={inSky ? 1 : starMood(f)} size={inSky ? 0.8 : f < LANDED ? 0.9 : 1.35} tilt={f >= WEAK + 20 && f < 760 ? 18 : Math.sin(f / 10) * 6} />
        </svg>
      ) : null}
      {/* the big bubble (in front of her) */}
      {bubR > 1 ? <Bubble id="home" x={bx} y={by} r={bubR} tone={PINK_GUM} opacity={0.55} wob={Math.sin(f * 0.7) * 0.02} /> : null}
      {f >= 880 && f < RELEASE + 6 ? <div style={{ position: "absolute", left: bx - bubR - 20, top: by - 20, width: 40, height: 40, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,240,180,0.95), rgba(255,240,180,0))", opacity: 0.6 + 0.4 * Math.sin(f / 2) }} /> : null}
      <PopBurst f={f} at={HOME} x={GAP[0]} y={GAP[1]} r={200} tones={["#FFE9A8", "#FFF6D0", "#F9A6CB"]} n={14} />
      {f < TO_HANDS + 4 ? <StarBush part={lerp(f, [PEEK, REVEAL], [0, 1])} glow={f >= LANDED ? 0.8 + 0.2 * Math.sin(f / 4) : 0} /> : null}
      {/* the sparkle she sends him */}
      {f >= SPARKLE && f < SPARKLE + 26 ? (
        <div style={{ position: "absolute", left: sparkle[0] - 26, top: sparkle[1] - 26, width: 52, height: 52, background: "#FFF3C4", clipPath: "polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)", opacity: interpolate(f, [SPARKLE, SPARKLE + 4, SPARKLE + 20, SPARKLE + 26], [0, 1, 1, 0], clamp), rotate: `${f * 6}deg`, filter: "drop-shadow(0 0 12px #FFE9A8)" }} />
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------- camera
const MAIN: Cam[] = [
  [0, 700, -1200, 0.5], // the night sky
  [60, 700, -1200, 0.5],
  [100, 700, 200, 0.5], // follow the falling star down
  [LANDED + 6, 850, 1250, 0.9],
  [DOOR + 8, 560, 1200, 0.85], // he comes out
  [190, 820, 1280, 1.15], // the bush
  [262, 820, 1250, 1.35], // the star in his hands
  [296, 820, 1250, 1.35],
  [306, 960, 1240, 0.9], // hide and seek
  [362, 980, 1200, 0.85], // bubbles
  [SKY, 980, 1250, 1.0],
  [462, 850, -300, 0.42], // the sky: the empty spot
  [496, 850, -300, 0.42],
  [520, 1000, 1260, 1.3], // she grows weak
  [HUG, 1000, 1260, 1.4],
  [STAND, 1050, 1220, 0.95],
  [INSIDE, 1100, 1180, 0.95],
  [RELEASE, 1100, 1180, 0.95],
  [980, 900, -500, 0.5], // the bubble rises
  [HOME + 26, 800, -1350, 0.62], // the constellation lights up
  [1066, 1000, 1220, 0.9], // alone again
  [SPARKLE + 22, 1000, 1260, 1.25],
  [1150, 1000, 1250, 1.2],
  [STAR_END, 900, 300, 0.42], // pull up: him, and her, shining
];

const Caption: React.FC<{ f: number; from: number; to: number; text: string }> = ({ f, from, to, text }) => {
  const o = interpolate(f, [from, from + 10, to - 10, to], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1590, textAlign: "center", opacity: o, translate: `0px ${(1 - o) * 20}px` }}>
      <span style={{ display: "inline-block", padding: "18px 40px", borderRadius: 40, background: "rgba(8,10,40,0.55)", fontFamily: scriptFont, fontSize: 64, color: "#FFF3C4", textShadow: "0 3px 0 rgba(0,0,0,0.35)", lineHeight: 1.2 }}>{text}</span>
    </div>
  );
};

export const FallenStarScene: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camAt(MAIN, f);
  const { cx, cy, z } = cam;
  const sad = f >= HUG && f < STAND ? lerp(f, [HUG, 680, 740, STAND], [0, 0.35, 0.35, 0]) : 0;

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#070B2A" }}>
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${540 - cx * z}px, ${960 - cy * z}px) scale(${z})` }}>
        <World f={f} />
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 45%, rgba(5,5,30,0.55) 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, rgba(0,0,0,0) 30%, rgba(5,5,30,0.9) 100%)", opacity: sad }} />

      <SeriesTitle episode={6} title="L'Étoile tombée" titleColor="#FFD84D" outAt={56} />
      <Caption f={f} from={70} to={150} text="Une nuit, une petite étoile tomba du ciel…" />
      <Caption f={f} from={212} to={292} text="Elle avait peur, et elle était toute seule." />
      <Caption f={f} from={316} to={396} text="Ils devinrent les meilleurs amis du monde." />
      <Caption f={f} from={528} to={622} text="Mais loin du ciel, une étoile ne peut pas briller longtemps…" />
      <Caption f={f} from={652} to={752} text="Il pouvait la garder… ou l'aider à rentrer." />
      <Caption f={f} from={1060} to={1152} text="Aimer quelqu'un, c'est parfois l'aider à rentrer chez lui…" />
      <Caption f={f} from={1162} to={STAR_END + 6} text="…et chaque nuit, elle brille pour lui." />
      <AbsoluteFill style={{ background: colors.white, opacity: f >= HOME && f < HOME + 6 ? (1 - (f - HOME) / 6) * 0.35 : 0 }} />
    </AbsoluteFill>
  );
};
