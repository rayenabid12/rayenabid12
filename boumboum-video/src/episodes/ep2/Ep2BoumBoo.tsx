import type React from "react";
import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { staticFile, useCurrentFrame } from "remotion";
import { BrandFinale } from "../../brand/BrandFinale";
import { Bat, Ghost, Pumpkin } from "./Halloween";
import { STREET_END, StreetScene } from "./StreetScene";

// Halloween touches for the shared brand finale: bats, pumpkins, and the
// (now pink and friendly) ghost waving next to the logo.
const HalloweenDecor: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Bat x={140 + Math.sin(f / 12) * 40} y={140} size={120} />
      <Bat x={950 + Math.cos(f / 10) * 30} y={900} size={90} phase={2} />
      <Pumpkin style={{ position: "absolute", left: -30, top: 1100, width: 220 }} />
    </>
  );
};

const HalloweenFront: React.FC = () => (
  <>
    <Ghost x={900} y={720} size={230} pink={1} happy={1} arms={0.9} mouth={0.7} />
    <Pumpkin style={{ position: "absolute", left: 830, top: 1630, width: 240 }} />
  </>
);

// "Les Aventures Boum Boum", Episode 2: "Boum-Boo !" (Halloween special, 30 s).
export const Ep2BoumBoo = () => {
  return (
    <>
      <Audio name="Music" src={staticFile("ep2-music.mp3")} volume={0.55} />
      <Audio name="Sound effects" src={staticFile("ep2-sfx.mp3")} volume={0.8} />
      <TransitionSeries>
        <TransitionSeries.Sequence name="Street: trick, BOUH, bubble, friends" durationInFrames={STREET_END}>
          <StreetScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 8 })} />
        <TransitionSeries.Sequence name="Brand finale (Halloween)" durationInFrames={90}>
          <BrandFinale decorBack={<HalloweenDecor />} decorFront={<HalloweenFront />} line="Joyeux Halloween !" />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </>
  );
};
