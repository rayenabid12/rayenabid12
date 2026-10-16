import type React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { Monster } from "../Monster";
import { clamp, GROUND_Y, lerp, monsterBox, mouthY, World } from "../World";

const SIZE = 540;

// He blows... and blows... until the bubble lifts him into the sky.
export const BubbleScene: React.FC = () => {
  const f = useCurrentFrame();
  const r =
    f < 85
      ? interpolate(f, [8, 85], [10, 290], { ...clamp, easing: Easing.inOut(Easing.quad) })
      : interpolate(f, [85, 118], [290, 345], clamp);
  const rise = interpolate(f, [42, 100], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const cameraY = rise * 1450;
  const feetY = GROUND_Y - 20 - rise * 300 + Math.sin(f / 9) * 10 * rise;
  const tremble = lerp(f, [92, 118], [0, 1]);
  const wob = Math.sin(f * 1.7) * 0.04 * tremble;
  const worried = f >= 66;
  // the bubble hangs from his mouth, in front of the lower body
  const mouth = mouthY(feetY, SIZE);

  return (
    <>
      <World cameraY={cameraY} />
      <Monster
        brow={worried ? "worried" : "determined"}
        eyeScale={worried ? 1.15 : 1}
        lookY={f < 40 ? 0.7 : worried && f < 96 ? 0 : 0.8}
        lookX={worried && f >= 96 ? 0.2 : 0}
        blink={lerp(f, [78, 80, 83], [0, 1, 0])}
        mouthOpen={0.3}
        mouthWidth={0.28}
        cheeks={0.7 + Math.sin(f / 3) * 0.1}
        leftArm={lerp(f, [40, 60], [10, 70]) + Math.sin(f / 3) * 8 * rise}
        rightArm={lerp(f, [40, 60], [10, 70]) + Math.cos(f / 3) * 8 * rise}
        legSwing={rise}
        shadow={rise < 0.1}
        style={{ ...monsterBox(540 + Math.sin(f * 2.1) * 6 * tremble, feetY, SIZE) }}
      />
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="bubble" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#FFE3EF" stopOpacity={0.95} />
            <stop offset="55%" stopColor="#F9A6CB" stopOpacity={0.92} />
            <stop offset="100%" stopColor="#EE79B1" stopOpacity={0.95} />
          </radialGradient>
        </defs>
        <g transform={`translate(540 ${mouth + r * 0.78}) scale(${1 + wob} ${1 - wob})`}>
          <circle r={r} fill="url(#bubble)" stroke="rgba(255,255,255,0.6)" strokeWidth={5} />
          <ellipse cx={-r * 0.42} cy={-r * 0.45} rx={r * 0.26} ry={r * 0.12} fill="white" opacity={0.75} transform={`rotate(-35 ${-r * 0.42} ${-r * 0.45})`} />
          <circle cx={r * 0.5} cy={-r * 0.5} r={r * 0.05} fill="white" opacity={0.8} />
        </g>
      </svg>
    </>
  );
};
