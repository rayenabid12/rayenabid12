import type React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { candyText, colors, displayFont } from "../../theme";
import { Monster } from "../Monster";
import { Starburst } from "../Props";
import { clamp, lerp, monsterBox, World } from "../World";

const fallAt = (f: number) => interpolate(f, [14, 40], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });

const SIZE = 540;
const SHREDS = Array.from({ length: 16 }, (_, i) => ({
  a: (i / 16) * Math.PI * 2 + (i % 3) * 0.3,
  d: 520 + (i % 4) * 140,
  s: 50 + ((i * 29) % 50),
}));

// POP. A comic "BOUM !", gum bits on his head, a beat of hang-time... and down he goes.
export const BoumScene: React.FC = () => {
  const f = useCurrentFrame();
  const burst = interpolate(f, [0, 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const fall = fallAt(f);
  const vy = (fallAt(f) - fallAt(f - 1)) * 2300;
  const feetY = 1200 + fall * 2300;
  const headTop = feetY - SIZE * 1.175;

  return (
    <>
      <World cameraY={1450} />
      {/* speed lines while falling */}
      {fall > 0
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
            left: 540 - s.s / 2,
            top: 1130 - s.s / 2,
            width: s.s,
            height: s.s * 0.7,
            borderRadius: "48% 52% 40% 60% / 55% 45% 55% 45%",
            backgroundColor: i % 2 ? "#F9A6CB" : "#FFD3E6",
            translate: `${Math.cos(s.a) * s.d * burst}px ${Math.sin(s.a) * s.d * burst + burst * burst * 200}px`,
            rotate: `${i * 40 * burst}deg`,
            opacity: lerp(f, [20, 32], [1, 0]),
          }}
        />
      ))}
      <Monster
        brow="surprised"
        eyeScale={1.25}
        blink={lerp(f, [8, 10, 12], [0, 1, 0])}
        mouthOpen={0.9}
        mouthWidth={0.5}
        leftArm={125 + Math.sin(f / 2) * 15 * fall}
        rightArm={125 + Math.cos(f / 2) * 15 * fall}
        armCurl={Math.sin(f / 2.5) * 0.9}
        legSwing={1}
        impactAt={0}
        vy={vy}
        lean={fall * 18}
        tilt={f < 14 ? Math.sin(f / 2) * 3 : 0}
        squash={1 + fall * 0.15}
        shadow={false}
        style={{ ...monsterBox(540 + (f < 14 ? Math.sin(f * 3) * 4 : 0), feetY, SIZE) }}
      />
      {/* gum bits stuck on his head */}
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${540 - SIZE / 2} ${headTop}) scale(${SIZE / 400})`} fill="#FFC9E0" opacity={lerp(f, [0, 3], [0, 1])}>
          <path d="M 120 70 C 150 40 210 50 240 62 C 270 70 260 95 236 92 C 220 120 200 95 180 104 C 150 116 160 84 132 96 C 108 104 100 84 120 70 Z" />
          <circle cx={30} cy={118} r={22} />
          <path d="M 340 96 C 370 92 392 110 380 128 C 372 142 352 134 350 150 C 348 162 330 160 334 140 C 336 126 318 112 340 96 Z" />
          <circle cx={262} cy={46} r={12} />
        </g>
      </svg>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 1200 }}>
        <div
          style={{
            position: "relative",
            width: 700,
            height: 520,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            scale: interpolate(f, [0, 6, 30, 38], [2.2, 1, 1, 0], {
              ...clamp,
              easing: Easing.out(Easing.back(1.6)),
            }),
            rotate: "-7deg",
          }}
        >
          <Starburst color="#FFD84D" style={{ position: "absolute", width: 700, height: 520 }} />
          <div style={{ position: "relative", fontFamily: displayFont, fontSize: 200, ...candyText(colors.logoRed, colors.white, 16) }}>
            BOUM !
          </div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "white", opacity: lerp(f, [0, 5], [0.95, 0]) }} />
    </>
  );
};
