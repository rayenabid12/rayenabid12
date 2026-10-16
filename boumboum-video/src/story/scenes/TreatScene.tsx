import type React from "react";
import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { candyText, colors, displayFont } from "../../theme";
import { Monster } from "../Monster";
import { clamp, ease, lerp, monsterBox, World } from "../World";

const SIZE = 1000;
const FEET = 1900;

// Close-up: he licks the filling off his cheek, spots the kids... and shares a pack.
export const TreatScene: React.FC = () => {
  const f = useCurrentFrame();
  const lick = lerp(f, [8, 24], [0, 1]);
  const licking = f >= 8 && f < 26;
  const offer = interpolate(f, [36, 58], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const dropsGone = f >= 19;

  return (
    <>
      <div style={{ position: "absolute", inset: 0, scale: 1.5, transformOrigin: "50% 100%" }}>
        <World cameraX={900} />
      </div>
      <Monster
        brow={f < 8 ? "surprised" : "happy"}
        lookX={f < 8 ? 0.6 : licking ? 0.5 : 0}
        lookY={f < 8 ? 0.5 : licking ? 0.3 : 0}
        squint={ease(f, [24, 27, 31, 34], [0, 1, 1, 0])}
        mouthOpen={licking ? 0.5 : 0.9}
        mouthWidth={licking ? 0.7 : 1}
        tongue={licking ? Math.sin(lick * Math.PI) : 0}
        tongueX={-0.4 + lick * 1.4}
        cheeks={ease(f, [24, 28, 32, 36], [0, 0.6, 0.6, 0])}
        tilt={f < 34 ? (licking ? 6 : 0) : ease(f, [34, 40], [0, 9])}
        leftArm={ease(f, [30, 36], [8, -40])}
        rightArm={ease(f, [30, 36], [8, -40])}
        impactAt={34}
        shadow={false}
        style={{ ...monsterBox(540, FEET, SIZE) }}
      />
      {/* filling smudges on his cheek, licked away */}
      {!dropsGone ? (
        <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
          <ellipse cx={742} cy={1452} rx={22} ry={28} fill="#D3123F" />
          <ellipse cx={736} cy={1442} rx={7} ry={5} fill="white" opacity={0.7} />
          <circle cx={724} cy={1512} r={12} fill="#D3123F" />
        </svg>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 330,
          textAlign: "center",
          fontFamily: displayFont,
          fontSize: 190,
          ...candyText(colors.logoRed, colors.white, 15),
          scale: interpolate(f, [34, 42], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.4)) }),
          rotate: `${-5 + Math.sin(f / 5) * 2}deg`,
        }}
      >
        À toi !
      </div>
      {f >= 34 ? (
        <Img
          src={staticFile("pack-pasteque-single.webp")}
          style={{
            position: "absolute",
            width: 520,
            left: 540 - 260,
            top: 1420 - offer * 480,
            scale: interpolate(f, [34, 40], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) }) * (1 + offer * 3.2),
            rotate: `${-6 + offer * 6}deg`,
            filter: "drop-shadow(0 20px 24px rgba(0,0,0,0.3))",
          }}
        />
      ) : null}
    </>
  );
};
