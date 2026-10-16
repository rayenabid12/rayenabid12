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
import { Logo } from "../../Logo";
import { candyText, colors, displayFont } from "../../theme";
import { Mascot } from "../Mascot";
import { raysBackground, shake } from "../util";

type PayoffProps = {
  readonly cta: string;
};

// Packs land, mascot winks, blows one last bubble... BOUM. Cut to black.
const PayoffInner: React.FC<PayoffProps> = ({ cta }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const POP = 61;

  const bubbleR = frame < POP ? interpolate(frame, [42, POP], [0, 95], clamp) : 0;
  const popRing = interpolate(frame, [POP, POP + 6], [0, 1], clamp);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${colors.bubblePink} 0%, ${colors.hotPink} 100%)`,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill style={{ translate: shake(frame, POP, 8, 22) }}>
        <AbsoluteFill
          style={{
            inset: -600,
            background: raysBackground("rgba(255,255,255,0.18)"),
            rotate: `${frame * 0.4}deg`,
          }}
        />
        <Logo
          delay={-2 * fps}
          fontSize={130}
          style={{ position: "absolute", top: 110, left: 0, right: 0 }}
        />
        <Mascot
          wink={frame >= 28 && frame < 40}
          mouthOpen={frame >= 42 && frame < POP ? 0.15 : 0.7}
          mouthWidth={frame >= 42 && frame < POP ? 0.4 : 1}
          armWave={Math.sin(frame / 3) * 20}
          style={{
            position: "absolute",
            width: 480,
            left: 300,
            top: 560,
            scale: interpolate(frame, [8, 20], [0, 1], {
              ...clamp,
              easing: Easing.spring({ damping: 9 }),
              output: "perceptual-scale",
            }),
          }}
        />
        <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
          {bubbleR > 0 ? (
            <g>
              <circle cx={540} cy={905 + bubbleR * 0.8} r={bubbleR} fill="#F7A3C8" stroke="rgba(255,255,255,0.6)" strokeWidth={4} />
              <ellipse cx={540 - bubbleR * 0.4} cy={905 + bubbleR * 0.4} rx={bubbleR * 0.25} ry={bubbleR * 0.12} fill="white" opacity={0.7} />
            </g>
          ) : null}
          {popRing > 0 && popRing < 1 ? (
            <circle cx={540} cy={980} r={60 + popRing * 260} fill="none" stroke="white" strokeWidth={24 * (1 - popRing)} />
          ) : null}
        </svg>
        <Img
          name="Packs pastèque"
          src={staticFile("packs-pasteque.webp")}
          style={{
            position: "absolute",
            left: 20,
            top: 1060,
            width: 560,
            height: 540,
            objectFit: "contain",
            filter: "drop-shadow(0 25px 30px rgba(0,0,0,0.3))",
            rotate: "-8deg",
            translate: interpolate(frame, [4, 16], ["0px 900px", "0px 0px"], {
              ...clamp,
              easing: Easing.spring({ damping: 11 }),
            }),
          }}
        />
        <Img
          name="Pack fraise"
          src={staticFile("pack-fraise.webp")}
          style={{
            position: "absolute",
            left: 640,
            top: 1010,
            width: 340,
            height: 620,
            objectFit: "contain",
            filter: "drop-shadow(0 25px 30px rgba(0,0,0,0.3))",
            rotate: "8deg",
            translate: interpolate(frame, [8, 20], ["0px 900px", "0px 0px"], {
              ...clamp,
              easing: Easing.spring({ damping: 11 }),
            }),
          }}
        />
        <Interactive.Div
          name="CTA"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 1640,
            textAlign: "center",
            fontFamily: displayFont,
            fontSize: 160,
            ...candyText(colors.logoRed, colors.white, 13),
            scale: interpolate(frame, [24, 32, POP, POP + 3, POP + 7], [3, 1, 1, 1.15, 1], {
              ...clamp,
              easing: Easing.out(Easing.back(1.6)),
            }),
            opacity: interpolate(frame, [24, 26], [0, 1], clamp),
          }}
        >
          {cta}
        </Interactive.Div>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          backgroundColor: "white",
          opacity: interpolate(frame, [POP - 1, POP, POP + 4], [0, 0.7, 0], clamp),
        }}
      />
      {/* hard cut to black */}
      <AbsoluteFill style={{ backgroundColor: "black", opacity: frame >= 68 ? 1 : 0 }} />
    </AbsoluteFill>
  );
};

const payoffSchema = {
  cta: { type: "string", default: "Fais BOUM !", description: "Call to action" },
} as const satisfies InteractivitySchema;

export const PayoffScene = Interactive.withSchema({
  Component: PayoffInner,
  componentName: "PayoffScene",
  schema: payoffSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});
