import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { staticFile } from "remotion";
import { BrandFinale } from "../../brand/BrandFinale";
import { FinaleMelo } from "../../brand/FinaleMelo";
import { GARDEN_END, GardenScene } from "./GardenScene";

export const EP7_GARDEN_DURATION = GARDEN_END + 90 - 8;

// "Les Aventures Boum Boum", Episode 7: "Le Jardin de Mélo" (45 s).
export const Ep7Garden = () => (
  <>
    <Audio name="Music" src={staticFile("ep7garden-music.mp3")} volume={0.6} />
    <Audio name="Sound effects" src={staticFile("ep7garden-sfx.mp3")} volume={0.8} />
    <TransitionSeries>
      <TransitionSeries.Sequence name="The garden: one seed" durationInFrames={GARDEN_END}>
        <GardenScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 8 })} />
      <TransitionSeries.Sequence name="Brand finale" durationInFrames={90}>
        <BrandFinale decorFront={<FinaleMelo />} line="Le goût Pastèque est né !" />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </>
);
