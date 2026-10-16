import type React from "react";
import { useCurrentFrame } from "remotion";
import { offset } from "../final/kit";
import { AnimatedMonster } from "../rig/AnimatedMonster";
import { M_WINK, MELO_COOL } from "../rig/meloKeys";
import { type Key, sortKeys } from "../rig/pose";

// Mélo on the shared end card: slides in, then finger guns + wink on the final POP.
const MELO_FINALE: Key[] = sortKeys([
  { f: 0, ...MELO_COOL, x: 420, rot: -8, turn: -0.3, lookX: -0.4 },
  { f: 16, x: 0, rot: 0, ease: "out" },
  { f: 17, sy: 0.9, ease: "snap" },
  { f: 22, sy: 1, turn: -0.15, lookX: -0.2, ease: "out" },
  ...offset(M_WINK.slice(1), 54),
]);

export const FinaleMelo: React.FC = () => {
  const f = useCurrentFrame();
  return f < 0 ? null : (
    <AnimatedMonster keys={MELO_FINALE} skin="melo" alive shadow={false} style={{ position: "absolute", width: 380, height: 475, left: 700, top: 1235 }} />
  );
};
