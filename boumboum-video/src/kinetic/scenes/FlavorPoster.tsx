import type React from "react";
import {
  AbsoluteFill,
  Img,
  Interactive,
  interpolate,
  useCurrentFrame,
  type InteractivitySchema,
} from "remotion";
import { expoOut, headline, MARGIN } from "../design";
import { Labels } from "../Labels";
import { wipeUp } from "../Reveal";

type PosterProps = {
  readonly lines: string[];
  readonly size: number;
  readonly bg: string;
  readonly fg: string;
  readonly heroSrc: string;
  readonly heroWidth: number;
  readonly heroHeight: number;
  readonly heroX?: number; // hero center x
  readonly heroBelowLines: number; // lines drawn under the hero; the rest overlap it
  readonly index: string;
  readonly note: string;
};

// Poster layout: the flavor name set across the full height, product layered in between.
const PosterInner: React.FC<PosterProps> = ({
  lines,
  size,
  bg,
  fg,
  heroSrc,
  heroWidth,
  heroHeight,
  heroX = 540,
  heroBelowLines,
  index,
  note,
}) => {
  const frame = useCurrentFrame();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

  const line = (text: string, i: number) => {
    const fromLeft = i % 2 === 0;
    return (
      <div
        key={text}
        style={{
          ...headline(size, fg),
          position: "absolute",
          top: i === 0 ? 150 : undefined,
          bottom: i === lines.length - 1 ? 170 : undefined,
          ...(lines.length === 3 && i === 1 ? { top: 960 - size * 0.4 } : {}),
          left: fromLeft ? MARGIN : undefined,
          right: fromLeft ? undefined : MARGIN,
          zIndex: i < heroBelowLines ? 1 : 3,
          translate: interpolate(frame, [i * 4, i * 4 + 12], [fromLeft ? "-1100px 0px" : "1100px 0px", "0px 0px"], {
            ...clamp,
            easing: expoOut,
          }),
        }}
      >
        {text}
      </div>
    );
  };

  return (
    <>
      <AbsoluteFill style={{ backgroundColor: bg }} />
      {lines.map(line)}
      <Img
        name="Hero"
        src={heroSrc}
        style={{
          position: "absolute",
          zIndex: 2,
          width: heroWidth,
          height: heroHeight,
          left: heroX - heroWidth / 2,
          top: 960 - heroHeight / 2,
          objectFit: "contain",
          clipPath: wipeUp(frame, 15, 12),
          scale: interpolate(frame, [15, 75], [1, 1.06], clamp),
          rotate: interpolate(frame, [15, 75], ["-2deg", "1deg"], clamp),
        }}
      />
      <div style={{ position: "absolute", inset: 0, zIndex: 4 }}>
        <Labels color={fg} tl="Ballon" tr="Boum Boum" bl={index} br={note} />
      </div>
    </>
  );
};

const posterSchema = {
  size: { type: "number", default: 665, min: 200, max: 1100, step: 1, description: "Type size", hiddenFromList: false },
  bg: { type: "color", default: "#0F5C2C", description: "Background" },
  fg: { type: "color", default: "#F9C6D8", description: "Type color" },
  heroSrc: { type: "asset", assetType: "image", default: undefined, description: "Hero image" },
  index: { type: "string", default: "01 — Pastèque", description: "Index label" },
  note: { type: "string", default: "Fourré coulis", description: "Note label" },
} as const satisfies InteractivitySchema;

export const FlavorPoster = Interactive.withSchema({
  Component: PosterInner,
  componentName: "FlavorPoster",
  schema: posterSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});
