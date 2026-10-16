import type React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { headline, K, SIZE } from "../design";

type Cut =
  | { at: number; bg: string; word: string; fg: string; size: number }
  | { at: number; bg: string; img: string };

// Eighth-note cuts: words and products trade places on the beat.
const CUTS: Cut[] = [
  { at: 0, bg: K.green, word: "PASTÈQUE", fg: K.pink, size: SIZE.PASTEQUE },
  { at: 8, bg: K.crimson, word: "FRAISE", fg: K.cream, size: SIZE.FRAISE },
  { at: 15, bg: K.pink, img: "gum-pasteque.webp" },
  { at: 23, bg: K.cream, img: "box-fraise.webp" },
  { at: 30, bg: K.red, word: "BOUM", fg: K.cream, size: SIZE.BOUM },
  { at: 38, bg: K.pink, word: "BOUM", fg: K.red, size: SIZE.BOUM },
];

export const Montage: React.FC = () => {
  const frame = useCurrentFrame();
  let idx = 0;
  CUTS.forEach((c, i) => {
    if (frame >= c.at) idx = i;
  });
  const c = CUTS[idx];
  const local = frame - c.at;
  return (
    <AbsoluteFill style={{ backgroundColor: c.bg, justifyContent: "center", alignItems: "center" }}>
      {"word" in c ? (
        <div style={headline(c.size, c.fg)}>{c.word}</div>
      ) : (
        <Img
          src={staticFile(c.img)}
          style={{
            width: 900,
            height: 900,
            objectFit: "contain",
            scale: interpolate(local, [0, 8], [1.06, 1], { extrapolateRight: "clamp" }),
          }}
        />
      )}
    </AbsoluteFill>
  );
};
