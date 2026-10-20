import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import type React from "react";
import { Bookend } from "./Bookend";
import { CharacterReel } from "./CharacterReel";

// The whole family: intro, one chapter per character in seating order, outro. 5520 frames at 24 fps.
export const FamilyReel: React.FC = () => {
  return (
    <TransitionSeries name="Family timeline">
      <TransitionSeries.Sequence name="Intro" durationInFrames={108}>
        <Bookend title="Meet the family" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 12 })} />
      <TransitionSeries.Sequence name="Girl" durationInFrames={898}>
        <CharacterReel who="girl" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 12 })} />
      <TransitionSeries.Sequence name="Boy" durationInFrames={898}>
        <CharacterReel who="boy" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 12 })} />
      <TransitionSeries.Sequence name="Mom" durationInFrames={898}>
        <CharacterReel who="mom" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 12 })} />
      <TransitionSeries.Sequence name="Dad" durationInFrames={898}>
        <CharacterReel who="dad" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 12 })} />
      <TransitionSeries.Sequence name="Grandma" durationInFrames={898}>
        <CharacterReel who="grandma" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 12 })} />
      <TransitionSeries.Sequence name="Grandpa" durationInFrames={898}>
        <CharacterReel who="grandpa" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 12 })} />
      <TransitionSeries.Sequence name="Outro" durationInFrames={108}>
        <Bookend title="See you at the barbecue!" />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
