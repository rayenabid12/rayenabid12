import type React from "react";
import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { AnimatedMonster } from "../../rig/AnimatedMonster";
import { blinkAt, type Key, sortKeys } from "../../rig/pose";
import { GumPiece, GumShape, MelonSlice } from "../../story/Props";
import { GROUND_Y, World } from "../../story/World";
import { candyText, colors, displayFont } from "../../theme";
import { alternate, hop, poseAt, rigBox, rigToScreen } from "../kit";

export const ANCHOR: [number, number] = [540, GROUND_Y - 20];
export const WIDTH = 560;
export const SCALE = WIDTH / 400;

// Timing (frames)
const PACK_IN = 102;
const RIP = 126;
const CATCH = 132;
const TOSS = 142;
const GULP = 158;
const IDEA = 213;
const BLOW = 233;
export const POP = 300;

// One continuous shot: hop in, wave, unwrap, catch the gum, chew, idea, blow, lift-off.
export const OPENING_KEYS: Key[] = sortKeys([
  // entrance: two clean hops, looking where he's going
  { f: 0, x: 640, y: 0, turn: -0.12, lookX: -0.5, armL: 20, armR: 20, mouthOpen: 0.9, browY: -6 },
  ...hop(6, 640, 300),
  ...hop(22, 300, 0),
  { f: 41, turn: -0.12, lookX: -0.5 },
  { f: 48, turn: 0, lookX: 0, browY: 0, ease: "out" },
  // hello
  { f: 50, sy: 1, y: 0, armR: 20, bend: 0, mouthOpen: 0.9 },
  { f: 54, sy: 0.93, y: 6, armR: -15, bend: -6, browY: 2, mouthOpen: 0.6 },
  { f: 58, sy: 1.05, y: -5, armR: 112, bend: 8, browY: -12, mouthOpen: 1, rot: -3, turn: 0.1, ease: "snap" },
  { f: 63, sy: 1, y: 0, ease: "out" },
  ...alternate(63, 87, 6, { armR: 112, curlR: -0.5, sy: 1 }, { armR: 84, curlR: 0.5, sy: 0.975 }),
  { f: 69, rot: 3 },
  { f: 81, rot: -3 },
  { f: 92, armR: 100, curlR: 0 },
  ...blinkAt(75),
  // a pack appears in his hands
  { f: 98, armL: 20, armR: 100, rot: 0, turn: 0, bend: 0, lookY: 0, browY: -12, eyeScale: 1, mouthOpen: 1, mouthWidth: 1 },
  { f: 104, armL: -46, armR: -46, lookY: 0.75, browY: -18, eyeScale: 1.15, mouthOpen: 0.5, mouthWidth: 0.5 },
  { f: 110, mouthOpen: 0.6, mouthWidth: 1, eyeScale: 1.05, browY: -8, ease: "out" },
  ...alternate(112, 122, 2, { armL: -46, armR: -40, rot: 1.5 }, { armL: -40, armR: -46, rot: -1.5 }),
  { f: 124, rot: 0, armL: -46, armR: -46, sy: 1 },
  // rip: tosses the wrapper over his shoulder
  { f: RIP, armL: 75, armR: 15, sy: 1.04, browY: -14, lookY: 0.2, ease: "snap" },
  { f: RIP + 4, sy: 1, ease: "out" },
  // catches the gum that pops out
  { f: CATCH, armL: -46, armR: -46, lookY: 0.75, eyeScale: 1.12, mouthOpen: 0.6 },
  // wind-up and toss
  { f: TOSS - 4, armL: -20, armR: -20, sy: 0.9, y: 5, lookY: 0.3, eyeScale: 1.05 },
  { f: TOSS, armL: 30, armR: 95, sy: 1.05, y: -4, lookY: -0.9, lookX: 0.4, ease: "snap" },
  { f: TOSS + 5, y: 0, sy: 1, ease: "out" },
  // tracks it across, then leans and turns to catch it from the side
  { f: TOSS + 7, lookX: 0.8, lookY: -0.7, turn: 0.15 },
  { f: GULP - 4, lookX: 0.9, lookY: 0, turn: 0.32, rot: 6, mouthOpen: 1, mouthWidth: 0.7, armL: 20, armR: 20 },
  // chomp + gulp
  { f: GULP, mouthOpen: 0, mouthWidth: 0.55, sy: 0.82, armL: 20, armR: 20, eyeScale: 1, browY: -6, lookY: 0, lookX: 0, ease: "snap" },
  { f: GULP + 6, turn: 0, rot: 0 },
  { f: GULP + 4, squint: 1, ease: "out" },
  { f: GULP + 5, sy: 1.03, ease: "out" },
  { f: GULP + 9, sy: 1 },
  ...alternate(GULP + 4, 204, 6, { mouthOpen: 0.08, cheeks: 1, sy: 1 }, { mouthOpen: 0.3, cheeks: 0.55, sy: 0.97 }),
  ...alternate(GULP + 4, 204, 12, { turn: 0.12, rot: 2 }, { turn: -0.12, rot: -2 }),
  ...alternate(GULP + 4, 204, 8, { armL: -45, armR: -30 }, { armL: -30, armR: -45 }),
  // swallow... then the idea!
  { f: 206, mouthOpen: 0, mouthWidth: 0.6, sy: 0.94, cheeks: 0.3, turn: 0, rot: 0, armL: -30, armR: -30, squint: 1 },
  { f: 210, sy: 1.02, cheeks: 0, ease: "out" },
  { f: IDEA, squint: 0, eyeScale: 1.15, browY: -16, lookY: -0.5, lookX: 0.3, armR: 150, curlR: -0.3, armL: 8, mouthOpen: 0.45, mouthWidth: 0.7, sy: 1.04, ease: "snap" },
  { f: IDEA + 4, sy: 1, ease: "out" },
  // determined smirk to camera
  { f: 222, lookY: 0, lookX: 0, eyeScale: 1, browTilt: -14, browY: 4, mouthOpen: 0.35, mouthWidth: 0.8, smile: 1, armR: 8, curlR: 0 },
  // deep breath, then blow
  { f: 228, sy: 1.08, cheeks: 1, mouthOpen: 0.3, mouthWidth: 0.28, armL: 30, armR: 30, browTilt: -10, browY: 4 },
  { f: BLOW, sy: 0.98, cheeks: 0.8, lookY: 0.6 },
  { f: 245, y: 0 },
  { f: 250, lookY: 0.8, eyeScale: 1.05 },
  { f: 292, y: -214 },
  ...alternate(250, 292, 8, { armL: 70, armR: 55 }, { armL: 55, armR: 70 }),
  { f: 255, legSpread: 0.3 },
  // uh-oh
  { f: 265, browTilt: 16, browY: -4, eyeScale: 1.2, lookY: 0, cheeks: 0.6 },
  { f: 280, lookY: 0.9, ease: "out" },
  { f: 284, sy: 1 },
  { f: 286, sy: 0.94 },
  { f: 290, sy: 1 },
  { f: 291, x: 0 },
  ...alternate(292, 300, 2, { x: 3 }, { x: -3 }).map((k) => ({ ...k, ease: "linear" as const })),
]);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const PACK_W = 230; // rig units
const PACK_Y = 405; // held at belly height, below the mouth
const PACK_H = (PACK_W * 555) / 1154;

export const bubbleRadius = (f: number) =>
  f < 280
    ? interpolate(f, [BLOW, 280], [0, 290], { ...clamp, easing: Easing.inOut(Easing.quad) })
    : interpolate(f, [280, POP], [290, 345], clamp);

export const OpeningScene: React.FC = () => {
  const f = useCurrentFrame();
  const pose = poseAt(OPENING_KEYS, f);

  // held props live inside the rig, between his body and his hands
  const packPop = interpolate(f, [PACK_IN, PACK_IN + 6], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.2)) });
  const gumPop = interpolate(f, [RIP + 1, CATCH], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.5)) });
  const gumRise = interpolate(f, [RIP + 1, RIP + 4, CATCH], [0, -70, 0], clamp);
  let held: React.ReactNode = null;
  if (f >= PACK_IN && f < RIP) {
    held = (
      <g transform={`translate(200 ${PACK_Y}) rotate(${pose.rot * 2}) scale(${packPop})`}>
        <image href={staticFile("pack-pasteque-single.webp")} x={-PACK_W / 2} y={-PACK_H / 2} width={PACK_W} height={PACK_H} />
      </g>
    );
  } else if (f >= RIP + 1 && f < TOSS - 4) {
    held = (
      <g transform={`translate(200 ${PACK_Y + gumRise}) scale(${0.45 * gumPop}) translate(-150 -125)`}>
        <GumShape shadow={false} />
      </g>
    );
  }

  // the wrapper, tossed over his left shoulder (drawn behind him)
  const wrapT = interpolate(f, [RIP, RIP + 16], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const wrapFrom = rigToScreen(poseAt(OPENING_KEYS, RIP), ANCHOR, SCALE, 200, PACK_Y);
  // the gum flight: from the hands up and down into the mouth
  const tossT = interpolate(f, [TOSS, GULP], [0, 1], clamp);
  // the gum leaves from his right hand, arcs up and out, then comes in from the
  // side into his mouth, so it never crosses his eyes
  const rightHand = (fr: number) => {
    const p = poseAt(OPENING_KEYS, fr);
    const a = ((62 - p.armR) * Math.PI) / 180;
    return rigToScreen(p, ANCHOR, SCALE, 326 + Math.cos(a) * 134, 252 + Math.sin(a) * 134);
  };
  const from = rightHand(TOSS);
  const mouth = rigToScreen(poseAt(OPENING_KEYS, GULP - 1), ANCHOR, SCALE, 236, 318);
  const c1: [number, number] = [from[0] + 150, from[1] - 520];
  const c2: [number, number] = [mouth[0] + 440, mouth[1] - 60];
  // during the wind-up the gum travels from the held spot to the throwing hand
  const slot = rigToScreen(poseAt(OPENING_KEYS, TOSS - 4), ANCHOR, SCALE, 200, PACK_Y);
  const handT = interpolate(f, [TOSS - 4, TOSS - 2], [0, 1], clamp);
  const inHand: [number, number] | null =
    f >= TOSS - 4 && f < TOSS
      ? [slot[0] + (rightHand(f)[0] - slot[0]) * handT, slot[1] + (rightHand(f)[1] - slot[1]) * handT]
      : null;
  const u = 1 - tossT;
  const gx = u * u * u * from[0] + 3 * u * u * tossT * c1[0] + 3 * u * tossT * tossT * c2[0] + tossT * tossT * tossT * mouth[0];
  const gy = u * u * u * from[1] + 3 * u * u * tossT * c1[1] + 3 * u * tossT * tossT * c2[1] + tossT * tossT * tossT * mouth[1];
  const gumScale = interpolate(f, [TOSS, GULP - 3, GULP], [1, 0.8, 0.2], clamp);

  const r = bubbleRadius(f);
  const bubbleMouth = rigToScreen(pose, ANCHOR, SCALE, 200, 300);
  const wob = Math.sin(f * 1.7) * 0.04 * interpolate(f, [290, POP], [0, 1], clamp);
  const cameraY =
    f < 40
      ? interpolate(f, [0, 26], [700, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) })
      : interpolate(f, [245, 292], [0, 1450], { ...clamp, easing: Easing.inOut(Easing.cubic) });

  return (
    <>
      <World cameraY={cameraY} />
      {f >= RIP && f < RIP + 16 ? (
        <Img
          src={staticFile("pack-pasteque-single.webp")}
          style={{
            position: "absolute",
            width: 300,
            left: wrapFrom[0] - 150 - wrapT * 560,
            top: wrapFrom[1] - 70 - Math.sin(Math.PI * Math.min(1, wrapT * 1.3)) * 520 + wrapT * 200,
            rotate: `${-wrapT * 540}deg`,
            scale: 1 - wrapT * 0.35,
          }}
        />
      ) : null}
      <AnimatedMonster keys={OPENING_KEYS} held={held} shadow={f < 248} style={rigBox(ANCHOR, WIDTH)} />
      {f >= TOSS - 4 && f < GULP ? (
        <GumPiece
          style={{
            position: "absolute",
            width: 190,
            left: (inHand ? inHand[0] : gx) - 95,
            top: (inHand ? inHand[1] : gy) - 76,
            scale: gumScale,
            rotate: `${tossT * 540}deg`,
          }}
        />
      ) : null}
      {r > 1 ? (
        <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <radialGradient id="openingBubble" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#FFE3EF" stopOpacity={0.95} />
              <stop offset="55%" stopColor="#F9A6CB" stopOpacity={0.93} />
              <stop offset="100%" stopColor="#EE79B1" stopOpacity={0.96} />
            </radialGradient>
          </defs>
          <g transform={`translate(${bubbleMouth[0]} ${bubbleMouth[1] + r * 0.78}) scale(${1 + wob} ${1 - wob})`}>
            <circle r={r} fill="url(#openingBubble)" stroke="rgba(255,255,255,0.6)" strokeWidth={5} />
            <ellipse cx={-r * 0.42} cy={-r * 0.45} rx={r * 0.26} ry={r * 0.12} fill="white" opacity={0.75} transform={`rotate(-35 ${-r * 0.42} ${-r * 0.45})`} />
            <circle cx={r * 0.5} cy={-r * 0.5} r={r * 0.05} fill="white" opacity={0.8} />
          </g>
        </svg>
      ) : null}
      {[
        { at: 168, x: 270, rot: -20 },
        { at: 174, x: 800, rot: 18 },
        { at: 180, x: 350, rot: 8 },
      ].map((m, i) => {
        const t = f - m.at;
        if (t < 0 || t > 30) return null;
        return (
          <MelonSlice
            key={i}
            style={{
              position: "absolute",
              width: 110,
              left: m.x - 55,
              top: 860 - t * 7,
              rotate: `${m.rot + Math.sin(t / 4) * 10}deg`,
              scale: interpolate(t, [0, 5], [0, 1], clamp),
              opacity: interpolate(t, [20, 30], [1, 0], clamp),
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 460,
          textAlign: "center",
          fontFamily: displayFont,
          fontSize: 150,
          ...candyText(colors.logoRed, colors.white, 13),
          scale: interpolate(f, [166, 174, 200, 206], [0, 1, 1, 0], { ...clamp, easing: Easing.out(Easing.back(2.5)) }),
          rotate: `${-6 + Math.sin(f / 5) * 3}deg`,
        }}
      >
        Miam !
      </div>
      {/* the idea: a little spark above his head */}
      {f >= IDEA && f < IDEA + 12 ? (
        <div
          style={{
            position: "absolute",
            left: 640,
            top: 640,
            fontSize: 120,
            scale: interpolate(f, [IDEA, IDEA + 4, IDEA + 12], [0, 1.1, 0], clamp),
            rotate: "12deg",
          }}
        >
          ✨
        </div>
      ) : null}
    </>
  );
};
