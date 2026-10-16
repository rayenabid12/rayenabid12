import type React from "react";
import { AbsoluteFill, Easing, interpolate, Loop, Sequence, useCurrentFrame } from "remotion";
import { bodyFont, candyText, colors, displayFont } from "../theme";
import { AnimatedMonster } from "./AnimatedMonster";
import { REACTIONS } from "./reactions";

const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 60% 45%, #FFFFFF 0%, #FFE9F3 55%, #FBCFE3 100%)" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1010, height: 70, background: "#F7D6E6" }} />
    {children}
  </AbsoluteFill>
);

const Label: React.FC<{ index: number; name: string; note: string }> = ({ index, name, note }) => {
  const f = useCurrentFrame();
  const inn = interpolate(f, [0, 10], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: "absolute", left: 110, top: 360, width: 620, opacity: inn, translate: `${(1 - inn) * -40}px 0px` }}>
      <div style={{ fontFamily: displayFont, fontSize: 64, color: "#F2A7C9" }}>{`0${index + 1} / 06`}</div>
      <div style={{ fontFamily: displayFont, fontSize: 120, lineHeight: 1, ...candyText(colors.logoRed, colors.white, 10) }}>{name}</div>
      <div style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 40, color: "#7A2350", marginTop: 20, lineHeight: 1.25 }}>{note}</div>
    </div>
  );
};

// One reaction after another, big and centered, for review.
export const ReactionReel: React.FC = () => {
  let at = 0;
  return (
    <Stage>
      {REACTIONS.map((r, i) => {
        const from = at;
        at += r.duration;
        return (
          <Sequence key={r.id} from={from} durationInFrames={r.duration} name={r.name}>
            <Label index={i} name={r.name} note={r.note} />
            <AnimatedMonster keys={r.keys} style={{ position: "absolute", width: 520, height: 650, left: 1180 - 260, top: 1010 - 611 }} />
          </Sequence>
        );
      })}
    </Stage>
  );
};

export const REEL_DURATION = REACTIONS.reduce((s, r) => s + r.duration, 0);

// All six reactions looping side by side.
export const ReactionGrid: React.FC = () => (
  <AbsoluteFill style={{ background: "#FFF1F7" }}>
    {REACTIONS.map((r, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      return (
        <div key={r.id} style={{ position: "absolute", left: col * 640, top: row * 540, width: 640, height: 540, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 470, height: 70, background: "#F7D6E6" }} />
          <Loop durationInFrames={r.duration}>
            <AnimatedMonster keys={r.keys} style={{ position: "absolute", width: 300, height: 375, left: 170, top: 475 - 352 }} />
          </Loop>
          <div style={{ position: "absolute", left: 24, top: 18, fontFamily: displayFont, fontSize: 42, color: colors.logoRed }}>{r.name}</div>
        </div>
      );
    })}
  </AbsoluteFill>
);
