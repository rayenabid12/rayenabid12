import type React from "react";
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { Cloud } from "./Props";

export const GROUND_Y = 1520;

const CLOUDS = [
  { x: 60, y: 260, w: 380 },
  { x: 700, y: 120, w: 300 },
  { x: 1300, y: 300, w: 360 },
  { x: 1900, y: 160, w: 320 },
  { x: -40, y: -500, w: 420 },
  { x: 640, y: -900, w: 360 },
  { x: 120, y: -1400, w: 340 },
  { x: 700, y: -1800, w: 420 },
  { x: 200, y: -2300, w: 380 },
];

// Candy world: sky that deepens as the camera rises, parallax clouds and
// watermelon-striped hills. cameraY > 0 moves the camera up, cameraX pans right.
export const World: React.FC<{ readonly cameraX?: number; readonly cameraY?: number }> = ({
  cameraX = 0,
  cameraY = 0,
}) => {
  const frame = useCurrentFrame();
  const top = interpolateColors(cameraY, [0, 1500], ["#FFC9E2", "#9FD6FF"]);
  const bottom = interpolateColors(cameraY, [0, 1500], ["#FFF3E4", "#FFD3EA"]);
  const layer = (parallax: number): React.CSSProperties => ({
    position: "absolute",
    left: 0,
    top: 0,
    width: 3000,
    height: 1920,
    translate: `${-cameraX * parallax}px ${cameraY * parallax}px`,
  });
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`, overflow: "hidden" }}>
      {/* sun glow */}
      <div
        style={{
          position: "absolute",
          right: 80 + cameraX * 0.05,
          top: 220 + cameraY * 0.08,
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "radial-gradient(circle, #FFF6C8 0%, #FFE58A 45%, rgba(255,229,138,0) 72%)",
        }}
      />
      <div style={layer(0.45)}>
        {CLOUDS.map((c, i) => (
          <Cloud
            key={i}
            style={{
              position: "absolute",
              left: c.x + Math.sin((frame + i * 40) / 60) * 20,
              top: c.y,
              width: c.w,
            }}
          />
        ))}
      </div>
      <svg viewBox="0 0 3000 1920" style={{ ...layer(0.75), height: 1920 }}>
        <path
          d={`M 0 ${GROUND_Y - 170} C 300 ${GROUND_Y - 300} 600 ${GROUND_Y - 120} 900 ${GROUND_Y - 220} C 1200 ${GROUND_Y - 320} 1500 ${GROUND_Y - 140} 1800 ${GROUND_Y - 240} C 2100 ${GROUND_Y - 330} 2500 ${GROUND_Y - 150} 3000 ${GROUND_Y - 230} L 3000 1920 L 0 1920 Z`}
          fill="#8ED47F"
        />
      </svg>
      <svg viewBox="0 0 3000 1920" style={{ ...layer(0.75), height: 1920 }}>
        {/* bubble-gum trees on the back hill */}
        {[
          [140, 1290, 1], [420, 1250, 0.8], [980, 1240, 0.9], [1320, 1300, 1.1], [1700, 1250, 0.85], [2100, 1210, 1],
        ].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <rect x={-9} y={-10} width={18} height={130} rx={9} fill="#FFF4E6" />
            <circle cx={-40} cy={-30} r={52} fill="#F78CC0" />
            <circle cx={36} cy={-40} r={58} fill="#F9A6CB" />
            <circle cx={0} cy={-80} r={56} fill="#F78CC0" />
            <circle cx={-18} cy={-96} r={16} fill="white" opacity={0.6} />
          </g>
        ))}
      </svg>
      <svg viewBox="0 0 3000 1920" style={{ ...layer(1), height: 1920 }}>
        <defs>
          <clipPath id="ground">
            <path d={`M 0 ${GROUND_Y} C 500 ${GROUND_Y - 60} 1000 ${GROUND_Y + 40} 1500 ${GROUND_Y - 30} C 2000 ${GROUND_Y - 90} 2500 ${GROUND_Y + 20} 3000 ${GROUND_Y - 40} L 3000 1920 L 0 1920 Z`} />
          </clipPath>
        </defs>
        <g clipPath="url(#ground)">
          <rect x={0} y={GROUND_Y - 120} width={3000} height={600} fill="#2E9E3E" />
          {/* watermelon rind stripes */}
          {Array.from({ length: 26 }, (_, i) => (
            <path
              key={i}
              d={`M ${i * 120 - 40} ${GROUND_Y - 120} C ${i * 120 + 20} ${GROUND_Y + 80} ${i * 120 - 60} ${GROUND_Y + 240} ${i * 120 + 10} 1920 L ${i * 120 + 60} 1920 C ${i * 120 - 10} ${GROUND_Y + 240} ${i * 120 + 70} ${GROUND_Y + 80} ${i * 120 + 10} ${GROUND_Y - 120} Z`}
              fill="#1F7A2E"
              opacity={0.55}
            />
          ))}
          <path
            d={`M 0 ${GROUND_Y} C 500 ${GROUND_Y - 60} 1000 ${GROUND_Y + 40} 1500 ${GROUND_Y - 30} C 2000 ${GROUND_Y - 90} 2500 ${GROUND_Y + 20} 3000 ${GROUND_Y - 40}`}
            stroke="#7FD36B"
            strokeWidth={18}
            fill="none"
          />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// Mouth position (screen y) for a monster of this width standing at feetY.
export const mouthY = (feetY: number, width: number) => feetY - 0.425 * width;

// Screen-space position helpers for placing the mascot by its feet.
export const monsterBox = (x: number, feetY: number, width: number): React.CSSProperties => ({
  position: "absolute",
  width,
  height: width * 1.25,
  left: x - width / 2,
  top: feetY - width * 1.175,
});

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const lerp = (frame: number, input: number[], output: number[]) =>
  interpolate(frame, input, output, clamp);
