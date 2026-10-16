import type React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { headline, inOut, K, SIZE } from "../design";
import { Labels } from "../Labels";

// Product photography seen through the letters.
const filled = (src: string, color: string, position: string): React.CSSProperties => ({
  ...headline(SIZE.BOUM, "transparent"),
  background: `url(${src}) ${position} / cover no-repeat, ${color}`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  paddingTop: "0.08em",
});

// A cropped, oversized BOUM BOUM pulls back to reveal the whole word.
export const BoumMask: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: K.cream }}>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 20,
          scale: interpolate(frame, [0, 30], [3.4, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: inOut,
          }),
        }}
      >
        <div style={filled(staticFile("gum-pasteque.webp"), K.green, "40% 60%")}>BOUM</div>
        <div style={{ ...headline(SIZE.BOUM, K.crimson), paddingTop: "0.08em" }}>BOUM</div>
      </AbsoluteFill>
      <Labels color={K.red} tl="Ballon" tr="Bubble gum fourré" bl="Pastèque · Fraise" br="Fourré coulis" />
    </AbsoluteFill>
  );
};
