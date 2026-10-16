import type React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { candyText, colors, displayFont, scriptFont } from "./theme";

// One letter popping in with a bouncy overshoot.
const PopLetter: React.FC<{
  readonly char: string;
  readonly delay: number;
}> = ({ char, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <span
      style={{
        display: "inline-block",
        scale: interpolate(frame, [delay, delay + 0.5 * fps], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.spring({ damping: 9 }),
          output: "perceptual-scale",
        }),
        rotate: interpolate(frame, [delay, delay + 0.5 * fps], ["-25deg", "0deg"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.spring({ damping: 9 }),
        }),
      }}
    >
      {char}
    </span>
  );
};

type LogoProps = {
  readonly delay?: number;
  readonly fontSize?: number;
  readonly style?: React.CSSProperties;
};

export const Logo: React.FC<LogoProps> = ({ delay = 0, fontSize = 230, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const word = "BOUM";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        lineHeight: 0.85,
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: scriptFont,
          fontSize: fontSize * 0.5,
          marginBottom: fontSize * 0.08,
          ...candyText(colors.logoRed, colors.white, fontSize * 0.04),
          translate: interpolate(frame, [delay, delay + 0.6 * fps], ["0px -300px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 11 }),
          }),
          opacity: interpolate(frame, [delay, delay + 0.2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Ballon
      </div>
      {[0, 1].map((row) => (
        <div
          key={row}
          style={{
            fontFamily: displayFont,
            fontSize,
            ...candyText(colors.logoRed, colors.white, fontSize * 0.07),
          }}
        >
          {word.split("").map((c, i) => (
            <PopLetter
              key={i}
              char={c}
              delay={delay + 0.3 * fps + (row * 4 + i) * 3}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
