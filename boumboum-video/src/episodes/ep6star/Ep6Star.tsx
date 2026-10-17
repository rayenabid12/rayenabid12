import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { staticFile } from "remotion";
import { BrandFinale } from "../../brand/BrandFinale";
import { FallenStarScene, STAR_END } from "./FallenStarScene";

export const EP6_STAR_DURATION = STAR_END + 94 - 12;

// "Les Aventures Boum Boum", Episode 6: "L'Étoile tombée" (45 s).
export const Ep6Star = () => (
  <>
    <Audio name="Music" src={staticFile("ep6star-music.mp3")} volume={0.6} />
    <Audio name="Sound effects" src={staticFile("ep6star-sfx.mp3")} volume={0.8} />
    <TransitionSeries>
      <TransitionSeries.Sequence name="The garden: the fallen star" durationInFrames={STAR_END}>
        <FallenStarScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade({ shouldFadeOutExitingScene: true })} timing={linearTiming({ durationInFrames: 12 })} />
      <TransitionSeries.Sequence name="Brand finale" durationInFrames={94}>
        <BrandFinale line="Une étoile, une bulle, un ami." />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </>
);
