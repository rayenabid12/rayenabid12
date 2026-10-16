import type React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Goo } from "../../bubblepop/Goo";
import { SeriesTitle } from "../../brand/SeriesTitle";
import { alternate, hop, poseAt, rigBox, rigToScreen } from "../../final/kit";
import { AnimatedMonster } from "../../rig/AnimatedMonster";
import { blinkAt, type Key, sortKeys } from "../../rig/pose";
import { GumPiece, GumShape, Starburst } from "../../story/Props";
import { bodyFont, candyText, colors, displayFont } from "../../theme";
import { Bat, BucketShape, Ghost, type GhostPose, Pumpkin, Sheet, SpookyHouse } from "./Halloween";
import { GROUND, NightGround, NightSky } from "./NightSet";

// Everything below is in WORLD coordinates; a keyed virtual camera frames each beat.
const ANCHOR: [number, number] = [560, GROUND]; // monster feet at rig x = 0
const WIDTH = 520;
const SCALE = WIDTH / 400;
const X = (worldX: number) => (worldX - ANCHOR[0]) / SCALE;

const HOUSE = { x: 980, y: GROUND - 820, w: 440 }; // door centre ~ (1200, 1290)
const HIDE_PUMPKIN = { x: 130, y: GROUND - 250, w: 340 }; // centre x ~ 300

// beats (30 fps, 120 BPM: a beat every 15 frames)
const ARRIVE = 150;
const KNOCKS = [200, 215, 230];
const DOOR = 245;
const BOUH = 300;
const HIDE = 350;
const IDEA = 425;
const CHOMP = 462;
const BREATH = 530;
const BLOW = 540;
export const POP = 660;
const GIGGLE = 700;
const TASTE = 740;
const CLOSE = 770;
const OFFER = 790;
export const STREET_END = 818;

const hopBody = (s: number, x0: number, x1: number, h: number): Key[] =>
  hop(s, x0, x1, h).map((k) => {
    const rest: Key = { ...k };
    delete rest.armL;
    delete rest.armR;
    return rest;
  });

export const MONSTER_KEYS: Key[] = sortKeys([
  { f: 0, x: X(-250), y: 0, turn: 0.12, lookX: 0.5, armL: -46, armR: -46, mouthOpen: 0.6 },
  { f: 92, x: X(-250) },
  ...hopBody(96, X(-250), X(140), 120),
  ...hopBody(114, X(140), X(480), 120),
  ...hopBody(132, X(480), X(820), 120),
  { f: ARRIVE + 6, turn: 0.12, lookX: 0.5 },
  { f: ARRIVE + 16, turn: 0.3, lookX: 0.8, ease: "out" },
  // knock, knock, knock (on the beat)
  ...KNOCKS.flatMap((k) => [
    { f: k - 2, rot: 0, bend: 0 },
    { f: k, rot: 6, bend: 9, ease: "snap" as const },
    { f: k + 5, rot: 0, bend: 0, ease: "out" as const },
  ]),
  // waiting... the door creaks
  { f: DOOR, eyeScale: 1, rot: 0 },
  { f: 288, eyeScale: 1.18, rot: -3, lookX: 0.9 },
  ...blinkAt(262),
  { f: BOUH - 1, eyeScale: 1.18, rot: -3 },
  // BOUH! he jumps out of his costume
  { f: BOUH, y: -160, sy: 1.3, eyeScale: 1.45, pupil: 0.5, browY: -30, mouthOpen: 1, mouthWidth: 0.45, armL: 160, armR: 160, legSpread: 0.6, rot: 0, turn: 0, lookX: 0.6, ease: "snap" },
  { f: BOUH + 6, sy: 1.15, eyeScale: 1.35, ease: "out" },
  { f: BOUH + 14, y: -160, sy: 1.15, ease: "hold" },
  // ...and runs to the pumpkin
  { f: BOUH + 16, turn: -0.5, lookX: -0.7 },
  ...hop(BOUH + 18, X(820), X(560), 80),
  ...hop(BOUH + 34, X(560), X(300), 80),
  { f: HIDE, sy: 0.8, ease: "snap" },
  { f: HIDE + 6, sy: 0.82, y: 18, turn: 0.3, lookX: 0.9, lookY: -0.2, browTilt: 16, browY: -4, eyeScale: 1.15, pupil: 0.8, mouthOpen: 0.3, mouthWidth: 0.45, smile: -0.5, armL: -30, armR: -30, legSpread: 0 },
  ...alternate(HIDE + 8, 412, 2, { x: X(300) + 2.5 }, { x: X(300) - 2.5 }).map((k) => ({ ...k, ease: "linear" as const })),
  ...blinkAt(395),
  // the idea!
  { f: IDEA - 1, x: X(300), sy: 0.82, y: 18 },
  { f: IDEA, sy: 1.02, y: 0, eyeScale: 1.15, browY: -16, browTilt: 0, lookY: -0.5, lookX: 0.3, armR: 150, curlR: -0.3, mouthOpen: 0.45, mouthWidth: 0.7, smile: 1, pupil: 1, ease: "snap" },
  { f: IDEA + 5, sy: 1, ease: "out" },
  { f: 440, browTilt: -14, browY: 4, lookX: 0.6, lookY: 0.2, mouthOpen: 0.35, mouthWidth: 0.8, armR: 8, curlR: 0, turn: 0.25 },
  // pulls a gum from behind his back, chomp
  { f: 448, armR: -25 },
  { f: 452, armR: 70, lookY: -0.3, ease: "snap" },
  { f: 456, mouthOpen: 1, mouthWidth: 0.7 },
  { f: CHOMP, mouthOpen: 0, mouthWidth: 0.55, sy: 0.85, squint: 1, armR: 8, ease: "snap" },
  { f: CHOMP + 4, sy: 1, ease: "out" },
  ...alternate(CHOMP + 4, 480, 5, { mouthOpen: 0.08, cheeks: 1 }, { mouthOpen: 0.28, cheeks: 0.55 }),
  // steps out bravely
  { f: 482, squint: 0, browTilt: -14, browY: 4, cheeks: 0, mouthOpen: 0.3, mouthWidth: 0.6, smile: 0.6 },
  ...hop(484, X(300), X(420), 90),
  { f: 500, turn: 0.25, lookX: 0.7 },
  { f: BREATH - 4, sy: 1 },
  { f: BREATH, sy: 1.08, cheeks: 1, mouthOpen: 0.3, mouthWidth: 0.28, armL: 30, armR: 30, browTilt: -10 },
  { f: BLOW, sy: 0.98, cheeks: 0.8, rot: 4 },
  { f: 600, squint: 0.3 },
  { f: POP - 1, squint: 0.3, rot: 4 },
  // BOUM
  { f: POP, sy: 0.88, eyeScale: 1.25, browY: -20, browTilt: 0, cheeks: 0, mouthOpen: 0.9, mouthWidth: 0.5, squint: 0, rot: 0, ease: "snap" },
  { f: POP + 6, eyeScale: 1, sy: 1, ease: "out" },
  { f: 680, lookX: 0.8, mouthOpen: 0.35, mouthWidth: 0.6, browY: -10 },
  // laughing together
  { f: GIGGLE, squint: 1, mouthOpen: 1, mouthWidth: 1, browY: -10, armL: 60, armR: 60 },
  ...alternate(GIGGLE + 2, 734, 4, { y: -12, sy: 1.02 }, { y: 0, sy: 0.97 }),
  { f: 738, y: 0, sy: 1, squint: 0, mouthOpen: 0.85, lookX: 0.7, armL: 8, armR: 8 },
  // close-up: "A toi !"
  { f: CLOSE, turn: 0, lookX: 0, mouthOpen: 0.9 },
  { f: OFFER, armL: -46, armR: -46, browY: -8, ease: "out" },
  { f: 805, rot: 4 },
]);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const io = Easing.inOut(Easing.cubic);
const lerp = (f: number, i: number[], o: number[]) => interpolate(f, i, o, { ...clamp, easing: io });

// Virtual camera: [frame, centreX, centreY, zoom] in world coordinates.
const CAMERA: [number, number, number, number][] = [
  [0, 750, 250, 0.75],
  [75, 750, 1150, 0.75], // tilt down: wide establishing shot
  [165, 750, 1150, 0.75],
  [195, 1010, 1180, 1.0], // medium: monster + door
  [DOOR, 1010, 1180, 1.0],
  [290, 1110, 1210, 1.25], // slow push on the door
  [BOUH, 1110, 1210, 1.25],
  [BOUH + 6, 1000, 1150, 1.0], // snap back for BOUH
  [340, 1000, 1150, 1.0],
  [365, 400, 1230, 1.05], // follow him to the pumpkin
  [470, 400, 1230, 1.05],
  [508, 680, 1150, 0.95], // two-shot face-off: him left third, ghost right third
  [POP - 6, 680, 1150, 1.03],
  [730, 680, 1150, 1.0],
  [752, 860, 1090, 1.22], // the ghost tastes
  [CLOSE, 860, 1090, 1.22],
  [CLOSE + 18, 420, 1250, 1.9], // close-up on him
  [STREET_END, 560, 1250, 1.9],
];

const camera = (f: number) => {
  const fs = CAMERA.map((c) => c[0]);
  const at = (i: number) => interpolate(f, fs, CAMERA.map((c) => c[i]), { ...clamp, easing: io });
  const shake = (from: number) => (f >= from && f < from + 12 ? (1 - (f - from) / 12) * 14 : 0);
  const s = shake(BOUH) + shake(POP);
  return { cx: at(1) + Math.sin(f * 2.7) * s, cy: at(2) + Math.cos(f * 3.1) * s, z: at(3) };
};

// The ghost's performance (world coordinates).
const ghostAt = (f: number): (GhostPose & { x: number; y: number; size: number; alpha: number }) | null => {
  if (f < BOUH - 6) return null;
  const k = (frames: number[], values: number[]) => lerp(f, frames, values);
  const x = f < POP ? k([BOUH - 6, BOUH, BOUH + 8, BOUH + 26, 360, 470, 508, BLOW, 640], [1200, 1200, 980, 980, 1150, 1150, 930, 930, 1010]) : k([POP, 700, 730, TASTE], [1010, 1010, 900, 880]);
  const y = f < POP ? k([BOUH - 6, BOUH, BOUH + 8, BOUH + 26, 360, 470, 508, BLOW, 640], [1300, 1280, 1110, 1110, 1010, 1010, 980, 980, 900]) : k([POP, 700, 730, TASTE], [900, 900, 1060, 1090]);
  const size = f < POP ? k([BOUH - 6, BOUH, BOUH + 8, BOUH + 26, 360, BLOW, 640], [180, 240, 470, 470, 380, 380, 300]) : k([POP, 700, 730], [300, 300, 380]);
  const giggle = f >= GIGGLE && f < TASTE ? Math.sin(f * 1.3) * 5 : 0;
  return {
    x: x + (f >= BOUH + 8 && f < BOUH + 26 ? Math.sin(f * 2.2) * 6 : 0),
    y,
    size,
    alpha: k([BOUH - 6, BOUH], [0, 1]),
    mouth: f < BOUH + 8 ? k([BOUH - 2, BOUH + 4], [0.2, 1]) : f < BOUH + 26 ? 0.9 : f < POP ? (f > 590 ? 0.55 : 0.3) : f < TASTE ? 0.7 : f < TASTE + 14 ? 0.5 : 0.7,
    happy: (f >= 360 && f < 420) || (f >= GIGGLE && f < TASTE) || f >= TASTE + 14 ? 1 : 0,
    scared: f < POP ? k([580, 610], [0, 1]) : k([POP, 680], [1, 0]),
    pink: k([POP, POP + 3], [0, 1]),
    arms: f < BOUH + 26 ? k([BOUH, BOUH + 6], [0, 1]) : f >= TASTE + 14 ? 0.9 : 0.4,
    lean: (f >= 620 && f < POP ? Math.sin(f * 2) * 4 : 0) + giggle + (f >= POP + 10 && f < 690 ? 12 : 0),
    tongue: f >= TASTE && f < TASTE + 14 ? 1 : 0,
  };
};

const ghostBubbleR = (f: number) =>
  f < 650 ? interpolate(f, [BLOW, 650], [0, 250], { ...clamp, easing: Easing.inOut(Easing.quad) }) : f < POP ? 258 : 0;

const GhostBubble: React.FC<{ x: number; y: number; r: number; wob: number }> = ({ x, y, r, wob }) => (
  <svg viewBox="-800 0 3600 2600" style={{ position: "absolute", left: -800, top: 0, width: 3600, height: 2600, overflow: "visible" }}>
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
      <circle cx={-38} cy={-40} r={20} fill="white" />
      <circle cx={38} cy={-40} r={20} fill="white" />
      <circle cx={-30} cy={-36} r={9} fill="#3A0F2A" />
      <circle cx={30} cy={-44} r={9} fill="#3A0F2A" />
      <path d="M -40 20 Q -20 40 0 20 Q 20 40 40 20" stroke="#3A0F2A" strokeWidth={8} fill="none" strokeLinecap="round" />
      <ellipse cx={10} cy={40} rx={14} ry={12} fill="#E8456E" />
    </g>
  </svg>
);

const Pop: React.FC<{ at: number; out: number; children: React.ReactNode; top: number }> = ({ at, out, children, top }) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [at, at + 8, out, out + 6], [0, 1, 1, 0], { ...clamp, easing: Easing.out(Easing.back(2.2)) });
  return <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", scale: s }}>{children}</div>;
};

export const StreetScene: React.FC = () => {
  const f = useCurrentFrame();
  const { cx, cy, z } = camera(f);
  const toScreen = (p: [number, number]): [number, number] => [(p[0] - cx) * z + 540, (p[1] - cy) * z + 960];
  const pose = poseAt(MONSTER_KEYS, f);
  const ghost = ghostAt(f);

  // costume: floats off at BOUH, drapes to the ground, then fades away
  const p0 = poseAt(MONSTER_KEYS, BOUH - 1);
  const sheetT = interpolate(f, [BOUH, BOUH + 40], [0, 1], clamp);
  const sheetDy = -Math.sin(Math.min(1, sheetT * 2) * Math.PI) * 60 + Easing.in(Easing.quad)(sheetT) * 130;
  // bucket: flung away (off to the left) at BOUH
  const bucketFrom = rigToScreen(p0, ANCHOR, SCALE, 200, 420);
  const bt = interpolate(f, [BOUH, BOUH + 26], [0, 1], clamp);

  // gum pulled from behind his back, popped into his mouth
  const handR = (fr: number) => {
    const p = poseAt(MONSTER_KEYS, fr);
    const a = ((62 - p.armR) * Math.PI) / 180;
    return rigToScreen(p, ANCHOR, SCALE, 326 + Math.cos(a) * 134, 252 + Math.sin(a) * 134);
  };
  const flipT = interpolate(f, [454, CHOMP], [0, 1], clamp);
  const from = handR(454);
  const mouthC = rigToScreen(poseAt(MONSTER_KEYS, CHOMP), ANCHOR, SCALE, 236, 318);
  const gx = from[0] + (mouthC[0] - from[0]) * flipT;
  const gy = from[1] + (mouthC[1] - from[1]) * flipT - Math.sin(Math.PI * flipT) * 140;

  // ghost-shaped bubble, growing in the space between them
  const r = ghostBubbleR(f);
  const mouth = rigToScreen(pose, ANCHOR, SCALE, 236, 300);
  const wob = Math.sin(f * 1.7) * 0.05 * interpolate(f, [630, POP], [0, 1], clamp);
  const bubbleAt: [number, number] = [mouth[0] + r * 1.05 + 30, mouth[1] - r * 0.3];
  const burst = interpolate(f, [POP, POP + 16], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const popAt: [number, number] = [mouth[0] + 280, mouth[1] - 80];

  const held =
    f < BOUH ? (
      <g transform="translate(140 360) scale(0.6)">
        <BucketShape />
      </g>
    ) : f >= OFFER && f < 800 ? (
      <g transform={`translate(200 400) scale(${interpolate(f, [OFFER, OFFER + 6], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) })})`}>
        <image href={staticFile("pack-fraise.webp")} x={-62} y={-114} width={124} height={228} />
      </g>
    ) : null;

  const hands = toScreen(rigToScreen(pose, ANCHOR, SCALE, 200, 400));
  const offer = interpolate(f, [800, STREET_END], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <NightSky cy={cy} />
      {[[200, 300, 0], [700, 220, 1.5], [420, 560, 3]].map(([bx, by, ph], i) => (
        <Bat key={i} x={((bx + f * (i % 2 ? -3 : 4) + 1400) % 1400) - 160} y={by + Math.sin(f / 10 + ph) * 30 - (cy - 1150) * 0.25} size={100 - i * 15} phase={ph} />
      ))}
      {/* the world, seen through the camera */}
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${540 - cx * z}px, ${960 - cy * z}px) scale(${z})` }}>
        <NightGround />
        <SpookyHouse
          door={lerp(f, [DOOR, 285], [0, 1])}
          eyes={f < BOUH ? lerp(f, [270, 282], [0, 1]) : 0}
          style={{ position: "absolute", left: HOUSE.x, top: HOUSE.y, width: HOUSE.w, height: 820 }}
        />
        {f >= BOUH ? (
          <svg viewBox="0 0 200 200" style={{ position: "absolute", left: bucketFrom[0] - 900 * bt - 70, top: bucketFrom[1] - Math.sin(Math.PI * bt) * 500 + bt * 200 - 70, width: 140, height: 140, rotate: `${-bt * 400}deg`, overflow: "visible" }}>
            <BucketShape />
          </svg>
        ) : null}
        {f >= BOUH && f < 420 ? (
          <svg
            viewBox="0 0 400 500"
            style={{
              ...rigBox(ANCHOR, WIDTH),
              overflow: "visible",
              translate: `${p0.x * SCALE + sheetT * 40}px ${p0.y * SCALE + sheetDy}px`,
              rotate: `${Math.sin(sheetT * 6) * 8 * (1 - sheetT)}deg`,
              scale: `1 ${1 - Easing.in(Easing.quad)(sheetT) * 0.6}`,
              transformOrigin: "50% 94%",
              opacity: interpolate(f, [395, 420], [1, 0], clamp),
            }}
          >
            <Sheet />
          </svg>
        ) : null}
        {ghost && f >= TASTE - 2 ? (
          <Sequence from={TASTE + 2} durationInFrames={40} layout="none" name="Ghost tastes the filling">
            <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: interpolate(f, [TASTE + 26, TASTE + 40], [1, 0], clamp) }}>
              <Goo x={ghost.x} y={ghost.y + 20} color="#C70D3A" light="#FF7A9A" />
            </div>
          </Sequence>
        ) : null}
        <AnimatedMonster keys={MONSTER_KEYS} held={held} over={f < BOUH ? <Sheet /> : null} style={rigBox(ANCHOR, WIDTH)} />
        {ghost ? (
          <div style={{ opacity: ghost.alpha }}>
            <Ghost {...ghost} />
          </div>
        ) : null}
        <Pumpkin style={{ position: "absolute", left: HIDE_PUMPKIN.x, top: HIDE_PUMPKIN.y, width: HIDE_PUMPKIN.w }} />
        {f >= 449 && f < CHOMP ? (
          f < 454 ? (
            <svg viewBox="0 0 300 240" style={{ position: "absolute", width: 110, left: handR(f)[0] - 55, top: handR(f)[1] - 44, overflow: "visible", scale: interpolate(f, [449, 452], [0, 1], clamp) }}>
              <GumShape shadow={false} />
            </svg>
          ) : (
            <GumPiece style={{ position: "absolute", width: 110, left: gx - 55, top: gy - 44, scale: 1 - flipT * 0.6, rotate: `${flipT * 300}deg` }} />
          )
        ) : null}
        {r > 1 ? <GhostBubble x={bubbleAt[0]} y={bubbleAt[1]} r={r} wob={wob} /> : null}
        {f >= POP && f < POP + 32
          ? Array.from({ length: 14 }, (_, i) => {
              const a = (i / 14) * Math.PI * 2;
              const d = 420 + (i % 4) * 120;
              const sz = 46 + ((i * 29) % 40);
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: popAt[0] - sz / 2,
                    top: popAt[1] - sz / 2,
                    width: sz,
                    height: sz * 0.7,
                    borderRadius: "48% 52% 40% 60% / 55% 45% 55% 45%",
                    backgroundColor: i % 2 ? "#F9A6CB" : "#FFD3E6",
                    translate: `${Math.cos(a) * d * burst}px ${Math.sin(a) * d * burst + burst * burst * 160}px`,
                    opacity: interpolate(f, [POP + 20, POP + 32], [1, 0], clamp),
                  }}
                />
              );
            })
          : null}
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, rgba(0,0,0,0) 55%, rgba(20,6,40,0.45) 100%)" }} />

      {/* titles and callouts (screen space) */}
      <SeriesTitle episode={2} title="Boum-Boo !" titleColor="#F27A1A" outAt={70} />
      <Pop at={BOUH} out={BOUH + 28} top={300}>
        <div style={{ fontFamily: displayFont, fontSize: 200, ...candyText("#F6F2FF", "#4E2470", 15), rotate: `${-5 + Math.sin(f * 2.5) * 3}deg` }}>BOUH !</div>
      </Pop>
      {f >= POP && f < POP + 40 ? (
        <div style={{ position: "absolute", left: 190, top: 240, width: 700, height: 520, display: "flex", alignItems: "center", justifyContent: "center", scale: interpolate(f, [POP, POP + 6, POP + 32, POP + 40], [2.2, 1, 1, 0], { ...clamp, easing: Easing.out(Easing.back(1.6)) }), rotate: "-7deg" }}>
          <Starburst color="#FFD84D" style={{ position: "absolute", width: 700, height: 520 }} />
          <div style={{ position: "relative", fontFamily: displayFont, fontSize: 200, ...candyText(colors.logoRed, colors.white, 16) }}>BOUM !</div>
        </div>
      ) : null}
      <Pop at={TASTE + 4} out={CLOSE + 4} top={250}>
        <div style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 66, color: "white", textShadow: "0 4px 0 rgba(0,0,0,0.3)" }}>Fourré coulis goût</div>
        <div style={{ fontFamily: displayFont, fontSize: 200, lineHeight: 1, ...candyText(colors.logoRed, colors.white, 15), rotate: "-4deg" }}>PASTÈQUE !</div>
      </Pop>
      <Pop at={OFFER + 2} out={812} top={230}>
        <div style={{ fontFamily: displayFont, fontSize: 190, ...candyText(colors.logoRed, colors.white, 15), rotate: `${-5 + Math.sin(f / 5) * 2}deg` }}>À toi !</div>
      </Pop>
      {f >= 800 ? (
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
