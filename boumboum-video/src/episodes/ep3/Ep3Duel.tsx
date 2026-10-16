import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { staticFile } from "remotion";
import { BrandFinale } from "../../brand/BrandFinale";
import { FinaleMelo } from "../../brand/FinaleMelo";
import { DUEL_END, DuelScene } from "./DuelScene";

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
