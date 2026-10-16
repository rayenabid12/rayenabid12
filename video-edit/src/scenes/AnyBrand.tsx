import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BrandBg } from "../components/BrandBg";
import { BigWord, SmallCaps } from "../components/Headline";
import { BrollShell } from "../components/Transitions";
import { colors } from "../theme";

// Abstract "logo" badges (no real trademarks) popping in like the reference brand row.
const Badge: React.FC<{ i: number; shape: "circle" | "square" | "tri" | "star" | "ring" }> = ({
  i,
  shape,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 10 - i * 3, fps, config: { damping: 10, stiffness: 200 } });
  const fill = i % 2 === 0 ? colors.purple : colors.ink;
  const glyph = {
    circle: <circle cx={50} cy={50} r={30} fill="white" />,
    square: <rect x={24} y={24} width={52} height={52} rx={10} fill="white" />,
    tri: <polygon points="50,20 82,78 18,78" fill="white" />,
    star: (
      <polygon
        points="50,16 59,40 85,40 64,56 72,82 50,66 28,82 36,56 15,40 41,40"
        fill="white"
      />
    ),
    ring: <circle cx={50} cy={50} r={26} fill="none" stroke="white" strokeWidth={12} />,
  }[shape];
  return (
    <svg
      width={130}
      height={130}
      viewBox="0 0 100 100"
      style={{ scale: String(s), filter: "drop-shadow(0 10px 18px rgba(85,18,194,0.3))" }}
    >
      <circle cx={50} cy={50} r={48} fill={fill} />
      {glyph}
    </svg>
  );
};

export const AnyBrand: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [0, 24], [1200, 0], { extrapolateRight: "clamp" });
  return (
    <BrollShell>
      <BrandBg petals="top-right" />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <path
          d="M -50 1100 Q 540 420 1130 700"
          stroke={colors.inkSoft}
          strokeWidth={2.5}
          fill="none"
          strokeDasharray={1200}
          strokeDashoffset={draw}
          opacity={0.5}
        />
        <path
          d="M 200 -20 Q 900 400 1100 1000"
          stroke={colors.inkSoft}
          strokeWidth={2}
          fill="none"
          strokeDasharray="4 10"
          opacity={0.4}
        />
      </svg>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 10 }}>
        <SmallCaps size={56}>Any</SmallCaps>
        <BigWord delay={3} size={300}>
          BRAND
        </BigWord>
        <div style={{ display: "flex", gap: 26, marginTop: 60 }}>
          <Badge i={0} shape="circle" />
          <Badge i={1} shape="square" />
          <Badge i={2} shape="star" />
          <Badge i={3} shape="tri" />
          <Badge i={4} shape="ring" />
        </div>
      </AbsoluteFill>
    </BrollShell>
  );
};
