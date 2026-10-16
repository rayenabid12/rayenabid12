import type React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Logo } from "../../Logo";
import { colors } from "../../theme";
import { Mascot } from "../Mascot";
import { raysBackground, shake } from "../util";

const SHARDS = Array.from({ length: 18 }, (_, i) => ({
  angle: (i / 18) * Math.PI * 2 + (i % 3) * 0.2,
  dist: 650 + (i % 5) * 160,
  size: 50 + ((i * 37) % 70),
  spin: ((i % 2) * 2 - 1) * (90 + i * 13),
  color: [colors.bubblePink, colors.hotPink, "#FFFFFF"][i % 3],
}));

// The pop: flash, gum shards everywhere, logo slams in, mascot says hi.
export const BoumScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const burst = interpolate(frame, [0, 22], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 42%, ${colors.bubblePink} 0%, ${colors.hotPink} 70%)`,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill style={{ translate: shake(frame, 0, 20, 34) }}>
        <AbsoluteFill
          style={{
            inset: -600,
            background: raysBackground("rgba(255,255,255,0.22)"),
            rotate: `${frame * 0.6}deg`,
            opacity: interpolate(frame, [0, 6], [0, 1], clamp),
          }}
        />
        {SHARDS.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 540 - s.size / 2,
              top: 860 - s.size / 2,
              width: s.size,
              height: s.size * 0.7,
              borderRadius: "48% 52% 40% 60% / 55% 45% 55% 45%",
              backgroundColor: s.color,
              translate: `${Math.cos(s.angle) * s.dist * burst}px ${Math.sin(s.angle) * s.dist * burst}px`,
              rotate: `${s.spin * burst}deg`,
              scale: interpolate(frame, [0, 4, 40], [0.3, 1, 0.6], clamp),
            }}
          />
        ))}
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: 380,
            scale: interpolate(frame, [2, 12], [2.6, 1], {
              ...clamp,
              easing: Easing.spring({ damping: 10 }),
              output: "perceptual-scale",
            }),
            opacity: interpolate(frame, [2, 4], [0, 1], clamp),
          }}
        >
          <Logo delay={-2 * fps} fontSize={250} />
        </AbsoluteFill>
        <Mascot
          eyesOpen={1}
          mouthOpen={0.8}
          armWave={Math.sin(frame / 3) * 25}
          lookY={-0.3}
          style={{
            position: "absolute",
            width: 520,
            left: 280,
            top: 1330,
            translate: interpolate(frame, [18, 30], ["0px 700px", "0px 0px"], {
              ...clamp,
              easing: Easing.spring({ damping: 11 }),
            }),
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          backgroundColor: "white",
          opacity: interpolate(frame, [0, 6], [1, 0], clamp),
        }}
      />
    </AbsoluteFill>
  );
};
