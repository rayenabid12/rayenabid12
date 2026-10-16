import type React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { Bubbles, Splash, Stripes } from "../Bubbles";
import { bodyFont, candyText, colors, displayFont } from "../theme";

type FlavorProps = {
  readonly flavor: string;
  readonly subtitle: string;
  readonly stripeA: string;
  readonly stripeB: string;
  readonly heroSrc: string;
  readonly packSrc: string;
};

const FlavorInner: React.FC<FlavorProps> = ({
  flavor,
  subtitle,
  stripeA,
  stripeB,
  heroSrc,
  packSrc,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      <Stripes a={stripeA} b={stripeB} />
      <Bubbles color={colors.bubblePink} />
      <Splash
        style={{
          width: 1200,
          left: -60,
          top: 90,
          height: 650,
          opacity: 0.9,
          scale: interpolate(frame, [0, 0.5 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
          }),
        }}
      />
      <Interactive.Div
        name="Subtitle"
        style={{
          position: "absolute",
          top: 230,
          left: 80,
          right: 80,
          textAlign: "center",
          fontFamily: bodyFont,
          fontWeight: 700,
          fontSize: 64,
          color: colors.logoRed,
          opacity: interpolate(frame, [0.3 * fps, 0.7 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {subtitle}
      </Interactive.Div>
      <Interactive.Div
        name="Flavor title"
        style={{
          position: "absolute",
          top: 320,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: displayFont,
          fontSize: 200,
          ...candyText(colors.white, stripeB, 14),
          scale: interpolate(frame, [0.4 * fps, 0.9 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 8 }),
            output: "perceptual-scale",
          }),
        }}
      >
        {flavor}
      </Interactive.Div>
      <Img
        name="Hero"
        src={heroSrc}
        style={{
          position: "absolute",
          width: 960,
          height: 760,
          left: 60,
          top: 560,
          objectFit: "contain",
          filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.35))",
          translate: interpolate(frame, [0.6 * fps, 1.3 * fps], ["1100px 0px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 13 }),
          }),
          rotate: interpolate(frame, [0.6 * fps, 1.3 * fps, 4 * fps], ["25deg", "0deg", "-3deg"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
      <Img
        name="Pack"
        src={packSrc}
        style={{
          position: "absolute",
          width: 760,
          height: 600,
          left: 160,
          top: 1270,
          objectFit: "contain",
          filter: "drop-shadow(0 25px 30px rgba(0,0,0,0.35))",
          translate: interpolate(frame, [1.3 * fps, 2 * fps], ["0px 900px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 11 }),
          }),
          rotate: `${Math.sin(frame / 10) * 4}deg`,
        }}
      />
      <AbsoluteFill
        style={{
          // white "boum" flash when the title lands
          backgroundColor: colors.white,
          opacity: interpolate(frame, [0.4 * fps, 0.5 * fps, 0.8 * fps], [0, 0.5, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </>
  );
};

const flavorSchema = {
  flavor: { type: "string", default: "PASTÈQUE", description: "Flavor" },
  subtitle: { type: "string", default: "Fourré coulis goût", description: "Subtitle" },
  stripeA: { type: "color", default: colors.green, description: "Stripe color A" },
  stripeB: { type: "color", default: colors.greenDark, description: "Stripe color B" },
  heroSrc: { type: "asset", assetType: "image", default: undefined, description: "Hero image" },
  packSrc: { type: "asset", assetType: "image", default: undefined, description: "Pack image" },
} as const satisfies InteractivitySchema;

export const FlavorScene = Interactive.withSchema({
  Component: FlavorInner,
  componentName: "FlavorScene",
  schema: flavorSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});
