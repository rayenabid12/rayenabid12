import type React from "react";
import { animatedPose, type Key, type Pose } from "../rig/pose";

// Shift a block of keys in time (reuse reactions inside a longer shot).
export const offset = (keys: Key[], df: number): Key[] => keys.map((k) => ({ ...k, f: k.f + df }));

// One hop: crouch with arms back, launch with arms up and legs tucking,
// land with a squash (rig units, y < 0 is up). Horizontal travel eases in/out,
// vertical uses gravity-like eases.
export const hop = (s: number, x0: number, x1: number, height = 150): Key[] => [
  { f: s, x: x0, y: 0, sy: 1, armL: 20, armR: 20 },
  { f: s + 3, sy: 0.84, armL: -12, armR: -12, legSpread: 0.25 },
  { f: s + 4, x: x0, y: 0 },
  { f: s + 6, sy: 1.08, armL: 70, armR: 70, legSpread: 0, ease: "out" },
  { f: s + 7, legLift: 0.5, ease: "out" },
  { f: s + 9, y: -height, ease: "out" },
  { f: s + 12, legLift: 0, armL: 35, armR: 35 },
  { f: s + 14, x: x1, ease: "inOut" },
  { f: s + 14, y: 0, ease: "in" },
  { f: s + 15, sy: 0.82, ease: "snap" },
  { f: s + 19, sy: 1, armL: 20, armR: 20, ease: "out" },
];

// Alternate two poses every `every` frames between `from` and `to`.
export const alternate = (from: number, to: number, every: number, a: Partial<Pose>, b: Partial<Pose>): Key[] => {
  const keys: Key[] = [];
  let i = 0;
  for (let f = from; f <= to; f += every) {
    keys.push({ f, ...(i % 2 === 0 ? a : b) });
    i++;
  }
  return keys;
};

// Where a point of the rig (rig coords) lands on screen, for attaching props.
// anchor = screen position of the rig's feet (200, 470); scale = svg width / 400.
export const rigToScreen = (pose: Pose, anchor: [number, number], scale: number, rx: number, ry: number): [number, number] => [
  anchor[0] + (rx - 200 + pose.x) * scale,
  anchor[1] + ((ry - 470) * pose.sy + pose.y) * scale,
];

export const poseAt = (keys: Key[], frame: number) => animatedPose(keys, frame);

// The svg box for a rig whose feet sit at `anchor`, drawn `width` px wide.
export const rigBox = (anchor: [number, number], width: number): React.CSSProperties => ({
  position: "absolute",
  width,
  height: width * 1.25,
  left: anchor[0] - width / 2,
  top: anchor[1] - width * 1.175,
});
