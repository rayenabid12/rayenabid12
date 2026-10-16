import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme";

// Lavender gradient + technical grid + purple petals, as in the reference.
export const BrandBg: React.FC<{ petals?: "bottom-left" | "top-right" | "none" }> = ({
  petals = "bottom-left",
}) => {
  const frame = useCurrentFrame();
  const step = 90;
  const lines = [];
  for (let x = 0; x <= 1080; x += step) {
    lines.push(<line key={`v${x}`} x1={x} y1={0} x2={x} y2={1920} />);
  }
  for (let y = 0; y <= 1920; y += step) {
    lines.push(<line key={`h${y}`} x1={0} y1={y} x2={1080} y2={y} />);
  }
  const rot = interpolate(frame, [0, 120], [0, 18]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${colors.lavenderLight} 0%, ${colors.lavender} 60%, ${colors.lavenderDeep} 100%)`,
      }}
    >
      <svg
        width={1080}
        height={1920}
        style={{
          position: "absolute",
          opacity: 0.45,
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 55% at 50% 45%, black 30%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse 70% 55% at 50% 45%, black 30%, transparent 100%)",
        }}
      >
        <g stroke={colors.grid} strokeWidth={1.5} strokeDasharray="6 8">
          {lines}
        </g>
      </svg>
      {petals !== "none" ? (
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            left: petals === "bottom-left" ? -200 : undefined,
            right: petals === "top-right" ? -190 : undefined,
            bottom: petals === "bottom-left" ? -160 : undefined,
            top: petals === "top-right" ? -170 : undefined,
            rotate: `${rot}deg`,
          }}
        >
          {[0, 72, 144, 216, 288].map((a) => (
            <div
              key={a}
              style={{
                position: "absolute",
                left: 210,
                top: 0,
                width: 100,
                height: 260,
                borderRadius: "50% 50% 50% 50% / 70% 70% 30% 30%",
                background: `linear-gradient(180deg, ${colors.purpleLight}, ${colors.purpleDeep})`,
                transformOrigin: "50px 260px",
                rotate: `${a}deg`,
                opacity: 0.92,
              }}
            />
          ))}
        </div>
      ) : null}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 40%, rgba(255,255,255,0.55), transparent 70%)",
        }}
      />
    </AbsoluteFill>
  );
};
