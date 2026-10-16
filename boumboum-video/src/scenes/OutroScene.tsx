import type React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { Bubbles } from "../Bubbles";
import { Logo } from "../Logo";
import { bodyFont, candyText, colors, displayFont } from "../theme";

type OutroProps = {
  readonly cta: string;
  readonly badge: string;
};

const OutroInner: React.FC<OutroProps> = ({ cta, badge }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${colors.bubblePink} 0%, ${colors.hotPink} 100%)`,
        }}
      />
      <Bubbles color={colors.white} />
      <Logo fontSize={200} style={{ position: "absolute", top: 150, left: 0, right: 0 }} />
      <Img
        name="Box pastèque"
        src={staticFile("box-pasteque.webp")}
        style={{
          position: "absolute",
          width: 640,
          height: 640,
          left: 0,
          top: 900,
          objectFit: "contain",
          filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.3))",
          translate: interpolate(frame, [0.5 * fps, 1.1 * fps], ["-700px 0px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 12 }),
          }),
          rotate: "-6deg",
        }}
      />
      <Img
        name="Box fraise"
        src={staticFile("box-fraise.webp")}
        style={{
          position: "absolute",
          width: 620,
          height: 620,
          left: 440,
          top: 960,
          objectFit: "contain",
          filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.3))",
          translate: interpolate(frame, [0.7 * fps, 1.3 * fps], ["700px 0px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 12 }),
          }),
          rotate: "5deg",
        }}
      />
      <Interactive.Div
        name="Badge"
        style={{
          position: "absolute",
          right: 70,
          top: 700,
          width: 230,
          height: 230,
          borderRadius: "50%",
          border: `8px solid ${colors.white}`,
          backgroundColor: colors.green,
          color: colors.white,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontFamily: bodyFont,
          fontWeight: 700,
          fontSize: 44,
          lineHeight: 1.05,
          scale: interpolate(frame, [1.4 * fps, 1.8 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 8 }),
            output: "perceptual-scale",
          }),
          rotate: `${12 + Math.sin(frame / 8) * 6}deg`,
        }}
      >
        {badge}
      </Interactive.Div>
      <Interactive.Div
        name="CTA"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 180,
          textAlign: "center",
          fontFamily: displayFont,
          fontSize: 150,
          ...candyText(colors.logoRed, colors.white, 12),
          scale: interpolate(
            frame,
            [1.8 * fps, 2.2 * fps, 2.8 * fps, 2.95 * fps, 3.1 * fps],
            [0, 1, 1, 1.1, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.34, 1.56, 0.64, 1),
            },
          ),
        }}
      >
        {cta}
      </Interactive.Div>
    </>
  );
};

const outroSchema = {
  cta: { type: "string", default: "Fais BOUM !", description: "Call to action" },
  badge: { type: "string", default: "Colorants naturels", description: "Badge" },
} as const satisfies InteractivitySchema;

export const OutroScene = Interactive.withSchema({
  Component: OutroInner,
  componentName: "OutroScene",
  schema: outroSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});
