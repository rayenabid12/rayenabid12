import type React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Splash, Stripes } from "../../Bubbles";
import { Logo } from "../../Logo";
import { candyText, colors, displayFont } from "../../theme";
import { Monster } from "../Monster";
import { clamp, lerp, monsterBox, mouthY } from "../World";

const POP = 60;

// The pack world: green stripes, pink splash, logo, the monster next to the packs.
export const FinaleScene: React.FC = () => {
  const f = useCurrentFrame();
  const blowing = f >= 30 && f < POP;
  const bubbleR = blowing ? interpolate(f, [30, POP], [0, 120], { ...clamp, easing: Easing.in(Easing.quad) }) : 0;
  const ring = lerp(f, [POP, POP + 7], [0, 1]);
  const drop = (at: number) =>
    interpolate(f, [at, at + 12], [900, 0], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const feetY = 1700;
  const mouth = mouthY(feetY, 520);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Stripes a="#2E9E3E" b="#1F7A2E" />
      <Splash
        style={{
          width: 1250,
          left: -85,
          top: 60,
          scale: interpolate(f, [0, 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.5)) }),
        }}
      />
      <Logo delay={4} fontSize={210} style={{ position: "absolute", top: 230, left: 0, right: 0 }} />
      <Img
        src={staticFile("pack-pasteque-single.webp")}
        style={{
          position: "absolute",
          width: 560,
          left: 500,
          top: 1290,
          rotate: "-9deg",
          translate: `0px ${drop(8)}px`,
          filter: "drop-shadow(0 18px 20px rgba(0,0,0,0.3))",
        }}
      />
      <Img
        src={staticFile("pack-fraise.webp")}
        style={{
          position: "absolute",
          width: 300,
          left: 700,
          top: 880,
          rotate: "10deg",
          translate: `0px ${drop(12)}px`,
          filter: "drop-shadow(0 18px 20px rgba(0,0,0,0.3))",
        }}
      />
      <Monster
        brow="happy"
        wink={f >= POP + 4 && f < POP + 26}
        squint={0}
        mouthOpen={blowing ? 0.3 : 0.95}
        mouthWidth={blowing ? 0.28 : 1}
        cheeks={blowing ? 0.7 : 0}
        rightArm={f < 30 ? 125 + Math.sin(f / 2.6) * 24 : f >= POP + 4 ? 45 : 15}
        armCurl={f < 30 ? Math.sin(f / 2.6 - 1.2) * 0.9 : 0}
        leftArm={10}
        tilt={f >= POP + 4 ? 8 : Math.sin(f / 8) * 4}
        lean={interpolate(f, [2, 14], [-14, 0], clamp)}
        impactAt={f >= POP ? POP : 14}
        squash={lerp(f, [26, 30, 34], [1, 1.07, 1]) * lerp(f, [POP, POP + 3, POP + 9], [1, 0.9, 1])}
        shadow={false}
        style={{
          ...monsterBox(300, feetY, 520),
          translate: interpolate(f, [2, 14], ["-700px 0px", "0px 0px"], { ...clamp, easing: Easing.out(Easing.back(1.3)) }),
        }}
      />
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        {bubbleR > 0 ? (
          <g>
            <circle cx={300} cy={mouth + bubbleR * 0.8} r={bubbleR} fill="#F9B3D2" stroke="rgba(255,255,255,0.7)" strokeWidth={5} />
            <ellipse cx={300 - bubbleR * 0.4} cy={mouth + bubbleR * 0.4} rx={bubbleR * 0.25} ry={bubbleR * 0.12} fill="white" opacity={0.8} />
          </g>
        ) : null}
        {ring > 0 && ring < 1 ? (
          <g>
            <circle cx={300} cy={mouth + 90} r={60 + ring * 240} fill="none" stroke="white" strokeWidth={22 * (1 - ring)} />
            {Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * Math.PI * 2;
              return (
                <circle key={i} cx={300 + Math.cos(a) * (80 + ring * 260)} cy={mouth + 90 + Math.sin(a) * (80 + ring * 260)} r={14 * (1 - ring)} fill="#FFD3E6" />
              );
            })}
          </g>
        ) : null}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1740,
          textAlign: "center",
          fontFamily: displayFont,
          fontSize: 130,
          ...candyText(colors.white, colors.logoRed, 14),
          scale: interpolate(f, [POP + 2, POP + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.2)) }),
          rotate: "-3deg",
        }}
      >
        Fais BOUM !
      </div>
    </AbsoluteFill>
  );
};
