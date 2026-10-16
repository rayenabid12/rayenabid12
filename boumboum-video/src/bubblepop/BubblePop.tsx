import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { iris } from "@remotion/transitions/iris";
import { slide } from "@remotion/transitions/slide";
import { staticFile } from "remotion";
import { colors } from "../theme";
import { BiteScene } from "./scenes/BiteScene";
import { BoumScene } from "./scenes/BoumScene";
import { BubbleScene } from "./scenes/BubbleScene";
import { PayoffScene } from "./scenes/PayoffScene";

// "The Bubble Gets Too Big" - 15 s, key hits land on the 120 BPM beat (every 15 frames).
export const BubblePop = () => {
  return (
    <>
      <Audio name="Soundtrack" src={staticFile("bubblepop-music.mp3")} volume={0.5} />
      <Audio name="Sound effects" src={staticFile("bubblepop-sfx.mp3")} volume={0.7} />
      <TransitionSeries>
        <TransitionSeries.Sequence name="Bubble" durationInFrames={120}>
          <BubbleScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="BOUM" durationInFrames={50}>
          <BoumScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={iris({ width: 1080, height: 1920 })}
          timing={linearTiming({ durationInFrames: 10 })}
        />
        <TransitionSeries.Sequence name="Pastèque bite" durationInFrames={125}>
          <BiteScene
            flavor="PASTÈQUE"
            subtitle="Fourré coulis"
            bg={colors.green}
            bgLight="#5CC46A"
            titleOutline={colors.greenDark}
            gooColor="#C70D3A"
            gooLight="#FF7A9A"
            heroSrc={staticFile("gum-pasteque.webp")}
            packSrc={staticFile("packs-pasteque.webp")}
            mascotSide="left"
            biteFrame={50}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 8 })}
        />
        <TransitionSeries.Sequence name="Fraise bite" durationInFrames={105}>
          <BiteScene
            flavor="FRAISE"
            subtitle="Fourré goût"
            bg={colors.strawberry}
            bgLight="#FF5A73"
            titleOutline={colors.strawberryDark}
            gooColor="#D3123F"
            gooLight="#FF8FA8"
            heroSrc={staticFile("pack-fraise.webp")}
            packSrc={staticFile("box-fraise.webp")}
            mascotSide="right"
            biteFrame={38}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: 8 })}
        />
        <TransitionSeries.Sequence name="Payoff" durationInFrames={76}>
          <PayoffScene cta="Fais BOUM !" />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </>
  );
};
