import type React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Pumpkin } from "./Halloween";

// The Halloween street, laid out in WORLD coordinates (ground at y = 1500),
// wide enough for a camera to travel through it. The sky is drawn separately.
export const GROUND = 1500;

export const NightSky: React.FC<{ readonly cy: number }> = ({ cy }) => {
  const f = useCurrentFrame();
  const drift = (cy - 1150) * 0.2;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #1E0F42 0%, #3A1D66 55%, #7A3F8F 100%)" }}>
      {Array.from({ length: 46 }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: (i * 263) % 1080,
            top: ((i * 151) % 1500) - drift,
            width: 4 + (i % 3) * 2,
            height: 4 + (i % 3) * 2,
            borderRadius: "50%",
            background: "#FFF7D6",
            opacity: 0.35 + 0.65 * Math.abs(Math.sin((f + i * 13) / 14)),
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: 690,
          top: 260 - drift,
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "radial-gradient(circle, #FFFBEA 0%, #FFF0B8 38%, rgba(255,240,184,0.25) 50%, rgba(255,240,184,0) 72%)",
        }}
      />
    </AbsoluteFill>
  );
};

export const NightGround: React.FC = () => (
  <>
    <svg viewBox="-800 0 3600 2600" style={{ position: "absolute", left: -800, top: 0, width: 3600, height: 2600, overflow: "visible" }}>
      {/* back hills */}
      <path d={`M -800 ${GROUND - 200} C -400 ${GROUND - 330} 0 ${GROUND - 160} 400 ${GROUND - 250} C 800 ${GROUND - 340} 1200 ${GROUND - 170} 1600 ${GROUND - 260} C 2000 ${GROUND - 340} 2400 ${GROUND - 180} 2800 ${GROUND - 240} L 2800 2600 L -800 2600 Z`} fill="#36604A" />
      {/* gum trees */}
      {[
        [-260, GROUND - 200, 1], [40, GROUND - 230, 0.8], [700, GROUND - 260, 0.9], [1700, GROUND - 230, 1.05], [2100, GROUND - 210, 0.9],
      ].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <rect x={-9} y={-10} width={18} height={130} rx={9} fill="#E9D8F2" />
          <circle cx={-40} cy={-30} r={52} fill="#C25A95" />
          <circle cx={36} cy={-40} r={58} fill="#D774AC" />
          <circle cx={0} cy={-80} r={56} fill="#C25A95" />
          <circle cx={-18} cy={-96} r={16} fill="white" opacity={0.4} />
        </g>
      ))}
      {/* ground with watermelon-rind stripes */}
      <rect x={-800} y={GROUND - 20} width={3600} height={1200} fill="#1F5E35" />
      {Array.from({ length: 32 }, (_, i) => (
        <path
          key={i}
          d={`M ${-800 + i * 120 - 40} ${GROUND - 20} C ${-800 + i * 120 + 20} ${GROUND + 180} ${-800 + i * 120 - 60} ${GROUND + 400} ${-800 + i * 120 + 10} ${GROUND + 1100} L ${-800 + i * 120 + 60} ${GROUND + 1100} C ${-800 + i * 120 - 10} ${GROUND + 400} ${-800 + i * 120 + 70} ${GROUND + 180} ${-800 + i * 120 + 10} ${GROUND - 20} Z`}
          fill="#143F24"
          opacity={0.55}
        />
      ))}
      <path d={`M -800 ${GROUND - 14} L 2800 ${GROUND - 14}`} stroke="#4F9A5E" strokeWidth={16} />
    </svg>
    <Pumpkin style={{ position: "absolute", left: -120, top: GROUND - 260, width: 120 }} />
    <Pumpkin style={{ position: "absolute", left: 1560, top: GROUND - 110, width: 130 }} />
  </>
);
