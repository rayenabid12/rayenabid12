import type React from "react";
import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { staticFile, useCurrentFrame } from "remotion";
import { BrandFinale } from "../../brand/BrandFinale";
import { offset } from "../../final/kit";
import { AnimatedMonster } from "../../rig/AnimatedMonster";
import { M_WINK, MELO_COOL } from "../../rig/meloKeys";
import { type Key, sortKeys } from "../../rig/pose";
import { DUEL_END, DuelScene } from "./DuelScene";

// Mélo joins the end card: slides in, then finger guns + wink on the final POP.
const MELO_FINALE: Key[] = sortKeys([
  { f: 0, ...MELO_COOL, x: 420, rot: -8, turn: -0.3, lookX: -0.4 },
  { f: 16, x: 0, rot: 0, ease: "out" },
  { f: 17, sy: 0.9, ease: "snap" },
  { f: 22, sy: 1, turn: -0.15, lookX: -0.2, ease: "out" },
  ...offset(M_WINK.slice(1), 54),
]);

const FinaleMelo: React.FC = () => {
  const f = useCurrentFrame();
  return f < 0 ? null : (
    <AnimatedMonster keys={MELO_FINALE} skin="melo" alive shadow={false} style={{ position: "absolute", width: 380, height: 475, left: 700, top: 1235 }} />
  );
};

// "Les Aventures Boum Boum", Episode 3: "Le Duel de Bulles" (30 s).
export const Ep3Duel = () => (
  <>
    <Audio name="Music" src={staticFile("ep3-music.mp3")} volume={0.55} />
    <Audio name="Sound effects" src={staticFile("ep3-sfx.mp3")} volume={0.8} />
    <TransitionSeries>
      <TransitionSeries.Sequence name="Park: the duel" durationInFrames={DUEL_END}>
        <DuelScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 8 })} />
      <TransitionSeries.Sequence name="Brand finale (duo)" durationInFrames={90}>
        <BrandFinale decorFront={<FinaleMelo />} line="Deux parfums, un seul BOUM !" />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </>
);
