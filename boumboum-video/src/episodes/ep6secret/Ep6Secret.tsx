import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { staticFile } from "remotion";
import { BrandFinale } from "../../brand/BrandFinale";
import { FinaleMelo } from "../../brand/FinaleMelo";
import { SECRET_END, SecretScene } from "./SecretScene";

export const EP6_SECRET_DURATION = SECRET_END + 90 - 8;

// "Les Aventures Boum Boum", Episode 6: "Le Secret de Mélo" (45 s).
export const Ep6Secret = () => (
  <>
    <Audio name="Music" src={staticFile("ep6secret-music.mp3")} volume={0.55} />
    <Audio name="Sound effects" src={staticFile("ep6secret-sfx.mp3")} volume={0.8} />
    <TransitionSeries>
      <TransitionSeries.Sequence name="The park: Mélo's secret" durationInFrames={SECRET_END}>
        <SecretScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 8 })} />
      <TransitionSeries.Sequence name="Brand finale" durationInFrames={90}>
        <BrandFinale decorFront={<FinaleMelo />} line="Ensemble, on fait BOUM !" />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </>
);
