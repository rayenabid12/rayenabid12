import type React from "react";
import { Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame, useVideoConfig, type InteractivitySchema } from "remotion";
import { INK, MARKER, PAPER } from "./theme";

type BookendProps = {
  readonly title: string;
};

// Intro and outro: the painted family lineup (its sheet title cropped off), slowly pushing in, under a title.
const BookendInner: React.FC<BookendProps> = ({ title }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return (
    <>
      <Interactive.Div name="Paper" style={{ position: "absolute", inset: 0, backgroundColor: PAPER }} />
      <Img
        src={staticFile("lineup.jpg")}
        style={{
          position: "absolute",
          left: 0,
          top: 150,
          width: 1920,
          height: 930,
          transformOrigin: "50% 100%",
          scale: interpolate(frame, [0, durationInFrames], [0.86, 0.92], { output: "perceptual-scale" }),
        }}
      />
      <Interactive.Div name="Title band" style={{ position: "absolute", left: 0, right: 0, top: 0, height: 250, backgroundColor: PAPER }} />
      <Interactive.Div
        name="Title"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 70,
          textAlign: "center",
          fontFamily: MARKER,
          fontSize: 150,
          color: INK,
          opacity: interpolate(frame, [0.2 * fps, 0.8 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          translate: interpolate(frame, [0.2 * fps, 0.9 * fps], ["0px 40px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {title}
      </Interactive.Div>
    </>
  );
};

const bookendSchema = {
  title: { type: "string", default: "Meet the family", description: "Title" },
} as const satisfies InteractivitySchema;

export const Bookend = Interactive.withSchema({
  Component: BookendInner,
  componentName: "Bookend",
  schema: bookendSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});
