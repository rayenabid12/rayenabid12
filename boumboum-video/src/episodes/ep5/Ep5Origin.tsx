import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { staticFile } from "remotion";
import { BrandFinale } from "../../brand/BrandFinale";
import { ORIGIN_END, OriginScene } from "./OriginScene";

export const EP5_DURATION = ORIGIN_END + 90 - 8;

// "Les Aventures Boum Boum", Episode 5: "La Naissance de Boum Boum" (45 s).
export const Ep5Origin = () => (
  <>
    <Audio name="Music" src={staticFile("ep5-music.mp3")} volume={0.55} />
    <Audio name="Sound effects" src={staticFile("ep5-sfx.mp3")} volume={0.8} />
    <TransitionSeries>
      <TransitionSeries.Sequence name="The factory: the origin story" durationInFrames={ORIGIN_END}>
        <OriginScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 8 })} />
      <TransitionSeries.Sequence name="Brand finale" durationInFrames={90}>
        <BrandFinale line="Né pour faire BOUM !" />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </>
);
