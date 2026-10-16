import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, displayFont, purpleGradientText, sansFont } from "../theme";

type WordProps = {
  children: string;
  at: number; // local frame the word lands
  out?: number; // local frame the word starts leaving (optional)
  size?: number;
  variant?: "serif" | "sans";
  fill?: "gradient" | "white";
  color?: string;
  style?: React.CSSProperties;
};

// One word of kinetic type: drops in from depth (blur + scale), leaves by blurring away.
export const Word: React.FC<WordProps> = ({
  children,
  at,
  out,
  size = 200,
  variant = "serif",
  color = colors.ink,
  fill = "gradient",
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 15, stiffness: 210 } });
  const leave =
    out === undefined
      ? 0
      : interpolate(frame, [out, out + 6], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.7, 0, 0.84, 0),
        });
  const blurIn = interpolate(frame - at, [0, 6], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const serif = variant === "serif";
  return (
    <div
      style={{
        display: "inline-block",
        fontFamily: serif ? displayFont : sansFont,
        fontStyle: serif ? "italic" : "normal",
        fontWeight: serif ? 900 : 600,
        fontSize: size,
        lineHeight: serif ? 0.92 : 1.1,
        letterSpacing: serif ? -2 : -1,
        whiteSpace: "nowrap",
        color: serif ? undefined : color,
        opacity: interpolate(frame - at, [0, 3], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }) * (1 - leave),
        filter: `blur(${blurIn + leave * 20}px)${serif ? " drop-shadow(0 10px 24px rgba(123,47,247,0.35))" : ""}`,
        scale: String(interpolate(s, [0, 1], [1.6, 1]) * (1 + leave * 0.3)),
        translate: `0px ${interpolate(s, [0, 1], [24, 0]) - leave * 40}px`,
        transformOrigin: "50% 60%",
        ...style,
      }}
    >
      {serif ? (
        <span
          style={{
            display: "inline-block",
            scale: "0.8 1",
            ...(fill === "white" ? { color: "white" } : purpleGradientText),
          }}
        >
          {children}
        </span>
      ) : (
        children
      )}
    </div>
  );
};

// Hand-drawn ellipse that circles a key word (like the "único post" reference).
export const Scribble: React.FC<{
  at: number;
  width: number;
  height: number;
  style?: React.CSSProperties;
  color?: string;
}> = ({ at, width, height, style, color = colors.purple }) => {
  const frame = useCurrentFrame();
  const len = 2 * Math.PI * Math.max(width, height);
  const draw = interpolate(frame - at, [0, 10], [len, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  });
  const w = width / 2;
  const h = height / 2;
  return (
    <svg
      width={width + 40}
      height={height + 40}
      viewBox={`${-w - 20} ${-h - 20} ${width + 40} ${height + 40}`}
      style={{ position: "absolute", overflow: "visible", ...style }}
    >
      <path
        d={`M ${-w * 0.7} ${-h * 0.95} C ${w * 0.4} ${-h * 1.25}, ${w * 1.1} ${-h * 0.6}, ${w} ${0}
            C ${w * 0.95} ${h * 0.9}, ${-w * 0.3} ${h * 1.15}, ${-w * 0.95} ${h * 0.45}
            C ${-w * 1.2} ${-h * 0.2}, ${-w * 0.5} ${-h * 1.05}, ${w * 0.15} ${-h * 1.05}`}
        fill="none"
        stroke={color}
        strokeWidth={9}
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={draw}
        style={{ filter: "drop-shadow(0 0 10px rgba(166,107,255,0.7))" }}
      />
    </svg>
  );
};

// Corner brackets framing an area (editorial look from the reference).
export const Brackets: React.FC<{
  at: number;
  rect: { left: number; top: number; width: number; height: number };
}> = ({ at, rect }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - at, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const arm = 70 * p;
  const pad = interpolate(p, [0, 1], [60, 24]);
  const c = { position: "absolute" as const, width: arm, height: arm, borderColor: colors.ink, opacity: p * 0.7 };
  return (
    <div
      style={{
        position: "absolute",
        left: rect.left - pad,
        top: rect.top - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }}
    >
      <div style={{ ...c, left: 0, top: 0, borderTop: "4px solid", borderLeft: "4px solid" }} />
      <div style={{ ...c, right: 0, top: 0, borderTop: "4px solid", borderRight: "4px solid" }} />
      <div style={{ ...c, left: 0, bottom: 0, borderBottom: "4px solid", borderLeft: "4px solid" }} />
      <div style={{ ...c, right: 0, bottom: 0, borderBottom: "4px solid", borderRight: "4px solid" }} />
    </div>
  );
};

// Small editorial paragraph, as in the corners of the reference.
export const Editorial: React.FC<{ at: number; children: string; style?: React.CSSProperties }> = ({
  at,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        width: 300,
        fontFamily: sansFont,
        fontSize: 20,
        lineHeight: 1.35,
        color: colors.inkSoft,
        opacity: interpolate(frame - at, [0, 8], [0, 0.85], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        ...style,
      }}
    >
      {children}
    </div>
  );
};
