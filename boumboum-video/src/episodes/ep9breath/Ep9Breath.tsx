import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { staticFile } from "remotion";
import { BrandFinale } from "../../brand/BrandFinale";
import { FinaleMelo } from "../../brand/FinaleMelo";
import { BREATH_END, BreathScene } from "./BreathScene";

export const EP9_BREATH_DURATION = BREATH_END + 90 - 8;

// "Les Aventures Boum Boum", Episode 9: "Le Souffle de Boum Boum" (43 s).
export const Ep9Breath = () => (
  <>
    <Audio name="Music" src={staticFile("ep9breath-music.mp3")} volume={0.6} />
    <Audio name="Sound effects" src={staticFile("ep9breath-sfx.mp3")} volume={0.8} />
    <TransitionSeries>
      <TransitionSeries.Sequence name="The park: the tower and the breath" durationInFrames={BREATH_END}>
        <BreathScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 8 })} />
      <TransitionSeries.Sequence name="Brand finale" durationInFrames={90}>
        <BrandFinale decorFront={<FinaleMelo />} line="Inspire, souffle… BOUM !" />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </>
);
