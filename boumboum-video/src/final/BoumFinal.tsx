import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { staticFile } from "remotion";
import { BoumScene } from "./scenes/BoumScene";
import { BubbleScene } from "./scenes/BubbleScene";
import { FinaleScene } from "./scenes/FinaleScene";
import { LandingScene } from "./scenes/LandingScene";
import { SnackScene } from "./scenes/SnackScene";

// "Le plus gros BOUM" - final 20 s cut on the rig v2 character.
// One continuous camera journey: every scene picks up exactly where the last left off.
export const BoumFinal = () => {
  return (
    <>
      <Audio name="Music" src={staticFile("final-music.mp3")} volume={0.55} />
      <Audio name="Sound effects" src={staticFile("final-sfx.mp3")} volume={0.8} />
      <TransitionSeries>
        <TransitionSeries.Sequence name="Snack" durationInFrames={190}>
          <SnackScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="Big bubble" durationInFrames={110}>
          <BubbleScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="BOUM" durationInFrames={40}>
          <BoumScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="Landing + A toi" durationInFrames={178}>
          <LandingScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 8 })} />
        <TransitionSeries.Sequence name="Finale" durationInFrames={90}>
          <FinaleScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </>
  );
};
