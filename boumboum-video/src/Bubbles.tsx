import type React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

// Floating bubble-gum bubbles drifting upward. One template for all bubbles.
const BUBBLES = [
  { x: 8, size: 90, speed: 1.0, delay: 0 },
  { x: 22, size: 50, speed: 1.4, delay: 40 },
  { x: 38, size: 130, speed: 0.8, delay: 15 },
  { x: 55, size: 70, speed: 1.2, delay: 60 },
  { x: 70, size: 110, speed: 0.9, delay: 25 },
  { x: 85, size: 60, speed: 1.3, delay: 5 },
  { x: 93, size: 95, speed: 1.0, delay: 70 },
  { x: 15, size: 75, speed: 1.1, delay: 90 },
  { x: 62, size: 45, speed: 1.5, delay: 100 },
];

export const Bubbles: React.FC<{ readonly color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();

  return (
    <>
      {BUBBLES.map((b, i) => {
        const travel = height + b.size * 2;
        const y = height + b.size - ((frame + b.delay) * 6 * b.speed) % travel;
        const wobble = Math.sin((frame + b.delay) / 12) * 18;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${b.x}%`,
              top: y,
              width: b.size,
              height: b.size,
              borderRadius: "50%",
              translate: `${wobble}px 0px`,
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.15) 25%, ${color} 70%)`,
              opacity: 0.55,
            }}
          />
        );
      })}
    </>
  );
};

// Vertical candy stripes like the boxes.
export const Stripes: React.FC<{ readonly a: string; readonly b: string }> = ({
  a,
  b,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        inset: -200,
        backgroundImage: `repeating-linear-gradient(90deg, ${a} 0px, ${a} 60px, ${b} 60px, ${b} 120px)`,
        rotate: "8deg",
        translate: `${(frame * 1.5) % 120}px 0px`,
      }}
    />
  );
};

// Pink splash blob behind the logo.
export const Splash: React.FC<{ readonly style?: React.CSSProperties }> = ({
  style,
}) => (
  <svg viewBox="0 0 400 300" style={{ position: "absolute", ...style }}>
    <path
      d="M60 150 C20 90 70 30 140 50 C180 10 260 10 290 55 C360 40 400 110 360 160 C395 220 330 280 260 255 C220 295 140 295 110 255 C40 270 10 200 60 150 Z"
      fill="#F7B6CF"
    />
    <circle cx="345" cy="45" r="14" fill="#F7B6CF" />
    <circle cx="372" cy="70" r="8" fill="#F7B6CF" />
    <circle cx="40" cy="250" r="12" fill="#F7B6CF" />
  </svg>
);
