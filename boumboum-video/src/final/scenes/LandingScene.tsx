import type React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Goo } from "../../bubblepop/Goo";
import { AnimatedMonster } from "../../rig/AnimatedMonster";
import { type Key, sortKeys } from "../../rig/pose";
import { GumPiece, Strawberry } from "../../story/Props";
import { GROUND_Y, World } from "../../story/World";
import { bodyFont, candyText, colors, displayFont } from "../../theme";
import { alternate, poseAt, rigBox, rigToScreen } from "../kit";

const ANCHOR: [number, number] = [540, 1100]; // feet standing ON the giant gum
const WIDTH = 520;
const SCALE = WIDTH / 400;
const BERRY_Y = (1075 - 1100) / SCALE; // standing on the strawberry top, in rig units

// Continuous shot: fall in, splat, celebrate, leap to the strawberry,
// then the camera dollies in for the lick and the pack offered to camera.
export const LANDING_KEYS: Key[] = sortKeys([
  { f: -3, y: -900, armL: 150, armR: 150, legLift: 0.3, eyeScale: 1.25, mouthOpen: 1, mouthWidth: 0.5, browY: -20, legSpread: 0.4 },
  { f: 5, y: 0, ease: "in" },
  { f: 6, sy: 0.7, legSpread: 0.55, legLift: 0, ease: "snap" },
  { f: 8, squint: 1, mouthOpen: 1, mouthWidth: 1, eyeScale: 1, browY: -10, ease: "out" },
  { f: 12, sy: 1.06, ease: "out" },
  { f: 16, sy: 1, legSpread: 0 },
  // celebrate (arm pumps, little bounces)
  ...alternate(10, 38, 6, { armL: 135, armR: 105 }, { armL: 105, armR: 135 }),
  { f: 18, y: -26, ease: "out" },
  { f: 22, y: 0, ease: "in" },
  // lick the lips
  { f: 24, mouthOpen: 0.55, mouthWidth: 0.7, tongue: 0, tongueX: -0.6, squint: 0, lookX: 0.3 },
  { f: 27, tongue: 1, ease: "out" },
  { f: 34, tongueX: 0.8 },
  { f: 37, tongue: 0, mouthOpen: 1, mouthWidth: 1, squint: 1, lookX: 0.3 },
  // eyes on the strawberry: anticipation crouch
  { f: 40, squint: 0, turn: 0.4, lookX: 0.8, sy: 0.8, y: 0, legSpread: 0.35, armL: -20, armR: -20, browTilt: -12, mouthOpen: 0.6 },
  { f: 44, sy: 0.8, ease: "hold" },
  // leap (the camera pans with him)
  { f: 46, sy: 1.1, legSpread: 0, ease: "out" },
  { f: 48, armL: 140, armR: 140, ease: "out" },
  { f: 50, legLift: 1 },
  { f: 55, y: -400, ease: "out" },
  { f: 64, legLift: 0 },
  { f: 66, y: BERRY_Y, ease: "in" },
  { f: 67, sy: 0.72, browTilt: 0, ease: "snap" },
  { f: 70, squint: 1, mouthOpen: 1, ease: "out" },
  { f: 72, turn: 0, lookX: 0 },
  { f: 73, sy: 1.05, ease: "out" },
  { f: 77, sy: 1 },
  // happy wiggle
  ...alternate(76, 96, 5, { rot: 5, bend: 8, armL: 120, armR: 90 }, { rot: -5, bend: -8, armL: 90, armR: 120 }),
  { f: 100, rot: 0, bend: 0, armL: 8, armR: 8, squint: 0, lookX: 0, lookY: 0, mouthOpen: 0.85 },
  // close-up: notices the filling on his cheek
  { f: 106, lookX: 0.6, lookY: 0.4, turn: 0.2, browY: -10, mouthOpen: 0.5, mouthWidth: 0.6 },
  { f: 112, mouthOpen: 0.55, mouthWidth: 0.7, tongue: 0, tongueX: -0.4 },
  { f: 115, tongue: 1, ease: "out" },
  { f: 126, tongueX: 1 },
  { f: 128, tongue: 1 },
  { f: 131, tongue: 0, mouthOpen: 0.3 },
  { f: 134, squint: 1, cheeks: 0.6, mouthOpen: 0, mouthWidth: 0.6, turn: 0, lookX: 0, lookY: 0, browY: -6 },
  // spots the kids: "A toi !"
  { f: 142, squint: 0, cheeks: 0, mouthOpen: 0.9, mouthWidth: 1, browY: -8, rot: 5 },
  { f: 147, armL: -46, armR: -46, ease: "out" },
  { f: 160, rot: 0, sy: 1 },
  { f: 163, sy: 0.95 },
  { f: 168, sy: 1.04, armL: -30, armR: -30 },
]);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ZOOM = 2.0;
const FACE_TARGET: [number, number] = [540, 900];

const Title: React.FC<{ small: string; big: string; at: number; out: number }> = ({ small, big, at, out }) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [at, at + 8, out, out + 6], [0, 1, 1, 0], { ...clamp, easing: Easing.out(Easing.back(2)) });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 240, textAlign: "center", scale: s }}>
      <div style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 70, color: colors.greenDark }}>{small}</div>
      <div style={{ fontFamily: displayFont, fontSize: 200, lineHeight: 1, ...candyText(colors.logoRed, colors.white, 15), rotate: "-4deg" }}>{big}</div>
    </div>
  );
};

export const LandingScene: React.FC = () => {
  const f = useCurrentFrame();
  const pose = poseAt(LANDING_KEYS, f);
  const pan = interpolate(f, [45, 66], [0, 900], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const cameraY = interpolate(f, [0, 10], [1000, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  // dolly-in: scale the whole set around his face and bring the face to FACE_TARGET
  const face = rigToScreen(poseAt(LANDING_KEYS, 100), ANCHOR, SCALE, 200, 230);
  const push = interpolate(f, [96, 120], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const zoom = 1 + (ZOOM - 1) * push;
  const tx = (FACE_TARGET[0] - face[0]) * push;
  const ty = (FACE_TARGET[1] - face[1]) * push;
  const toScreen = (p: [number, number]): [number, number] => [
    face[0] + (p[0] - face[0]) * zoom + tx,
    face[1] + (p[1] - face[1]) * zoom + ty,
  ];

  const cheek = rigToScreen(pose, ANCHOR, SCALE, 278, 296);
  const dropsOn = f >= 68 && f < 127;
  const hands = toScreen(rigToScreen(pose, ANCHOR, SCALE, 200, 360));
  const offer = interpolate(f, [156, 178], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transformOrigin: `${face[0]}px ${face[1]}px`, scale: zoom, translate: `${tx}px ${ty}px` }}>
        <World cameraX={pan} cameraY={cameraY} />
        <GumPiece style={{ position: "absolute", width: 720, left: 540 - 360 - pan, top: GROUND_Y - 520 + cameraY }} />
        <Strawberry style={{ position: "absolute", width: 560, left: 1440 - 280 - pan, top: GROUND_Y - 600 + cameraY }} />
        <AbsoluteFill style={{ opacity: interpolate(f, [30, 42], [1, 0], clamp) }}>
          <Sequence from={5} durationInFrames={40} layout="none" name="Watermelon splash">
            <Goo x={540 - pan} y={1120} color="#C70D3A" light="#FF7A9A" />
          </Sequence>
        </AbsoluteFill>
        <AbsoluteFill style={{ opacity: interpolate(f, [86, 96], [1, 0], clamp) }}>
          <Sequence from={67} durationInFrames={30} layout="none" name="Strawberry splash">
            <Goo x={540} y={1095} color="#D3123F" light="#FF8FA8" />
          </Sequence>
        </AbsoluteFill>
        {/* contact shadow on the surface he stands on */}
        <div
          style={{
            position: "absolute",
            left: 540 - 130,
            top: ANCHOR[1] + (f >= 45 ? BERRY_Y * SCALE : 0) - 14,
            width: 260,
            height: 34,
            borderRadius: "50%",
            background: "rgba(80,0,30,0.22)",
            opacity: interpolate(Math.abs(pose.y - (f >= 45 ? BERRY_Y : 0)), [0, 200], [1, 0], clamp),
            scale: interpolate(Math.abs(pose.y - (f >= 45 ? BERRY_Y : 0)), [0, 300], [1, 0.4], clamp),
          }}
        />
        <AnimatedMonster keys={LANDING_KEYS} shadow={false} style={rigBox(ANCHOR, WIDTH)} />
        {dropsOn ? (
          <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
            <ellipse cx={cheek[0] + 6} cy={cheek[1] - 8} rx={11} ry={14} fill="#D3123F" />
            <ellipse cx={cheek[0] + 3} cy={cheek[1] - 13} rx={4} ry={3} fill="white" opacity={0.7} />
            <circle cx={cheek[0] - 4} cy={cheek[1] + 18} r={6} fill="#D3123F" />
          </svg>
        ) : null}
      </AbsoluteFill>
      <Title small="Fourré coulis goût" big="PASTÈQUE !" at={9} out={40} />
      <Title small="Fourré goût" big="FRAISE !" at={70} out={96} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 230,
          textAlign: "center",
          fontFamily: displayFont,
          fontSize: 190,
          ...candyText(colors.logoRed, colors.white, 15),
          scale: interpolate(f, [146, 154, 166, 172], [0, 1, 1, 0], { ...clamp, easing: Easing.out(Easing.back(2.4)) }),
          rotate: `${-5 + Math.sin(f / 5) * 2}deg`,
        }}
      >
        À toi !
      </div>
      {f >= 145 ? (
        <Img
          src={staticFile("pack-pasteque-single.webp")}
          style={{
            position: "absolute",
            width: 560,
            left: hands[0] + (540 - hands[0]) * offer - 280,
            top: hands[1] + (820 - hands[1]) * offer - 135,
            scale: interpolate(f, [145, 151], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) }) * (1 + offer * 3.4),
            rotate: `${-6 + offer * 6}deg`,
            filter: "drop-shadow(0 20px 24px rgba(0,0,0,0.3))",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
