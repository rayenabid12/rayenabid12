import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BrandBg } from "../components/BrandBg";
import { BigWord, SmallCaps } from "../components/Headline";
import { BrollShell } from "../components/Transitions";
import { colors, sansFont } from "../theme";

const Row: React.FC<{ i: number; label: string }> = ({ i, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = 12 + i * 6;
  const tick = spring({ frame: frame - start, fps, config: { damping: 10, stiffness: 250 } });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 26, marginBottom: 34 }}>
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: 16,
          border: `4px solid ${colors.purple}`,
          background: frame >= start ? colors.purple : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 40,
          fontWeight: 800,
          fontFamily: sansFont,
        }}
      >
        <span style={{ scale: String(tick) }}>✓</span>
      </div>
      <div
        style={{
          fontFamily: sansFont,
          fontSize: 44,
          fontWeight: 600,
          color: colors.ink,
          opacity: interpolate(frame - start + 4, [0, 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          translate: `${interpolate(frame - start + 4, [0, 6], [-30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px 0px`,
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const TheBrief: React.FC = () => {
  const frame = useCurrentFrame();
  const card = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  return (
    <BrollShell>
      <BrandBg petals="top-right" />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 260 }}>
        <SmallCaps size={52}>Take the</SmallCaps>
        <BigWord delay={2} size={260}>
          BRIEF
        </BigWord>
        <div
          style={{
            marginTop: 70,
            width: 760,
            borderRadius: 40,
            background: "rgba(255,255,255,0.92)",
            boxShadow: "0 40px 80px rgba(85,18,194,0.25)",
            overflow: "hidden",
            translate: `0px ${interpolate(card, [0, 1], [500, 0])}px`,
            rotate: `${interpolate(card, [0, 1], [8, -2])}deg`,
          }}
        >
          <div
            style={{
              background: `linear-gradient(90deg, ${colors.purpleDeep}, ${colors.purpleLight})`,
              color: "white",
              fontFamily: sansFont,
              fontWeight: 700,
              fontSize: 36,
              letterSpacing: 6,
              padding: "26px 44px",
            }}
          >
            CLIENT BRIEF
          </div>
          <div style={{ padding: "50px 44px 20px" }}>
            <Row i={0} label="Goals & vision" />
            <Row i={1} label="Target audience" />
            <Row i={2} label="Budget & timeline" />
          </div>
        </div>
      </AbsoluteFill>
    </BrollShell>
  );
};
