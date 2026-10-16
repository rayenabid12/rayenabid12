import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BrandBg } from "../components/BrandBg";
import { BigWord, SmallCaps } from "../components/Headline";
import { colors } from "../theme";

// The talking head shrinks into a rounded card; a rising bar chart and
// "MARKET RESEARCH" fill the lower half.
export const MarketSplit: React.FC<{ children: React.ReactNode; textDelay?: number }> = ({
  children,
  textDelay = 18,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame, [textDelay - 8, textDelay + 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.83, 0, 0.17, 1),
  });
  const bars = [0.35, 0.55, 0.45, 0.75, 1];
  return (
    <AbsoluteFill>
      <BrandBg petals="bottom-left" />
      <AbsoluteFill
        style={{
          transformOrigin: "50% 0%",
          scale: String(interpolate(p, [0, 1], [1, 0.56])),
          translate: `0px ${interpolate(p, [0, 1], [0, 120])}px`,
          borderRadius: interpolate(p, [0, 1], [0, 70]),
          overflow: "hidden",
          boxShadow: `0 40px 90px rgba(85,18,194,${interpolate(p, [0, 1], [0, 0.35])})`,
          outline: `${interpolate(p, [0, 1], [0, 10])}px solid white`,
        }}
      >
        {children}
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 1250, alignItems: "center", opacity: p }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 22, height: 170 }}>
          {bars.map((b, i) => {
            const s = spring({
              frame: frame - textDelay - i * 2,
              fps,
              config: { damping: 13, stiffness: 160 },
            });
            return (
              <div
                key={i}
                style={{
                  width: 70,
                  height: 170 * b * s,
                  borderRadius: "16px 16px 6px 6px",
                  background:
                    i === bars.length - 1
                      ? `linear-gradient(180deg, ${colors.purpleLight}, ${colors.purpleDeep})`
                      : "rgba(123,47,247,0.28)",
                }}
              />
            );
          })}
        </div>
        <BigWord delay={textDelay + 2} size={210} style={{ marginTop: 20 }}>
          MARKET
        </BigWord>
        <SmallCaps delay={textDelay + 8} size={52} color={colors.inkSoft}>
          research — go big
        </SmallCaps>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
