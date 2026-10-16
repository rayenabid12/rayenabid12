import type React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Splash, Stripes } from "../../Bubbles";
import { Logo } from "../../Logo";
import { AnimatedMonster } from "../../rig/AnimatedMonster";
import { type Key, sortKeys } from "../../rig/pose";
import { candyText, colors, displayFont } from "../../theme";
import { alternate, poseAt, rigBox, rigToScreen } from "../kit";

const ANCHOR: [number, number] = [300, 1700];
const WIDTH = 520;
const SCALE = WIDTH / 400;
const POP = 60;

// The pack world. He slides in, waves, blows one last bubble... POP... wink.
export const FINALE_KEYS: Key[] = sortKeys([
  { f: 0, x: -520, rot: 10, turn: 0.4, mouthOpen: 1, armL: 40, armR: 40 },
  { f: 12, x: 0, rot: 0, ease: "out" },
  { f: 13, sy: 0.88, ease: "snap" },
  { f: 17, sy: 1, turn: 0, ease: "out" },
  { f: 19, armR: 112, browY: -10, ease: "snap" },
  ...alternate(21, 33, 6, { armR: 112, curlR: -0.5 }, { armR: 84, curlR: 0.5 }),
  { f: 36, armR: 8, armL: 8, curlR: 0 },
  // last bubble
  { f: 38, browTilt: -12, browY: 4, mouthOpen: 0.3, mouthWidth: 0.28, cheeks: 0.8, sy: 1.05 },
  { f: 58, sy: 1, lookY: 0.5, eyeScale: 1.08 },
  { f: POP, cheeks: 0, eyeScale: 1.3, browY: -20, browTilt: 0, sy: 0.9, lookY: 0, mouthOpen: 0.9, mouthWidth: 1, ease: "snap" },
  { f: POP + 3, eyeScale: 1, sy: 1, ease: "out" },
  // cheeky wink, pointing at the viewer
  { f: POP + 6, rot: 5, bend: 14, turn: 0.25, wink: 1, browY: -4, mouthOpen: 0.35, mouthWidth: 0.75, armR: 70, curlR: 0.35, sy: 1.04, ease: "snap" },
  { f: POP + 11, sy: 1, ease: "out" },
  { f: 90, wink: 1 },
]);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const FinaleScene: React.FC = () => {
  const f = useCurrentFrame();
  const pose = poseAt(FINALE_KEYS, f);
  const mouth = rigToScreen(pose, ANCHOR, SCALE, 200, 300);
  const blowing = f >= 38 && f < POP;
  const bubbleR = blowing ? interpolate(f, [38, POP], [0, 120], { ...clamp, easing: Easing.in(Easing.quad) }) : 0;
  const ring = interpolate(f, [POP, POP + 7], [0, 1], clamp);
  const drop = (at: number) => interpolate(f, [at, at + 12], [900, 0], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  // camera pulls back out of the pack
  const pull = interpolate(f, [0, 16], [1.6, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: pull }}>
        <Stripes a="#2E9E3E" b="#1F7A2E" />
        <Splash style={{ width: 1250, left: -85, top: 60, scale: interpolate(f, [2, 12], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.5)) }) }} />
        <Logo delay={6} fontSize={210} style={{ position: "absolute", top: 230, left: 0, right: 0 }} />
        <Img
          src={staticFile("pack-pasteque-single.webp")}
          style={{ position: "absolute", width: 560, left: 500, top: 1290, rotate: "-9deg", translate: `0px ${drop(8)}px`, filter: "drop-shadow(0 18px 20px rgba(0,0,0,0.3))" }}
        />
        <Img
          src={staticFile("pack-fraise.webp")}
          style={{ position: "absolute", width: 300, left: 700, top: 880, rotate: "10deg", translate: `0px ${drop(12)}px`, filter: "drop-shadow(0 18px 20px rgba(0,0,0,0.3))" }}
        />
        <AnimatedMonster keys={FINALE_KEYS} shadow={false} style={rigBox(ANCHOR, WIDTH)} />
        <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
          {bubbleR > 0 ? (
            <g>
              <circle cx={mouth[0]} cy={mouth[1] + bubbleR * 0.8} r={bubbleR} fill="#F9B3D2" stroke="rgba(255,255,255,0.7)" strokeWidth={5} />
              <ellipse cx={mouth[0] - bubbleR * 0.4} cy={mouth[1] + bubbleR * 0.4} rx={bubbleR * 0.25} ry={bubbleR * 0.12} fill="white" opacity={0.8} />
            </g>
          ) : null}
          {ring > 0 && ring < 1 ? (
            <g>
              <circle cx={mouth[0]} cy={mouth[1] + 90} r={60 + ring * 240} fill="none" stroke="white" strokeWidth={22 * (1 - ring)} />
              {Array.from({ length: 10 }, (_, i) => {
                const a = (i / 10) * Math.PI * 2;
                return <circle key={i} cx={mouth[0] + Math.cos(a) * (80 + ring * 260)} cy={mouth[1] + 90 + Math.sin(a) * (80 + ring * 260)} r={14 * (1 - ring)} fill="#FFD3E6" />;
              })}
            </g>
          ) : null}
        </svg>
      </AbsoluteFill>
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
