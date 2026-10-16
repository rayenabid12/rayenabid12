import type React from "react";
import { animatedPose, type Key, type Pose } from "../rig/pose";

// Shift a block of keys in time (reuse reactions inside a longer shot).
export const offset = (keys: Key[], df: number): Key[] => keys.map((k) => ({ ...k, f: k.f + df }));

// One hop: crouch, launch, arc, land with a squash (rig units, y < 0 is up).
export const hop = (start: number, x0: number, x1: number, height = 110): Key[] => [
  { f: start, x: x0, y: 0, sy: 1 },
  { f: start + 3, sy: 0.82, legSpread: 0.3 },
  { f: start + 4, x: x0, y: 0 },
  { f: start + 6, sy: 1.1, legSpread: 0, ease: "out" },
  { f: start + 8, legLift: 0.6, ease: "out" },
  { f: start + 9, y: -height, ease: "out" },
  { f: start + 13, legLift: 0 },
  { f: start + 14, x: x1, y: 0, ease: "in" },
  { f: start + 15, sy: 0.8, ease: "snap" },
  { f: start + 19, sy: 1, ease: "out" },
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
