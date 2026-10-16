import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { BrandBg } from "../components/BrandBg";
import { BigWord, SmallCaps } from "../components/Headline";
import { BrollShell } from "../components/Transitions";
import { colors } from "../theme";

// Hero B-roll: "BRAND RESEARCH" with a heartbeat line and a magnifier sweeping across.
export const BrandResearch: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = interpolate(frame, [2, 20], [1400, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  });
  const lensX = interpolate(frame, [4, 34], [-120, 680], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.45, 0, 0.2, 1),
  });
  return (
    <BrollShell>
      <BrandBg petals="bottom-left" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <SmallCaps size={58} style={{ marginBottom: 30 }}>
          This is the
        </SmallCaps>
        <svg width={1080} height={200} viewBox="0 0 1080 200">
          <path
            d="M 0 100 L 330 100 L 370 100 L 395 30 L 425 170 L 455 60 L 480 120 L 505 100 L 640 100 L 665 50 L 690 150 L 715 100 L 1080 100"
            fill="none"
            stroke={colors.purple}
            strokeWidth={6}
            strokeLinejoin="round"
            strokeDasharray={1400}
            strokeDashoffset={pulse}
            style={{ filter: "drop-shadow(0 0 12px rgba(166,107,255,0.9))" }}
          />
        </svg>
        <BigWord delay={4} size={230}>
          BRAND
        </BigWord>
        <BigWord delay={8} size={230}>
          RESEARCH
        </BigWord>
      </AbsoluteFill>
      <svg
        width={260}
        height={260}
        viewBox="0 0 100 100"
        style={{
          position: "absolute",
          left: lensX,
          top: 1180,
          rotate: `${interpolate(frame, [4, 34], [-20, 10], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}deg`,
          filter: "drop-shadow(0 14px 22px rgba(42,31,61,0.35))",
        }}
      >
        <circle cx={40} cy={40} r={26} fill="rgba(255,255,255,0.35)" stroke={colors.ink} strokeWidth={7} />
        <line x1={60} y1={60} x2={88} y2={88} stroke={colors.ink} strokeWidth={11} strokeLinecap="round" />
      </svg>
    </BrollShell>
  );
};
