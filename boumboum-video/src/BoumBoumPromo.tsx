import { linearTiming, springTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { staticFile } from "remotion";
import { FlavorScene } from "./scenes/FlavorScene";
import { IntroScene } from "./scenes/IntroScene";
import { OutroScene } from "./scenes/OutroScene";

export const BoumBoumPromo = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence name="Intro" durationInFrames={90}>
        <IntroScene tagline="Bubble Gum fourré" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-bottom" })}
        timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence name="Pastèque" durationInFrames={120}>
        <FlavorScene
          flavor="PASTÈQUE"
          subtitle="Fourré coulis goût"
          stripeA="#2E9E3E"
          stripeB="#1F7A2E"
          heroSrc={staticFile("gum-pasteque.webp")}
          packSrc={staticFile("packs-pasteque.webp")}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={wipe({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence name="Fraise" durationInFrames={120}>
        <FlavorScene
          flavor="FRAISE"
          subtitle="Fourré goût"
          stripeA="#E01F3D"
          stripeB="#B5122C"
          heroSrc={staticFile("pack-fraise.webp")}
          packSrc={staticFile("box-fraise.webp")}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-top" })}
        timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence name="Outro" durationInFrames={120}>
        <OutroScene cta="Fais BOUM !" badge="Colorants naturels" />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
