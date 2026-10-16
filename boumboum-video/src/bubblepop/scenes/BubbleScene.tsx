import type React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Eye, Mouth } from "../Mascot";

// Hook: a gum bubble inflates until it's about to burst... and it has a face.
export const BubbleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

  const R = interpolate(frame, [0, 118], [240, 700], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });
  const amp = interpolate(frame, [0, 80, 118], [0.015, 0.03, 0.08], clamp);
  const sx = 1 + Math.sin(frame * 0.9) * amp;
  const sy = 1 - Math.sin(frame * 0.9) * amp;
  const tremble = interpolate(frame, [85, 118], [0, 16], clamp);
  const cx = 540 + Math.sin(frame * 2.3) * tremble;
  const cy = 960 + Math.cos(frame * 2.9) * tremble;

  const blink = interpolate(frame, [76, 79, 82], [0, 1, 0], clamp);
  const eyesOpen = interpolate(frame, [50, 57], [0, 1], clamp) * (1 - blink);
  const worried = interpolate(frame, [92, 98], [0, 1], clamp);
  const eyeScale = (R / 300) * (1 + worried * 0.25);
  // looks around, then up at the stretching bubble
  const lookX = frame < 92 ? Math.sin((frame - 57) / 6) * 0.9 : 0;
  const lookY = worried * -0.8;
  const mouthIn = interpolate(frame, [64, 72], [0, 1], clamp);

  return (
    <AbsoluteFill
      style={{ background: "radial-gradient(circle at 50% 50%, #5A1240 0%, #22061A 80%)" }}
    >
      <svg viewBox="0 0 1080 1920" style={{ width: "100%", height: "100%" }}>
        <defs>
          <radialGradient id="bubbleFill" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#FFD3E6" />
            <stop offset="50%" stopColor="#F27BB4" />
            <stop offset="100%" stopColor="#D8418A" />
          </radialGradient>
        </defs>
        <g transform={`translate(${cx} ${cy}) scale(${sx} ${sy}) translate(${-cx} ${-cy})`}>
          <circle cx={cx} cy={cy} r={R} fill="url(#bubbleFill)" stroke="rgba(255,255,255,0.35)" strokeWidth={6} />
          <ellipse
            cx={cx - R * 0.45}
            cy={cy - R * 0.5}
            rx={R * 0.28}
            ry={R * 0.13}
            fill="white"
            opacity={0.55}
            transform={`rotate(-35 ${cx - R * 0.45} ${cy - R * 0.5})`}
          />
          <circle cx={cx + R * 0.55} cy={cy - R * 0.45} r={R * 0.05} fill="white" opacity={0.6} />
          <Eye cx={cx - R * 0.3} cy={cy - R * 0.12} open={eyesOpen} lookX={lookX} lookY={lookY} scale={eyeScale} pupil={1 - worried * 0.4} />
          <Eye cx={cx + R * 0.3} cy={cy - R * 0.12} open={eyesOpen} lookX={lookX} lookY={lookY} scale={eyeScale} pupil={1 - worried * 0.4} />
          {mouthIn > 0 ? (
            <g opacity={mouthIn}>
              <Mouth
                x={cx}
                y={cy + R * 0.22}
                open={interpolate(worried, [0, 1], [0, 0.55])}
                width={interpolate(worried, [0, 1], [0.9, 0.4])}
                scale={R / 300}
              />
            </g>
          ) : null}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
