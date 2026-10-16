import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { iris } from "@remotion/transitions/iris";
import { staticFile } from "remotion";
import { BoumScene } from "./scenes/BoumScene";
import { BubbleScene } from "./scenes/BubbleScene";
import { FinaleScene } from "./scenes/FinaleScene";
import { FlavorScene } from "./scenes/FlavorScene";
import { HelloScene } from "./scenes/HelloScene";

// "Le plus gros BOUM": 18 s kids' story starring the Boum Boum monster.
// Key moments land on the 120 BPM beat (every 15 frames).
export const BoumStory = () => {
  return (
    <>
      <Audio name="Music" src={staticFile("story-music.mp3")} volume={0.55} />
      <Audio name="Sound effects" src={staticFile("story-sfx.mp3")} volume={0.8} />
      <TransitionSeries>
        <TransitionSeries.Sequence name="Hello" durationInFrames={180}>
          <HelloScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="Big bubble" durationInFrames={120}>
          <BubbleScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="BOUM" durationInFrames={40}>
          <BoumScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="Flavors" durationInFrames={118}>
          <FlavorScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={iris({ width: 1080, height: 1920 })}
          timing={linearTiming({ durationInFrames: 8 })}
        />
        <TransitionSeries.Sequence name="Finale" durationInFrames={90}>
          <FinaleScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </>
  );
};
