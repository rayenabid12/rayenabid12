import type React from "react";
import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { staticFile, useCurrentFrame } from "remotion";
import { BrandFinale } from "../../brand/BrandFinale";
import { FinaleMelo } from "../../brand/FinaleMelo";
import { BDAY_END, BirthdayScene } from "./BirthdayScene";
import { BubbleBalloon } from "./HomeSet";

// Party balloons behind the logo on the end card.
const PartyDecor: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <BubbleBalloon x={150} y={260 - Math.min(f, 20) * 4} r={80} tone="#F9A6CB" light="#FFE3EF" />
      <BubbleBalloon x={950} y={200 - Math.min(f, 20) * 3} r={70} tone="#A8E68A" light="#EFFFE0" />
      <BubbleBalloon x={880} y={720} r={56} tone="#F9A6CB" light="#FFE3EF" />
    </>
  );
};

// "Les Aventures Boum Boum", Episode 4: "Joyeux anniversaire, Mélo !" (30 s).
export const Ep4Birthday = () => (
  <>
    <Audio name="Music" src={staticFile("ep4-music.mp3")} volume={0.55} />
    <Audio name="Sound effects" src={staticFile("ep4-sfx.mp3")} volume={0.8} />
    <TransitionSeries>
      <TransitionSeries.Sequence name="Home: the surprise party" durationInFrames={BDAY_END}>
        <BirthdayScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 8 })} />
      <TransitionSeries.Sequence name="Brand finale (birthday)" durationInFrames={90}>
        <BrandFinale decorBack={<PartyDecor />} decorFront={<FinaleMelo />} line="Joyeux anniversaire, Mélo !" />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </>
);
