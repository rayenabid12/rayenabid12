import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { staticFile } from "remotion";
import { BrandFinale } from "../../brand/BrandFinale";
import { COLORS_END, ColorsScene } from "./ColorsScene";

export const EP8_COLORS_DURATION = COLORS_END + 90 - 8;

// "Les Aventures Boum Boum", Episode 8: "Le Pays sans couleurs" (44 s).
export const Ep8Colors = () => (
  <>
    <Audio name="Music" src={staticFile("ep8colors-music.mp3")} volume={0.6} />
    <Audio name="Sound effects" src={staticFile("ep8colors-sfx.mp3")} volume={0.8} />
    <TransitionSeries>
      <TransitionSeries.Sequence name="Boum Boum Land: the lost colours" durationInFrames={COLORS_END}>
        <ColorsScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 8 })} />
      <TransitionSeries.Sequence name="Brand finale" durationInFrames={90}>
        <BrandFinale line="Un petit geste, un grand BOUM !" />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </>
);
