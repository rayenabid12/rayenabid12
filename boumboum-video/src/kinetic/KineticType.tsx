import { Audio } from "@remotion/media";
import { TransitionSeries } from "@remotion/transitions";
import { staticFile } from "remotion";
import { K, SIZE } from "./design";
import { BoumMask } from "./scenes/BoumMask";
import { EndCard } from "./scenes/EndCard";
import { FlavorPoster } from "./scenes/FlavorPoster";
import { Montage } from "./scenes/Montage";
import { PackHold } from "./scenes/PackHold";
import { WordBeats } from "./scenes/WordBeats";

// Kinetic type direction: 15 s, every cut on the 120 BPM beat (15 frames).
export const KineticType = () => {
  return (
    <>
      <Audio name="Sound design" src={staticFile("kinetic-sfx.mp3")} volume={0.85} />
      <TransitionSeries>
        <TransitionSeries.Sequence name="Words" durationInFrames={45}>
          <WordBeats />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="BOUM mask" durationInFrames={45}>
          <BoumMask />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="Pastèque poster" durationInFrames={75}>
          <FlavorPoster
            lines={["PAS", "TÈ", "QUE"]}
            size={SIZE.PASTEQUE_LINE}
            bg={K.green}
            fg={K.pink}
            heroSrc={staticFile("gum-pasteque.webp")}
            heroWidth={560}
            heroHeight={450}
            heroX={290}
            heroBelowLines={2}
            index="01 — Pastèque"
            note="Fourré coulis"
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="Pastèque pack" durationInFrames={45}>
          <PackHold
            bg={K.cream}
            fg={K.green}
            src={staticFile("packs-pasteque.webp")}
            title="PASTÈQUE"
            titleSize={150}
            index="01 — Pastèque"
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="Fraise poster" durationInFrames={75}>
          <FlavorPoster
            lines={["FRA", "ISE"]}
            size={SIZE.FRAISE_LINE}
            bg={K.crimson}
            fg={K.cream}
            heroSrc={staticFile("pack-fraise.webp")}
            heroWidth={600}
            heroHeight={1100}
            heroBelowLines={1}
            index="02 — Fraise"
            note="Fourré goût fraise"
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="Fraise pack" durationInFrames={45}>
          <PackHold
            bg={K.pink}
            fg={K.crimson}
            src={staticFile("box-fraise.webp")}
            title="FRAISE"
            titleSize={150}
            index="02 — Fraise"
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="Montage" durationInFrames={45}>
          <Montage />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="End card" durationInFrames={75}>
          <EndCard />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </>
  );
};
