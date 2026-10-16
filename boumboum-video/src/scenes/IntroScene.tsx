import type React from "react";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { Bubbles, Splash } from "../Bubbles";
import { Logo } from "../Logo";
import { bodyFont, colors } from "../theme";

type IntroProps = {
  readonly tagline: string;
};

const IntroInner: React.FC<IntroProps> = ({ tagline }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 45%, ${colors.hotPink} 0%, #D9367F 80%)`,
        }}
      />
      <Bubbles color={colors.white} />
      <Splash
        style={{
          width: 1150,
          left: -35,
          top: 480,
          scale: interpolate(frame, [0, 0.6 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 10 }),
            output: "perceptual-scale",
          }),
          rotate: `${Math.sin(frame / 15) * 3}deg`,
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          // "BOUM" heartbeat pulse after the letters land
          scale: interpolate(
            frame,
            [1.6 * fps, 1.75 * fps, 1.9 * fps, 2.05 * fps, 2.2 * fps],
            [1, 1.12, 1, 1.12, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
        }}
      >
        <Logo delay={0.3 * fps} fontSize={260} />
      </AbsoluteFill>
      <Interactive.Div
        name="Tagline"
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 260,
          textAlign: "center",
          fontFamily: bodyFont,
          fontWeight: 700,
          fontSize: 72,
          color: colors.white,
          textShadow: "0 6px 0 rgba(0,0,0,0.15)",
          opacity: interpolate(frame, [1.5 * fps, 2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [1.5 * fps, 2 * fps], ["0px 60px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {tagline}
      </Interactive.Div>
    </>
  );
};

const introSchema = {
  tagline: { type: "string", default: "Bubble Gum fourré", description: "Tagline" },
} as const satisfies InteractivitySchema;

export const IntroScene = Interactive.withSchema({
  Component: IntroInner,
  componentName: "IntroScene",
  schema: introSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});
