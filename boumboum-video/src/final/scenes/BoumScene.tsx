import type React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { AnimatedMonster } from "../../rig/AnimatedMonster";
import { blinkAt, type Key, sortKeys } from "../../rig/pose";
import { Starburst } from "../../story/Props";
import { World } from "../../story/World";
import { candyText, colors, displayFont } from "../../theme";
import { alternate, poseAt, rigBox, rigToScreen } from "../kit";
import { ANCHOR, SCALE, WIDTH } from "./SnackScene";

// POP: the cartoon take, gum on his head, hang time... he looks down... and drops.
export const BOUM_KEYS: Key[] = sortKeys([
  // where the bubble shot left him
  { f: -3, y: -214, sy: 1, armL: 60, armR: 60, eyeScale: 1.2, browTilt: 16, browY: -4, lookY: 0.9, cheeks: 0.6, mouthOpen: 0.3, mouthWidth: 0.28, legSpread: 0.3 },
  // the take
  { f: 0, y: -240, sy: 1.3, eyeScale: 1.45, pupil: 0.5, browY: -30, browTilt: 0, mouthOpen: 1, mouthWidth: 0.45, armL: 160, armR: 160, legSpread: 0.6, cheeks: 0, lookY: 0, ease: "snap" },
  { f: 5, sy: 1.18, eyeScale: 1.35, ease: "out" },
  ...alternate(5, 13, 2, { x: 4 }, { x: -4 }).map((k) => ({ ...k, ease: "linear" as const })),
  { f: 14, x: 0 },
  ...blinkAt(9),
  // looks down: uh-oh
  { f: 16, lookY: 0.9, browTilt: 16, browY: -10, mouthOpen: 0.4, smile: -0.5, armL: 100, armR: 100, sy: 1.05, eyeScale: 1.3 },
  { f: 18, y: -240, ease: "hold" },
  { f: 22, armL: 150, armR: 150 },
  { f: 39, y: 1250, ease: "in" },
]);

const SHREDS = Array.from({ length: 16 }, (_, i) => ({
  a: (i / 16) * Math.PI * 2 + (i % 3) * 0.3,
  d: 520 + (i % 4) * 140,
  s: 50 + ((i * 29) % 50),
}));
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const BoumScene: React.FC = () => {
  const f = useCurrentFrame();
  const pose = poseAt(BOUM_KEYS, f);
  const head = rigToScreen(pose, ANCHOR, SCALE, 200, 60);
  const burst = interpolate(f, [0, 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const popAt = rigToScreen(poseAt(BOUM_KEYS, 0), ANCHOR, SCALE, 200, 420);
  const falling = f > 20;

  return (
    <>
      <World cameraY={interpolate(f, [26, 40], [1450, 1000], { ...clamp, easing: Easing.in(Easing.quad) })} />
      {falling
        ? [180, 330, 760, 900, 260, 820].map((x, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: ((i * 330 - f * 90) % 1920 + 1920) % 1920,
                width: 8,
                height: 260,
                borderRadius: 4,
                backgroundColor: "white",
                opacity: 0.7,
              }}
            />
          ))
        : null}
      {SHREDS.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: popAt[0] - s.s / 2,
            top: popAt[1] - s.s / 2,
            width: s.s,
            height: s.s * 0.7,
            borderRadius: "48% 52% 40% 60% / 55% 45% 55% 45%",
            backgroundColor: i % 2 ? "#F9A6CB" : "#FFD3E6",
            translate: `${Math.cos(s.a) * s.d * burst}px ${Math.sin(s.a) * s.d * burst + burst * burst * 200}px`,
            rotate: `${i * 40 * burst}deg`,
            opacity: interpolate(f, [20, 32], [1, 0], clamp),
          }}
        />
      ))}
      <AnimatedMonster keys={BOUM_KEYS} shadow={false} style={rigBox(ANCHOR, WIDTH)} />
      {/* gum stuck on his head */}
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${head[0]} ${head[1]}) scale(${SCALE})`} fill="#FFC9E0">
          <path d="M -80 10 C -50 -20 10 -10 40 2 C 70 10 60 35 36 32 C 20 60 0 35 -20 44 C -50 56 -40 24 -68 36 C -92 44 -100 24 -80 10 Z" />
          <circle cx={-170} cy={58} r={22} />
          <path d="M 140 36 C 170 32 192 50 180 68 C 172 82 152 74 150 90 C 148 102 130 100 134 80 C 136 66 118 52 140 36 Z" />
          <circle cx={62} cy={-14} r={12} />
        </g>
      </svg>
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 120 }}>
        <div
          style={{
            position: "relative",
            width: 700,
            height: 520,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            scale: interpolate(f, [0, 6, 30, 38], [2.2, 1, 1, 0], { ...clamp, easing: Easing.out(Easing.back(1.6)) }),
            rotate: "-7deg",
          }}
        >
          <Starburst color="#FFD84D" style={{ position: "absolute", width: 700, height: 520 }} />
          <div style={{ position: "relative", fontFamily: displayFont, fontSize: 200, ...candyText(colors.logoRed, colors.white, 16) }}>BOUM !</div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "white", opacity: interpolate(f, [0, 5], [0.95, 0], clamp) }} />
    </>
  );
};
