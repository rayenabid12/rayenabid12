import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import type React from "react";
import { Interactive, type InteractivitySchema } from "remotion";
import type { Who } from "./cast";
import { ClipScene } from "./ClipScene";
import { NameCard } from "./NameCard";

type CharacterReelProps = {
  readonly who: Who;
};

// One character's chapter: name card, then each animated clip, crossfading. 904 frames at 24 fps.
const CharacterReelInner: React.FC<CharacterReelProps> = ({ who }) => {
  return (
    <TransitionSeries name="Character timeline">
      <TransitionSeries.Sequence name="Name card" durationInFrames={48}>
        <NameCard who={who} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 8 })} />
      <TransitionSeries.Sequence name="Turnaround" durationInFrames={148}>
        <ClipScene clip={`${who}_turn`} title="360° turnaround" showEmotions={false} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 8 })} />
      <TransitionSeries.Sequence name="Walk" durationInFrames={106}>
        <ClipScene clip={`${who}_walk`} title="Walk cycle" showEmotions={false} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 8 })} />
      <TransitionSeries.Sequence name="Run" durationInFrames={78}>
        <ClipScene clip={`${who}_run`} title="Run cycle" showEmotions={false} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 8 })} />
      <TransitionSeries.Sequence name="Jump and wave" durationInFrames={112}>
        <ClipScene clip={`${who}_jump`} title="Jump & wave" showEmotions={false} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 8 })} />
      <TransitionSeries.Sequence name="Emotions" durationInFrames={452}>
        <ClipScene clip={`${who}_emotions`} title="Emotions" showEmotions />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};

const characterReelSchema = {
  who: {
    type: "enum",
    default: "mom",
    description: "Character",
    variants: { girl: {}, boy: {}, mom: {}, dad: {}, grandma: {}, grandpa: {} },
  },
} as const satisfies InteractivitySchema;

export const CharacterReel = Interactive.withSchema({
  Component: CharacterReelInner,
  componentName: "CharacterReel",
  schema: characterReelSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});
