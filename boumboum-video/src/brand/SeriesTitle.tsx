import type React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { bodyFont, candyText, colors, displayFont } from "../theme";

// Opening title card shared by every episode of "Les Aventures Boum Boum".
export const SeriesTitle: React.FC<{
  readonly episode: number;
  readonly title: string;
  readonly titleColor?: string;
  readonly outAt?: number;
}> = ({ episode, title, titleColor = colors.logoRed, outAt = 48 }) => {
  const f = useCurrentFrame();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const pop = (at: number) =>
    interpolate(f, [at, at + 8, outAt, outAt + 8], [0, 1, 1, 0], { ...clamp, easing: Easing.out(Easing.back(2)) });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center" }}>
      <div
        style={{
          display: "inline-block",
          padding: "14px 34px",
          borderRadius: 999,
          background: colors.logoRed,
          color: "white",
          fontFamily: bodyFont,
          fontWeight: 700,
          fontSize: 44,
          scale: pop(0),
          boxShadow: "0 8px 0 rgba(0,0,0,0.18)",
        }}
      >
        Les Aventures Boum Boum
      </div>
      <div style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 52, color: "white", marginTop: 24, scale: pop(4), textShadow: "0 4px 0 rgba(0,0,0,0.25)" }}>
        Épisode {episode}
      </div>
      <div
        style={{
          fontFamily: displayFont,
          fontSize: 165,
          lineHeight: 1,
          marginTop: 10,
          ...candyText(titleColor, colors.white, 16),
          scale: pop(8),
          rotate: `${-4 + Math.sin(f / 6) * 2}deg`,
        }}
      >
        {title}
      </div>
    </div>
  );
};
