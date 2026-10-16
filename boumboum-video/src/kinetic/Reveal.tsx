import type React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { expoOut } from "./design";

type RevealProps = {
  readonly at: number;
  readonly duration?: number;
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
};

// Text rising out of a hidden mask line.
export const Reveal: React.FC<RevealProps> = ({ at, duration = 8, children, style }) => {
  const frame = useCurrentFrame();
  return (
    // Extra top room keeps accents (È) inside the mask without shifting the layout.
    <div style={{ overflow: "hidden", paddingTop: "0.3em", marginTop: "-0.3em", ...style }}>
      <div
        style={{
          translate: interpolate(frame, [at, at + duration], ["0px 110%", "0px 0%"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: expoOut,
          }),
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Clip-path wipe from the bottom edge, for product images.
export const wipeUp = (frame: number, at: number, duration = 10) =>
  `inset(${interpolate(frame, [at, at + duration], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: expoOut,
  })}% 0% 0% 0%)`;
