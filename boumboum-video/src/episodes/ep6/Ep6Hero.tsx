import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { staticFile } from "remotion";
import { BrandFinale } from "../../brand/BrandFinale";
import { FinaleMelo } from "../../brand/FinaleMelo";
import { HERO_END, HeroScene } from "./HeroScene";

export const EP6_DURATION = HERO_END + 90 - 8;

// "Les Aventures Boum Boum", Episode 6: "Le Petit Héros" (45 s).
export const Ep6Hero = () => (
  <>
    <Audio name="Music" src={staticFile("ep6-music.mp3")} volume={0.55} />
    <Audio name="Sound effects" src={staticFile("ep6-sfx.mp3")} volume={0.8} />
    <TransitionSeries>
      <TransitionSeries.Sequence name="The storm: the rescue" durationInFrames={HERO_END}>
        <HeroScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 8 })} />
      <TransitionSeries.Sequence name="Brand finale" durationInFrames={90}>
        <BrandFinale decorFront={<FinaleMelo />} line="Le courage, ça fait BOUM !" />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </>
);
