import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BrandBg } from "../components/BrandBg";
import { BigWord, SmallCaps } from "../components/Headline";
import { Flash } from "../components/Transitions";
import { colors } from "../theme";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <BrandBg petals="top-right" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <BigWord delay={2} size={320}>
          SAVE
        </BigWord>
        <SmallCaps delay={8} size={50} color={colors.inkSoft}>
          & follow for step 02
        </SmallCaps>
        <div
          style={{
            marginTop: 50,
            fontSize: 90,
            color: colors.purple,
            translate: `0px ${interpolate(frame % 20, [0, 10, 20], [0, 18, 0])}px`,
            opacity: interpolate(frame, [12, 18], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          ↓
        </div>
      </AbsoluteFill>
      <Flash />
    </AbsoluteFill>
  );
};
