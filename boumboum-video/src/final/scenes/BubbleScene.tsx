import type React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { AnimatedMonster } from "../../rig/AnimatedMonster";
import { blinkAt, type Key, sortKeys } from "../../rig/pose";
import { World } from "../../story/World";
import { alternate, poseAt, rigBox, rigToScreen } from "../kit";
import { ANCHOR, SCALE, WIDTH } from "./SnackScene";

// Same shot, still chewing... an idea... he blows until the bubble lifts him up.
export const BUBBLE_KEYS: Key[] = sortKeys([
  { f: 0, mouthOpen: 0.08, cheeks: 1, squint: 1, turn: 0.12, rot: 2, armL: -45, armR: -30, sy: 1 },
  { f: 4, mouthOpen: 0.3, cheeks: 0.55, sy: 0.97 },
  // the idea: eyes open, determined smirk
  { f: 9, squint: 0, browTilt: -16, browY: 6, mouthOpen: 0, mouthWidth: 0.6, smile: 0.5, turn: 0, rot: 0, armL: 8, armR: 8, cheeks: 0, sy: 1, ease: "out" },
  ...blinkAt(12),
  // big breath in, then blow
  { f: 17, sy: 1.08, cheeks: 1, mouthOpen: 0.3, mouthWidth: 0.28, smile: 1, armL: 30, armR: 30, browTilt: -10 },
  { f: 23, sy: 0.98, cheeks: 0.8, lookY: 0.6 },
  { f: 42, lookY: 0.8, eyeScale: 1.05 },
  // lift-off
  { f: 45, y: 0 },
  { f: 100, y: -214 },
  ...alternate(50, 100, 8, { armL: 70, armR: 55 }, { armL: 55, armR: 70 }),
  { f: 60, legSpread: 0.3 },
  // uh-oh
  { f: 66, browTilt: 16, browY: -4, eyeScale: 1.2, lookY: 0, cheeks: 0.6 },
  { f: 84, lookY: 0.9, ease: "out" },
  { f: 89, sy: 1 },
  { f: 91, sy: 0.94 },
  { f: 95, sy: 1 },
  { f: 96, x: 0 },
  ...alternate(97, 110, 2, { x: 3 }, { x: -3 }).map((k) => ({ ...k, ease: "linear" as const })),
]);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const bubbleRadius = (f: number) =>
  f < 85
    ? interpolate(f, [22, 85], [0, 290], { ...clamp, easing: Easing.inOut(Easing.quad) })
    : interpolate(f, [85, 110], [290, 345], clamp);

export const BubbleScene: React.FC = () => {
  const f = useCurrentFrame();
  const pose = poseAt(BUBBLE_KEYS, f);
  const mouth = rigToScreen(pose, ANCHOR, SCALE, 200, 300);
  const r = bubbleRadius(f);
  const wob = Math.sin(f * 1.7) * 0.04 * interpolate(f, [92, 110], [0, 1], clamp);
  return (
    <>
      <World cameraY={interpolate(f, [45, 100], [0, 1450], { ...clamp, easing: Easing.inOut(Easing.cubic) })} />
      <AnimatedMonster keys={BUBBLE_KEYS} shadow={f < 48} style={rigBox(ANCHOR, WIDTH)} />
      {r > 1 ? (
        <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <radialGradient id="finalBubble" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#FFE3EF" stopOpacity={0.95} />
              <stop offset="55%" stopColor="#F9A6CB" stopOpacity={0.93} />
              <stop offset="100%" stopColor="#EE79B1" stopOpacity={0.96} />
            </radialGradient>
          </defs>
          <g transform={`translate(${mouth[0]} ${mouth[1] + r * 0.78}) scale(${1 + wob} ${1 - wob})`}>
            <circle r={r} fill="url(#finalBubble)" stroke="rgba(255,255,255,0.6)" strokeWidth={5} />
            <ellipse cx={-r * 0.42} cy={-r * 0.45} rx={r * 0.26} ry={r * 0.12} fill="white" opacity={0.75} transform={`rotate(-35 ${-r * 0.42} ${-r * 0.45})`} />
            <circle cx={r * 0.5} cy={-r * 0.5} r={r * 0.05} fill="white" opacity={0.8} />
          </g>
        </svg>
      ) : null}
    </>
  );
};
