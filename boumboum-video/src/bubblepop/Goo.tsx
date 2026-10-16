import type React from "react";
import { useId } from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

// Slow-motion splash of the runny filling, erupting from (x, y) at local frame 0.

const DROPS = [
  [-150, 26, 28], [-130, 30, 18], [-110, 34, 24], [-95, 38, 14], [-80, 32, 22],
  [-65, 28, 16], [-45, 34, 20], [-30, 24, 12], [-170, 22, 14], [-10, 20, 16],
  [-120, 20, 10], [-55, 22, 10], [-140, 40, 12], [-75, 42, 18],
];

type GooProps = {
  readonly x: number;
  readonly y: number;
  readonly color: string;
  readonly light: string;
};

export const Goo: React.FC<GooProps> = ({ x, y, color, light }) => {
  const frame = useCurrentFrame();
  const id = useId().replace(/:/g, "");
  if (frame < 0) return null;

  const t = frame * 0.55; // slow motion
  const blob = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 9 }),
  });
  const wobble = 1 + Math.sin(frame / 3) * 0.06;
  const drip = (len: number) =>
    interpolate(frame, [4, 70], [0, len], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
  const fade = interpolate(frame, [55, 75], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <svg
      viewBox="0 0 1080 1920"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
    >
      <defs>
        <radialGradient id={`goo${id}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={light} />
          <stop offset="60%" stopColor={color} />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
      </defs>
      {/* drips running down */}
      {[
        [-55, 34, 300],
        [15, 26, 380],
        [70, 20, 220],
      ].map(([dx, w, len], i) => {
        const l = drip(len);
        return (
          <g key={i}>
            <rect x={x + dx - w / 2} y={y} width={w} height={l} fill={`url(#goo${id})`} />
            <circle cx={x + dx} cy={y + l} r={w * 0.75} fill={`url(#goo${id})`} />
            <ellipse cx={x + dx - w * 0.2} cy={y + l * 0.5} rx={w * 0.12} ry={l * 0.3} fill="white" opacity={0.45} />
          </g>
        );
      })}
      {/* main blob */}
      <g transform={`translate(${x} ${y}) scale(${blob * wobble} ${blob / wobble})`}>
        <path
          d="M -110 0 C -120 -70 -40 -105 0 -90 C 50 -115 125 -70 110 -10 C 135 40 70 85 20 70 C -30 100 -110 70 -110 0 Z"
          fill={`url(#goo${id})`}
        />
        <ellipse cx={-40} cy={-50} rx={34} ry={16} fill="white" opacity={0.55} transform="rotate(-20 -40 -50)" />
      </g>
      {/* flying droplets */}
      <g opacity={fade}>
        {DROPS.map(([angle, speed, r], i) => {
          const a = (angle * Math.PI) / 180;
          const dx = Math.cos(a) * speed * t;
          const dy = Math.sin(a) * speed * t + 0.5 * 1.8 * t * t;
          const vx = Math.cos(a) * speed;
          const vy = Math.sin(a) * speed + 1.8 * t;
          const rot = (Math.atan2(vy, vx) * 180) / Math.PI;
          const cx = x + dx;
          const cy = y + dy;
          return (
            <g key={i} transform={`rotate(${rot} ${cx} ${cy})`}>
              <ellipse cx={cx} cy={cy} rx={r * 1.5} ry={r} fill={`url(#goo${id})`} />
              <circle cx={cx + r * 0.3} cy={cy - r * 0.35} r={r * 0.28} fill="white" opacity={0.6} />
            </g>
          );
        })}
      </g>
    </svg>
  );
};
