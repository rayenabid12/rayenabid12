import { Video } from "@remotion/media";
import type React from "react";
import { Easing, Interactive, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, type InteractivitySchema } from "remotion";
import { CREAM, INK, MARKER } from "./theme";
import { EMOTIONS, EMO_DUR, EMO_T0 } from "./cast";

type ClipSceneProps = {
  readonly clip: string;
  readonly title: string;
  readonly showEmotions: boolean;
};

// The name of the emotion being acted right now; it pops in on each change.
const EmotionLabel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const i = t < EMO_T0 + EMO_DUR ? 0 : Math.min(EMOTIONS.length - 1, Math.floor((t - EMO_T0) / EMO_DUR));
  const start = i === 0 ? 0 : (EMO_T0 + i * EMO_DUR) * fps;
  return (
    <Interactive.Div
      name="Emotion label"
      style={{
        position: "absolute",
        right: 110,
        top: 100,
        fontFamily: MARKER,
        fontSize: 110,
        color: INK,
        rotate: "3deg",
        scale: spring({ frame: frame - start, fps, config: { damping: 11, stiffness: 160 } }),
      }}
    >
      {EMOTIONS[i]}
    </Interactive.Div>
  );
};

const ClipSceneInner: React.FC<ClipSceneProps> = ({ clip, title, showEmotions }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <Video name="Painted clip" src={staticFile(`clips/${clip}.mp4`)} muted objectFit="cover" style={{ width: "100%", height: "100%" }} />
      <Interactive.Div
        name="Caption"
        style={{
          position: "absolute",
          left: 110,
          bottom: 110,
          fontFamily: MARKER,
          fontSize: 72,
          color: CREAM,
          backgroundColor: INK,
          padding: "12px 40px 18px",
          borderRadius: 22,
          rotate: "-1.5deg",
          translate: interpolate(frame, [0.2 * fps, 0.7 * fps], ["-700px 0px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {title}
      </Interactive.Div>
      {showEmotions ? <EmotionLabel /> : null}
    </>
  );
};

const clipSceneSchema = {
  clip: { type: "string", default: "mom_turn", description: "Clip (file in public/clips, without .mp4)" },
  title: { type: "string", default: "360° turnaround", description: "Caption" },
  showEmotions: { type: "boolean", default: false, description: "Show the emotion being acted" },
} as const satisfies InteractivitySchema;

export const ClipScene = Interactive.withSchema({
  Component: ClipSceneInner,
  componentName: "ClipScene",
  schema: clipSceneSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});
