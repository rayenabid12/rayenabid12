import type React from "react";
import { Easing, Interactive, interpolate, spring, useCurrentFrame, useVideoConfig, type InteractivitySchema } from "remotion";
import { CAST, type Who } from "./cast";
import { INK, MARKER, PAPER } from "./theme";

type NameCardProps = {
  readonly who: Who;
};

// A character's chapter card: their name on paper, over a blob of their colour.
const NameCardInner: React.FC<NameCardProps> = ({ who }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = CAST[who];
  return (
    <>
      <Interactive.Div name="Paper" style={{ position: "absolute", inset: 0, backgroundColor: PAPER }} />
      <Interactive.Div
        name="Colour blob"
        style={{
          position: "absolute",
          left: 660,
          top: 250,
          width: 600,
          height: 560,
          backgroundColor: c.accent,
          opacity: 0.3,
          borderRadius: "48% 52% 44% 56% / 55% 45% 55% 45%",
          scale: spring({ frame, fps, config: { damping: 14 } }),
          rotate: "-6deg",
        }}
      />
      <Interactive.Div
        name="Name"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 380,
          textAlign: "center",
          fontFamily: MARKER,
          fontSize: 230,
          color: INK,
          translate: interpolate(frame, [0.15 * fps, 0.7 * fps], ["0px 80px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          opacity: interpolate(frame, [0.15 * fps, 0.5 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        {c.name}
      </Interactive.Div>
    </>
  );
};

const nameCardSchema = {
  who: {
    type: "enum",
    default: "mom",
    description: "Character",
    variants: { girl: {}, boy: {}, mom: {}, dad: {}, grandma: {}, grandpa: {} },
  },
} as const satisfies InteractivitySchema;

export const NameCard = Interactive.withSchema({
  Component: NameCardInner,
  componentName: "NameCard",
  schema: nameCardSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});
