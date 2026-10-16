import type React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Goo } from "../../bubblepop/Goo";
import { SeriesTitle } from "../../brand/SeriesTitle";
import { alternate, hop, poseAt, rigBox, rigToScreen } from "../../final/kit";
import { AnimatedMonster } from "../../rig/AnimatedMonster";
import { blinkAt, type Key, sortKeys } from "../../rig/pose";
import { GumPiece, Starburst } from "../../story/Props";
import { GROUND_Y, World } from "../../story/World";
import { bodyFont, candyText, colors, displayFont } from "../../theme";
import { Bat, BucketShape, Ghost, type GhostPose, Pumpkin, Sheet, SpookyHouse } from "./Halloween";

const ANCHOR: [number, number] = [540, GROUND_Y - 20];
const WIDTH = 480;
const SCALE = WIDTH / 400;
const X = (screenX: number) => (screenX - 540) / SCALE; // screen x -> rig x

// beats
const BOUH = 100;
const HIDE = 125;
const IDEA = 172;
const CHOMP = 202;
const BLOW = 243;
export const POP = 300;
const LICK = 360;
const ZOOM_AT = 408;
const OFFER = 436;

// hop without arm keys (his hands are busy with the bucket under the costume)
const hopBody = (s: number, x0: number, x1: number, h: number): Key[] =>
  hop(s, x0, x1, h).map((k) => {
    const rest: Key = { ...k };
    delete rest.armL;
    delete rest.armR;
    return rest;
  });

export const MONSTER_KEYS: Key[] = sortKeys([
  // trick-or-treating, in his ghost costume, bucket in hand
  { f: 0, x: X(-300), y: 0, turn: 0.12, lookX: 0.5, armL: -46, armR: -46, mouthOpen: 0.6 },
  ...hopBody(24, X(-300), X(180), 120),
  ...hopBody(40, X(180), X(468), 120),
  { f: 58, turn: 0.3, lookX: 0.8 },
  // knock knock knock
  ...alternate(64, 78, 3, { rot: 5, bend: 6 }, { rot: 0, bend: 0 }),
  { f: 80, rot: 0, bend: 0 },
  { f: 86, rot: -3, eyeScale: 1.12, lookX: 0.9 },
  { f: 98, eyeScale: 1.12, rot: -3 },
  // BOUH! he jumps right out of his costume
  { f: BOUH, y: -150, sy: 1.3, eyeScale: 1.45, pupil: 0.5, browY: -30, mouthOpen: 1, mouthWidth: 0.45, armL: 160, armR: 160, legSpread: 0.6, rot: 0, turn: 0, lookX: 0.6, ease: "snap" },
  { f: BOUH + 6, sy: 1.15, eyeScale: 1.35, ease: "out" },
  { f: BOUH + 8, y: -150, ease: "hold" },
  // ...and dashes behind the pumpkin
  { f: 110, turn: -0.45, lookX: -0.6, x: X(468) },
  { f: 112, legLift: 0.6 },
  { f: 116, y: 0, ease: "in" },
  { f: 120, y: -50, ease: "out" },
  { f: 122, legLift: 0 },
  { f: 124, x: X(262), y: 0, ease: "in" },
  { f: HIDE, sy: 0.8, ease: "snap" },
  { f: 130, sy: 0.82, y: 18, turn: 0.3, lookX: 0.9, lookY: -0.2, browTilt: 16, browY: -4, eyeScale: 1.15, pupil: 0.8, mouthOpen: 0.3, mouthWidth: 0.45, smile: -0.5, armL: -30, armR: -30, legSpread: 0 },
  ...alternate(132, 168, 2, { x: X(262) + 2.5 }, { x: X(262) - 2.5 }).map((k) => ({ ...k, ease: "linear" as const })),
  ...blinkAt(150),
  // the idea!
  { f: IDEA, x: X(262), sy: 1.02, y: 0, eyeScale: 1.15, browY: -16, browTilt: 0, lookY: -0.5, lookX: 0.3, armR: 150, curlR: -0.3, mouthOpen: 0.45, mouthWidth: 0.7, smile: 1, pupil: 1, ease: "snap" },
  { f: IDEA + 4, sy: 1, ease: "out" },
  { f: 184, browTilt: -14, browY: 4, lookX: 0.6, lookY: 0.2, mouthOpen: 0.35, mouthWidth: 0.8, armR: 8, curlR: 0, turn: 0.25 },
  // scoops a gum off the ground, flips it into his mouth
  { f: 190, armL: -70, rot: -6, sy: 0.92 },
  { f: 194, armL: 40, rot: 0, sy: 1, lookY: -0.3, ease: "snap" },
  { f: 198, mouthOpen: 1, mouthWidth: 0.7 },
  { f: CHOMP, mouthOpen: 0, mouthWidth: 0.55, sy: 0.85, squint: 1, armL: 8, ease: "snap" },
  { f: CHOMP + 4, sy: 1, ease: "out" },
  ...alternate(CHOMP + 4, 216, 5, { mouthOpen: 0.08, cheeks: 1 }, { mouthOpen: 0.28, cheeks: 0.55 }),
  // brave now: steps out to face the ghost
  { f: 218, squint: 0, browTilt: -14, browY: 4, cheeks: 0, mouthOpen: 0.3, mouthWidth: 0.6, smile: 0.6 },
  ...hop(218, X(262), X(492), 90),
  { f: 234, turn: 0.25, lookX: 0.7 },
  { f: 238, sy: 1.08, cheeks: 1, mouthOpen: 0.3, mouthWidth: 0.28, armL: 30, armR: 30, browTilt: -10 },
  { f: BLOW, sy: 0.98, cheeks: 0.8, rot: 4 },
  { f: 270, squint: 0.3 },
  { f: 296, squint: 0.3, rot: 4 },
  // BOUM
  { f: POP, sy: 0.88, eyeScale: 1.25, browY: -20, browTilt: 0, cheeks: 0, mouthOpen: 0.9, mouthWidth: 0.5, squint: 0, rot: 0, ease: "snap" },
  { f: POP + 6, eyeScale: 1, sy: 1, ease: "out" },
  // laughing together
  { f: 312, squint: 1, mouthOpen: 1, mouthWidth: 1, browY: -10, armL: 60, armR: 60 },
  ...alternate(314, 354, 4, { y: -12, sy: 1.02 }, { y: 0, sy: 0.97 }),
  { f: 358, y: 0, sy: 1, squint: 0, mouthOpen: 0.85, lookX: 0.7, armL: 8, armR: 8 },
  // friendship jump
  { f: 382, sy: 1, squint: 0 },
  { f: 384, sy: 0.8, squint: 1, armL: -20, armR: -20, y: 0 },
  { f: 388, y: -110, sy: 1.1, armL: 150, armR: 150, legLift: 0.8, ease: "out" },
  { f: 395, legLift: 0 },
  { f: 396, y: 0, ease: "in" },
  { f: 397, sy: 0.78, ease: "snap" },
  { f: 402, sy: 1, ease: "out" },
  // close-up: "A toi !"
  { f: 410, turn: 0, lookX: 0, squint: 0, mouthOpen: 0.9, armL: 8, armR: 8 },
  { f: OFFER, armL: -46, armR: -46, browY: -8, ease: "out" },
  { f: 450, rot: 4 },
  { f: 470, sy: 1 },
]);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lerp = (f: number, i: number[], o: number[], ease = Easing.inOut(Easing.cubic)) => interpolate(f, i, o, { ...clamp, easing: ease });

// The ghost's performance, frame by frame.
const ghostAt = (f: number): (GhostPose & { x: number; y: number; size: number; alpha: number }) | null => {
  if (f < 92) return null;
  const alpha = lerp(f, [92, 100], [0, 1]);
  const x = f < 300 ? lerp(f, [92, 100, 108, 124, 140, 243, 290], [860, 860, 700, 700, 800, 800, 880]) : lerp(f, [300, 340, 356, 372], [880, 880, 790, 790]);
  const yBase = f < 300 ? lerp(f, [92, 100, 108, 124, 140, 243, 290], [1330, 1290, 1120, 1120, 1050, 1060, 960]) : lerp(f, [300, 340, 356], [960, 960, 1130]);
  const jump = f >= 384 && f < 398 ? -Math.sin(((f - 384) / 14) * Math.PI) * 90 : 0;
  const size = f < 300 ? lerp(f, [92, 100, 108, 124, 140, 243, 290], [200, 260, 430, 430, 360, 360, 300]) : lerp(f, [300, 340, 356], [300, 300, 380]);
  const giggle = f >= 326 && f < 356 ? Math.sin(f * 1.3) * 5 : 0;
  return {
    x: x + (f >= 108 && f < 124 ? Math.sin(f * 2.2) * 6 : 0),
    y: yBase + jump,
    size,
    alpha,
    mouth: f < 108 ? lerp(f, [96, 104], [0.2, 1]) : f < 124 ? 0.9 : f < 300 ? (f > 250 ? 0.55 : 0.3) : f < LICK ? 0.7 : f < 374 ? 0.5 : 0.7,
    happy: (f >= 130 && f < 172) || (f >= 326 && f < LICK + 14) || f >= 380 ? 1 : 0,
    scared: f < 300 ? lerp(f, [250, 270], [0, 1]) : lerp(f, [300, 320], [1, 0]),
    pink: lerp(f, [POP, POP + 3], [0, 1]),
    arms: f < 124 ? lerp(f, [100, 106], [0, 1]) : f >= 380 ? 0.9 : 0.4,
    lean: (f >= 280 && f < 300 ? Math.sin(f * 2) * 4 : 0) + giggle + (f >= 304 && f < 324 ? 10 : 0),
    tongue: f >= LICK && f < LICK + 14 ? 1 : 0,
  };
};

const ghostBubbleR = (f: number) =>
  f < 296 ? interpolate(f, [BLOW, 296], [0, 230], { ...clamp, easing: Easing.inOut(Easing.quad) }) : f < POP ? 238 : 0;

const GhostBubble: React.FC<{ x: number; y: number; r: number; wob: number }> = ({ x, y, r, wob }) => (
  <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <defs>
      <radialGradient id="ghostBubble" cx="38%" cy="30%" r="80%">
        <stop offset="0%" stopColor="#FFE3EF" stopOpacity={0.95} />
        <stop offset="60%" stopColor="#F9A6CB" stopOpacity={0.93} />
        <stop offset="100%" stopColor="#EE79B1" stopOpacity={0.96} />
      </radialGradient>
    </defs>
    <g transform={`translate(${x} ${y}) scale(${(r / 110) * (1 + wob)} ${(r / 110) * (1 - wob)})`}>
      <path d="M -110 10 C -110 -90 -60 -150 0 -150 C 60 -150 110 -90 110 10 L 110 118 Q 88 152 66 118 Q 44 152 22 118 Q 0 152 -22 118 Q -44 152 -66 118 Q -88 152 -110 118 Z" fill="url(#ghostBubble)" stroke="rgba(255,255,255,0.65)" strokeWidth={4} />
      <ellipse cx={-50} cy={-100} rx={30} ry={13} fill="white" opacity={0.75} transform="rotate(-25 -50 -100)" />
      {/* silly ghost face */}
      <circle cx={-38} cy={-40} r={20} fill="white" />
      <circle cx={38} cy={-40} r={20} fill="white" />
      <circle cx={-30} cy={-36} r={9} fill="#3A0F2A" />
      <circle cx={30} cy={-44} r={9} fill="#3A0F2A" />
      <path d="M -40 20 Q -20 40 0 20 Q 20 40 40 20" stroke="#3A0F2A" strokeWidth={8} fill="none" strokeLinecap="round" />
      <ellipse cx={10} cy={40} rx={14} ry={12} fill="#E8456E" />
    </g>
  </svg>
);

const BigText: React.FC<{ text: string; at: number; out: number; top: number; fill: string; stroke: string; size?: number; jitter?: boolean }> = ({
  text,
  at,
  out,
  top,
  fill,
  stroke,
  size = 190,
  jitter,
}) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [at, at + 7, out, out + 6], [0, 1, 1, 0], { ...clamp, easing: Easing.out(Easing.back(2.2)) });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        textAlign: "center",
        fontFamily: displayFont,
        fontSize: size,
        ...candyText(fill, stroke, 15),
        scale: s,
        rotate: `${-5 + (jitter ? Math.sin(f * 2.5) * 3 : Math.sin(f / 5) * 2)}deg`,
      }}
    >
      {text}
    </div>
  );
};

export const StreetScene: React.FC = () => {
  const f = useCurrentFrame();
  const pose = poseAt(MONSTER_KEYS, f);
  const cameraY = lerp(f, [0, 30], [600, 0]);
  const ghost = ghostAt(f);

  // costume: worn until BOUH, then it floats off him and drapes to the ground
  const p99 = poseAt(MONSTER_KEYS, BOUH - 1);
  const sheetT = interpolate(f, [BOUH, BOUH + 40], [0, 1], clamp);
  const sheetDy = -Math.sin(Math.min(1, sheetT * 2) * Math.PI) * 60 + Easing.in(Easing.quad)(sheetT) * 120;

  // bucket: held, flung at BOUH, lands and spills candy
  const bucketFrom = rigToScreen(p99, ANCHOR, SCALE, 200, 420);
  const bt = interpolate(f, [BOUH, BOUH + 22], [0, 1], clamp);
  const bucket: [number, number] = [bucketFrom[0] + (420 - bucketFrom[0]) * bt, bucketFrom[1] + (1440 - bucketFrom[1]) * bt - Math.sin(Math.PI * bt) * 260];
  const spill = interpolate(f, [BOUH + 20, BOUH + 32], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const candies: [number, number][] = [[330, 1478], [560, 1486], [680, 1492]];

  // gum flip into his mouth
  const flipT = interpolate(f, [194, CHOMP], [0, 1], clamp);
  const mouthAt = rigToScreen(poseAt(MONSTER_KEYS, CHOMP), ANCHOR, SCALE, 230, 320);
  const gx = candies[0][0] + (mouthAt[0] - candies[0][0]) * flipT;
  const gy = candies[0][1] + (mouthAt[1] - candies[0][1]) * flipT - Math.sin(Math.PI * flipT) * 360;

  // ghost-shaped bubble from his mouth toward the ghost
  const r = ghostBubbleR(f);
  const mouth = rigToScreen(pose, ANCHOR, SCALE, 230, 300);
  const wob = Math.sin(f * 1.7) * 0.05 * interpolate(f, [282, POP], [0, 1], clamp);
  const bubbleAt: [number, number] = [mouth[0] + r * 1.05 + 30, mouth[1] - r * 0.3];
  const burst = interpolate(f, [POP, POP + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

  // dolly-in on his face for "A toi !"
  const face = rigToScreen(poseAt(MONSTER_KEYS, ZOOM_AT), ANCHOR, SCALE, 200, 230);
  const push = lerp(f, [ZOOM_AT, ZOOM_AT + 24], [0, 1]);
  const zoom = 1 + 0.9 * push;
  const tx = (540 - face[0]) * push;
  const ty = (880 - face[1]) * push;
  const toScreen = (p: [number, number]): [number, number] => [face[0] + (p[0] - face[0]) * zoom + tx, face[1] + (p[1] - face[1]) * zoom + ty];
  const hands = toScreen(rigToScreen(pose, ANCHOR, SCALE, 200, 400));
  const offer = interpolate(f, [452, 518], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });

  const held =
    f < BOUH ? (
      <g transform="translate(140 360) scale(0.6)">
        <BucketShape />
      </g>
    ) : f >= OFFER && f < 452 ? (
      <g transform={`translate(200 400) scale(${interpolate(f, [OFFER, OFFER + 6], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) })})`}>
        <image href={staticFile("pack-fraise.webp")} x={-62} y={-114} width={124} height={228} />
      </g>
    ) : null;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transformOrigin: `${face[0]}px ${face[1]}px`, scale: zoom, translate: `${tx}px ${ty}px` }}>
        <World night cameraY={cameraY} />
        <AbsoluteFill style={{ translate: `0px ${cameraY}px` }}>
          {[[200, 300, 0], [700, 220, 1.5], [420, 520, 3]].map(([bx, by, ph], i) => (
            <Bat key={i} x={(bx + f * (i % 2 ? -4 : 5) + 1400) % 1400 - 160} y={by + Math.sin(f / 10 + ph) * 30} size={110 - i * 15} phase={ph} />
          ))}
          <Pumpkin style={{ position: "absolute", left: 60, top: 1170, width: 110 }} />
          <SpookyHouse
            door={lerp(f, [84, 96], [0, 1])}
            eyes={f < BOUH ? lerp(f, [88, 94], [0, 1]) : 0}
            style={{ position: "absolute", left: 640, top: 700, width: 440, height: 820 }}
          />
          <Pumpkin style={{ position: "absolute", left: 960, top: 1430, width: 120 }} />
          {/* spilled bucket + candy */}
          {f >= BOUH ? (
            <svg viewBox="0 0 200 200" style={{ position: "absolute", left: bucket[0] - 70, top: bucket[1] - 70, width: 140, height: 140, rotate: `${bt * 150}deg`, overflow: "visible" }}>
              <BucketShape />
            </svg>
          ) : null}
          {spill > 0
            ? candies.map(([cx, cy], i) =>
                i === 0 && f >= 194 ? null : (
                  <GumPiece
                    key={i}
                    style={{
                      position: "absolute",
                      width: 90,
                      left: 420 + (cx - 420) * spill - 45,
                      top: 1440 + (cy - 1440) * spill - 36 - Math.sin(Math.PI * spill) * 120,
                      rotate: `${spill * (i - 1) * 200}deg`,
                    }}
                  />
                ),
              )
            : null}
          {f >= BOUH ? (
            <Img src={staticFile("pack-pasteque-single.webp")} style={{ position: "absolute", width: 150, left: 400 + spill * -60, top: 1440 + spill * 45, rotate: `${spill * -25}deg`, opacity: spill }} />
          ) : null}
          {/* the costume, once he has jumped out of it */}
          {f >= BOUH ? (
            <svg
              viewBox="0 0 400 500"
              style={{
                ...rigBox(ANCHOR, WIDTH),
                overflow: "visible",
                translate: `${p99.x * SCALE + sheetT * 40}px ${p99.y * SCALE + sheetDy}px`,
                rotate: `${Math.sin(sheetT * 6) * 8 * (1 - sheetT)}deg`,
                scale: `1 ${1 - Easing.in(Easing.quad)(sheetT) * 0.6}`,
                transformOrigin: "50% 94%",
              }}
            >
              <Sheet />
            </svg>
          ) : null}
          {ghost && f >= LICK - 2 ? (
            <Sequence from={LICK + 2} durationInFrames={40} layout="none" name="Ghost tastes the filling">
              <AbsoluteFill style={{ opacity: interpolate(f, [LICK + 26, LICK + 40], [1, 0], clamp) }}>
                <Goo x={ghost.x} y={ghost.y + 20} color="#C70D3A" light="#FF7A9A" />
              </AbsoluteFill>
            </Sequence>
          ) : null}
          <AnimatedMonster keys={MONSTER_KEYS} held={held} over={f < BOUH ? <Sheet /> : null} style={rigBox(ANCHOR, WIDTH)} />
          {ghost ? (
            <div style={{ opacity: ghost.alpha }}>
              <Ghost {...ghost} />
            </div>
          ) : null}
          <Pumpkin style={{ position: "absolute", left: 80, top: 1290, width: 360 }} />
          {f >= 194 && f < CHOMP ? (
            <GumPiece style={{ position: "absolute", width: 90, left: gx - 45, top: gy - 36, scale: 1 - flipT * 0.6, rotate: `${flipT * 400}deg` }} />
          ) : null}
          {r > 1 ? <GhostBubble x={bubbleAt[0]} y={bubbleAt[1]} r={r} wob={wob} /> : null}
          {f >= POP && f < POP + 30
            ? Array.from({ length: 14 }, (_, i) => {
                const a = (i / 14) * Math.PI * 2;
                const d = 420 + (i % 4) * 120;
                const sz = 46 + ((i * 29) % 40);
                const at = rigToScreen(poseAt(MONSTER_KEYS, POP), ANCHOR, SCALE, 230, 300);
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: at[0] + 170 - sz / 2,
                      top: at[1] - 80 - sz / 2,
                      width: sz,
                      height: sz * 0.7,
                      borderRadius: "48% 52% 40% 60% / 55% 45% 55% 45%",
                      backgroundColor: i % 2 ? "#F9A6CB" : "#FFD3E6",
                      translate: `${Math.cos(a) * d * burst}px ${Math.sin(a) * d * burst + burst * burst * 160}px`,
                      opacity: interpolate(f, [POP + 18, POP + 30], [1, 0], clamp),
                    }}
                  />
                );
              })
            : null}
        </AbsoluteFill>
        {/* night vignette */}
        <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, rgba(0,0,0,0) 55%, rgba(20,6,40,0.45) 100%)" }} />
      </AbsoluteFill>

      <SeriesTitle episode={2} title="Boum-Boo !" titleColor="#F27A1A" outAt={50} />
      <BigText text="BOUH !" at={BOUH} out={122} top={430} fill="#F6F2FF" stroke="#4E2470" jitter />
      {f >= POP && f < POP + 34 ? (
        <div style={{ position: "absolute", left: 190, top: 300, width: 700, height: 520, display: "flex", alignItems: "center", justifyContent: "center", scale: interpolate(f, [POP, POP + 6, POP + 26, POP + 34], [2.2, 1, 1, 0], { ...clamp, easing: Easing.out(Easing.back(1.6)) }), rotate: "-7deg" }}>
          <Starburst color="#FFD84D" style={{ position: "absolute", width: 700, height: 520 }} />
          <div style={{ position: "relative", fontFamily: displayFont, fontSize: 200, ...candyText(colors.logoRed, colors.white, 16) }}>BOUM !</div>
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", scale: interpolate(f, [LICK + 4, LICK + 12, 404, 410], [0, 1, 1, 0], { ...clamp, easing: Easing.out(Easing.back(2)) }) }}>
        <div style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 66, color: "white", textShadow: "0 4px 0 rgba(0,0,0,0.3)" }}>Fourré coulis goût</div>
        <div style={{ fontFamily: displayFont, fontSize: 200, lineHeight: 1, ...candyText(colors.logoRed, colors.white, 15), rotate: "-4deg" }}>PASTÈQUE !</div>
      </div>
      <BigText text="À toi !" at={OFFER + 4} out={470} top={230} fill={colors.logoRed} stroke={colors.white} />
      {f >= 452 ? (
        <Img
          src={staticFile("pack-fraise.webp")}
          style={{
            position: "absolute",
            width: 300,
            left: hands[0] + (540 - hands[0]) * offer - 150,
            top: hands[1] + (900 - hands[1]) * offer - 276,
            scale: 1 + offer * 3.6,
            rotate: `${-4 + offer * 4}deg`,
            filter: "drop-shadow(0 20px 24px rgba(0,0,0,0.3))",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
