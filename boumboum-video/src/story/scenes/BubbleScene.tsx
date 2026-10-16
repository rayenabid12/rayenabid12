import type React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { Monster } from "../Monster";
import { clamp, ease, GROUND_Y, lerp, monsterBox, mouthY, World } from "../World";

const SIZE = 540;

const rise = (f: number) => interpolate(f, [42, 100], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
const feetAt = (f: number) => GROUND_Y - 20 - rise(f) * 300 + Math.sin(f / 9) * 10 * rise(f);

// A deep breath, then he blows... until the bubble lifts him into the sky.
export const BubbleScene: React.FC = () => {
  const f = useCurrentFrame();
  const r =
    f < 85
      ? interpolate(f, [10, 85], [10, 290], { ...clamp, easing: Easing.inOut(Easing.quad) })
      : interpolate(f, [85, 118], [290, 345], clamp);
  const up = rise(f);
  const feetY = feetAt(f);
  const vy = feetY - feetAt(f - 1);
  const tremble = lerp(f, [92, 118], [0, 1]);
  const wob = Math.sin(f * 1.7) * 0.04 * tremble;
  const worry = ease(f, [62, 72], [0, 1]);
  const mouth = mouthY(feetY, SIZE);

  return (
    <>
      <World cameraY={up * 1450} />
      <Monster
        brow={worry > 0.5 ? "worried" : "determined"}
        eyeScale={1 + worry * 0.15}
        lookY={f < 40 ? 0.7 : worry > 0.5 && f < 96 ? 0 : ease(f, [40, 50], [0.7, 0.85])}
        lookX={f >= 96 ? Math.sin(f / 3) * 0.3 : 0}
        mouthOpen={ease(f, [0, 8], [0.8, 0.3])}
        mouthWidth={ease(f, [0, 8], [0.7, 0.28])}
        cheeks={ease(f, [0, 8], [0, 1]) * (0.75 + Math.sin(f / 3) * 0.1)}
        squash={ease(f, [0, 6, 12], [1, 1.08, 1])}
        tilt={ease(f, [0, 8], [0, -5]) + Math.sin(f / 11) * 2}
        leftArm={ease(f, [40, 60], [10, 75]) + Math.sin(f / 3) * 10 * up}
        rightArm={ease(f, [40, 60], [10, 75]) + Math.cos(f / 3) * 10 * up}
        armCurl={Math.sin(f / 3) * 0.6 * up}
        legSwing={up}
        vy={vy * 3}
        shadow={up < 0.1}
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
