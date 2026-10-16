import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, displayFont, purpleGradientText, sansFont } from "../theme";

// Big condensed italic word that slams in with blur → sharp, like the reference.
export const BigWord: React.FC<{
  children: string;
  delay?: number;
  size?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, size = 210, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 180 } });
  return (
    <div
      style={{
        fontFamily: displayFont,
        fontWeight: 900,
        fontStyle: "italic",
        fontSize: size,
        lineHeight: 0.95,
        letterSpacing: -2,
        textAlign: "center",
        whiteSpace: "nowrap",
        opacity: interpolate(frame - delay, [0, 4], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        filter: `blur(${interpolate(frame - delay, [0, 7], [18, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })}px) drop-shadow(0 10px 28px rgba(123,47,247,0.35))`,
        scale: String(interpolate(s, [0, 1], [1.35, 1])),
        translate: `0px ${interpolate(s, [0, 1], [30, 0])}px`,
        ...style,
      }}
    >
      {/* Horizontally condense the serif to get the tall, narrow display look */}
      <span style={{ display: "inline-block", scale: "0.8 1", ...purpleGradientText }}>
        {children}
      </span>
    </div>
  );
};

// Small uppercase sans line that types/fades in letter by letter.
export const SmallCaps: React.FC<{
  children: string;
  delay?: number;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, size = 46, color = colors.ink, style }) => {
  const frame = useCurrentFrame();
  const chars = children.split("");
  return (
    <div
      style={{
        fontFamily: sansFont,
        fontWeight: 500,
        fontSize: size,
        letterSpacing: 4,
        textTransform: "uppercase",
        textAlign: "center",
        color,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {chars.map((c, i) => (
        <span
          key={i}
          style={{
            opacity: interpolate(frame - delay - i * 0.6, [0, 3], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            filter: `blur(${interpolate(frame - delay - i * 0.6, [0, 4], [6, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}px)`,
          }}
        >
          {c}
        </span>
      ))}
    </div>
  );
};

export const Pill: React.FC<{ children: string; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 220 } });
  return (
    <div
      style={{
        display: "inline-block",
        padding: "14px 34px",
        borderRadius: 999,
        background: `linear-gradient(90deg, ${colors.purple}, ${colors.purpleLight})`,
        color: "white",
        fontFamily: sansFont,
        fontWeight: 700,
        fontSize: 40,
        letterSpacing: 6,
        boxShadow: "0 12px 30px rgba(123,47,247,0.45)",
        scale: String(s),
      }}
    >
      {children}
    </div>
  );
};
