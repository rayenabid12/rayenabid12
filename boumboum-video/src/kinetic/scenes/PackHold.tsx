import type React from "react";
import {
  AbsoluteFill,
  Img,
  Interactive,
  interpolate,
  useCurrentFrame,
  type InteractivitySchema,
} from "remotion";
import { headline, LABEL } from "../design";
import { Labels } from "../Labels";
import { Reveal, wipeUp } from "../Reveal";

type HoldProps = {
  readonly bg: string;
  readonly fg: string;
  readonly src: string;
  readonly title: string;
  readonly titleSize: number;
  readonly index: string;
};

// A calm beat: the pack, centered, slowly drifting closer.
const HoldInner: React.FC<HoldProps> = ({ bg, fg, src, title, titleSize, index }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{ backgroundColor: bg }} />
      <Img
        name="Pack"
        src={src}
        style={{
          position: "absolute",
          left: 90,
          top: 300,
          width: 900,
          height: 900,
          objectFit: "contain",
          clipPath: wipeUp(frame, 0, 10),
          scale: interpolate(frame, [0, 45], [0.97, 1.03], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300, textAlign: "center" }}>
        <div
          style={{
            fontFamily: LABEL,
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: "0.08em",
            color: fg,
            marginBottom: 28,
            opacity: interpolate(frame, [8, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          BUBBLE GUM FOURRÉ
        </div>
        <Reveal at={5} duration={9}>
          <div style={headline(titleSize, fg)}>{title}</div>
        </Reveal>
      </div>
      <Labels color={fg} tl="Ballon" tr="Boum Boum" bl={index} br="Colorants naturels" />
    </>
  );
};

const holdSchema = {
  bg: { type: "color", default: "#FFF4EC", description: "Background" },
  fg: { type: "color", default: "#0F5C2C", description: "Type color" },
  src: { type: "asset", assetType: "image", default: undefined, description: "Pack image" },
  title: { type: "string", default: "PASTÈQUE", description: "Title" },
  index: { type: "string", default: "01 — Pastèque", description: "Index label" },
} as const satisfies InteractivitySchema;

export const PackHold = Interactive.withSchema({
  Component: HoldInner,
  componentName: "PackHold",
  schema: holdSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});
