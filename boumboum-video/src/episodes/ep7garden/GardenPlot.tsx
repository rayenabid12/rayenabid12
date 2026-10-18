import type React from "react";
import { displayFont } from "../../theme";

// Mélo's vegetable plot, in WORLD coordinates (ground at y = 1500).
export const GROUND = 1500;
export const PLOT_X = 930;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
// colours are "#rrggbb" or the "rgb(r,g,b)" this returns, so mixes can be chained
const rgb = (c: string) => (c.startsWith("#") ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) : c.slice(4, -1).split(",").map(Number));
const mix = (a: string, b: string, t: number) => {
  const pa = rgb(a);
  const pb = rgb(b);
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * clamp01(t))).join(",")})`;
};

export type SkyState = { day: number; storm: number; grey: number; gold: number; sunAngle: number };

// Sky in screen space: day/night, storm, overcast morning, golden afternoon; a sun and a moon on arcs.
export const GardenSky: React.FC<{ s: SkyState }> = ({ s }) => {
  let top = mix("#0E1440", "#5EC8F2", s.day);
  let bottom = mix("#2A2F6E", "#DDF6FF", s.day);
  if (s.storm > 0) {
    top = mix(top, "#1A1E36", s.storm);
    bottom = mix(bottom, "#3A4060", s.storm);
  }
  if (s.grey > 0) {
    top = mix(top, "#8E9AB0", s.grey);
    bottom = mix(bottom, "#C9D0DC", s.grey);
  }
  if (s.gold > 0) {
    top = mix(top, "#FFB27A", s.gold);
    bottom = mix(bottom, "#FFE6B0", s.gold);
  }
  const sx = 540 + Math.cos(s.sunAngle) * 460;
  const sy = 980 - Math.sin(s.sunAngle) * 760;
  const mx = 540 - Math.cos(s.sunAngle) * 460;
  const my = 980 + Math.sin(s.sunAngle) * 760;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)` }} />
      {Array.from({ length: 40 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: (i * 211) % 1080, top: (i * 97) % 1000, width: 4, height: 4, borderRadius: 2, background: "white", opacity: (1 - s.day) * (1 - s.storm) * (1 - s.grey) * 0.8 }} />
      ))}
      <div style={{ position: "absolute", left: sx - 90, top: sy - 90, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, #FFF6B8 0%, #FFD23F 70%)", boxShadow: "0 0 100px 40px rgba(255,220,120,0.5)", opacity: (1 - s.storm) * (1 - s.grey) }} />
      <div style={{ position: "absolute", left: mx - 70, top: my - 70, width: 140, height: 140, borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, #FFFBE6, #E9DFB2)", boxShadow: "0 0 60px 20px rgba(255,245,200,0.3)", opacity: (1 - s.storm) * (1 - s.grey) }} />
    </>
  );
};

// Hills, fence, shed, the plot and a little chalk sign that counts the days.
export const GardenSet: React.FC<{ dark: number; dayCount: number }> = ({ dark, dayCount }) => (
  <svg viewBox="-1000 -1500 3400 4000" style={{ position: "absolute", left: -1000, top: -1500, width: 3400, height: 4000, overflow: "visible" }}>
    <path d={`M -1000 ${GROUND - 300} Q -400 ${GROUND - 480} 200 ${GROUND - 330} Q 900 ${GROUND - 170} 1500 ${GROUND - 380} Q 2000 ${GROUND - 520} 2400 ${GROUND - 300} L 2400 ${GROUND} L -1000 ${GROUND} Z`} fill={mix("#8BD86A", "#24405A", dark)} />
    {/* shed */}
    <rect x={-560} y={GROUND - 460} width={420} height={460} fill={mix("#C98E5C", "#3A3050", dark)} />
    <path d={`M -600 ${GROUND - 440} L -350 ${GROUND - 640} L -100 ${GROUND - 440} Z`} fill={mix("#B8578C", "#3A2448", dark)} />
    <rect x={-420} y={GROUND - 280} width={140} height={280} rx={10} fill={mix("#8C5A3A", "#2A2238", dark)} />
    {/* fence */}
    {Array.from({ length: 34 }, (_, i) => (
      <rect key={i} x={-100 + i * 70} y={GROUND - 150} width={22} height={150} rx={10} fill={mix("#FFF7EE", "#5A5A80", dark)} />
    ))}
    <rect x={-100} y={GROUND - 110} width={2400} height={12} fill={mix("#FFF7EE", "#5A5A80", dark)} />
    {/* ground + the plot */}
    <rect x={-1000} y={GROUND - 10} width={3400} height={1200} fill={mix("#7ACB5F", "#22403A", dark)} />
    <ellipse cx={PLOT_X} cy={GROUND + 20} rx={560} ry={70} fill={mix("#8A5A3A", "#3A2A2A", dark)} />
    <ellipse cx={PLOT_X} cy={GROUND + 10} rx={520} ry={52} fill={mix("#A26C46", "#4A3434", dark)} />
    {/* the day counter */}
    <g transform={`translate(${PLOT_X} ${GROUND - 640})`}>
      <rect x={-8} y={60} width={16} height={580} fill={mix("#9A6A45", "#3A2A2A", dark)} />
      <rect x={-110} y={-20} width={220} height={100} rx={14} fill="#2F4A3A" stroke="#B9834F" strokeWidth={10} />
      <text x={0} y={46} textAnchor="middle" fontFamily={displayFont} fontSize={48} fill="#FDFDF5">
        Jour {dayCount}
      </text>
    </g>
  </svg>
);

// A watermelon (world coordinates, centre x,y, radius r). `open` 0..1 splits it in two halves.
export const Watermelon: React.FC<{ x: number; y: number; r: number; crack?: number; open?: number }> = ({ x, y, r, crack = 0, open = 0 }) => {
  if (r <= 1) return null;
  const half = (side: number) => (
    <g transform={`translate(${side * open * r * 0.7} 0) rotate(${side * open * 18})`}>
      <clipPath id={`half${side}${Math.round(x)}`}>
        <rect x={side < 0 ? -r * 1.3 : 0} y={-r} width={r * 1.3} height={r * 2} />
      </clipPath>
      <g clipPath={`url(#half${side}${Math.round(x)})`}>
        <ellipse rx={r * 1.25} ry={r} fill="#3E8E2E" />
        {[-0.8, -0.4, 0, 0.4, 0.8].map((k) => (
          <path key={k} d={`M ${k * r * 1.25} ${-r} Q ${k * r * 1.25 + r * 0.15} 0 ${k * r * 1.25} ${r}`} stroke="#2A6A20" strokeWidth={r * 0.12} fill="none" />
        ))}
        <ellipse cx={-r * 0.4} cy={-r * 0.5} rx={r * 0.3} ry={r * 0.12} fill="white" opacity={0.25} />
      </g>
      {open > 0 ? (
        <g>
          <ellipse cx={0} cy={0} rx={r * 0.18} ry={r * 0.98} fill="#9BE07E" />
          <ellipse cx={0} cy={0} rx={r * 0.13} ry={r * 0.9} fill="#FF4F6F" />
          {[-0.5, -0.2, 0.15, 0.45].map((k) => (
            <ellipse key={k} cx={side * r * 0.03} cy={k * r} rx={r * 0.025} ry={r * 0.05} fill="#2B1A12" />
          ))}
        </g>
      ) : null}
    </g>
  );
  return (
    <svg style={{ position: "absolute", left: x - r * 2.2, top: y - r * 1.6, width: r * 4.4, height: r * 3.2, overflow: "visible" }} viewBox={`${-r * 2.2} ${-r * 1.6} ${r * 4.4} ${r * 3.2}`}>
      <ellipse cx={0} cy={r * 0.95} rx={r * 1.2} ry={r * 0.12} fill="black" opacity={0.15} />
      {open > 0 ? (
        <>
          {half(-1)}
          {half(1)}
        </>
      ) : (
        <>
          <ellipse rx={r * 1.25} ry={r} fill="#3E8E2E" />
          {[-0.8, -0.4, 0, 0.4, 0.8].map((k) => (
            <path key={k} d={`M ${k * r * 1.25} ${-r} Q ${k * r * 1.25 + r * 0.15} 0 ${k * r * 1.25} ${r}`} stroke="#2A6A20" strokeWidth={r * 0.12} fill="none" />
          ))}
          <ellipse cx={-r * 0.4} cy={-r * 0.5} rx={r * 0.3} ry={r * 0.12} fill="white" opacity={0.3} />
          {crack > 0 ? (
            <>
              <path d={`M ${-r * 0.2} ${-r} L ${r * 0.05} ${-r * 0.4} L ${-r * 0.1} ${0} L ${r * 0.15} ${r * 0.5}`} stroke="#FF4F6F" strokeWidth={r * 0.14 * crack} fill="none" strokeLinejoin="round" />
              <path d={`M ${-r * 0.2} ${-r} L ${r * 0.05} ${-r * 0.4} L ${-r * 0.1} ${0} L ${r * 0.15} ${r * 0.5}`} stroke="#2B1A12" strokeWidth={3} fill="none" />
            </>
          ) : null}
        </>
      )}
    </svg>
  );
};

// The plant: g 0..1 growth; broken bends it to the ground; flower 0..1; sway in degrees.
export const Plant: React.FC<{ x: number; g: number; broken?: number; flower?: number; sway?: number; scale?: number }> = ({ x, g, broken = 0, flower = 0, sway = 0, scale = 1 }) => {
  if (g <= 0) return null;
  const h = 360 * g * scale;
  const bend = broken * 70;
  return (
    <svg viewBox="-400 -500 800 520" style={{ position: "absolute", left: x - 400, top: GROUND - 500, width: 800, height: 520, overflow: "visible" }}>
      <g transform={`rotate(${sway + bend} 0 0)`}>
        <path d={`M 0 10 C ${-20 * scale} ${-h * 0.3} ${30 * scale} ${-h * 0.6} ${8 * scale} ${-h}`} stroke={broken > 0.5 ? "#7A9A4A" : "#3E9A3A"} strokeWidth={10 * Math.max(0.5, scale)} fill="none" strokeLinecap="round" />
        {[0.25, 0.45, 0.65, 0.85].map((k, i) =>
          g > k * 0.9 ? (
            <g key={k} transform={`translate(${(i % 2 ? 10 : -6) * scale} ${-h * k}) rotate(${i % 2 ? 30 : -30}) scale(${Math.min(1, (g - k * 0.9) * 4) * scale})`}>
              <path d={`M 0 0 C ${i % 2 ? 40 : -40} -30 ${i % 2 ? 90 : -90} -10 ${i % 2 ? 100 : -100} 10 C ${i % 2 ? 70 : -70} 30 ${i % 2 ? 30 : -30} 20 0 0 Z`} fill={broken > 0.5 ? "#8AAA5A" : "#5CC35A"} />
            </g>
          ) : null,
        )}
        {g < 0.2 ? (
          <g transform={`translate(${8 * scale} ${-h})`}>
            <path d="M 0 0 C -30 -20 -50 -10 -50 6 C -30 10 -10 6 0 0 Z" fill="#7BD06A" />
            <path d="M 0 0 C 30 -20 50 -10 50 6 C 30 10 10 6 0 0 Z" fill="#7BD06A" />
          </g>
        ) : null}
        {flower > 0 ? (
          <g transform={`translate(${8 * scale} ${-h}) scale(${flower * scale})`}>
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx={Math.cos((a * Math.PI) / 180) * 18} cy={Math.sin((a * Math.PI) / 180) * 18} rx={16} ry={10} fill="#FFE066" transform={`rotate(${a} ${Math.cos((a * Math.PI) / 180) * 18} ${Math.sin((a * Math.PI) / 180) * 18})`} />
            ))}
            <circle r={10} fill="#FF9A3C" />
          </g>
        ) : null}
      </g>
    </svg>
  );
};

// A watering can (screen-oriented, world position = the hand). `tilt` 0..1 pours.
export const WateringCan: React.FC<{ x: number; y: number; tilt: number; dir: number; f: number }> = ({ x, y, tilt, dir, f }) => (
  <svg style={{ position: "absolute", left: x - 120, top: y - 120, width: 240, height: 240, overflow: "visible" }} viewBox="-120 -120 240 240">
    <g transform={`scale(${dir} 1) rotate(${tilt * 35})`}>
      <rect x={-50} y={-30} width={90} height={70} rx={14} fill="#5EC8F2" stroke="#2A7AA0" strokeWidth={5} />
      <path d="M -40 -30 Q -5 -70 30 -30" stroke="#2A7AA0" strokeWidth={8} fill="none" />
      <path d="M 40 20 L 100 -20 L 108 -10 L 46 34 Z" fill="#5EC8F2" stroke="#2A7AA0" strokeWidth={4} />
      <circle cx={104} cy={-16} r={10} fill="#2A7AA0" />
    </g>
    {tilt > 0.6
      ? Array.from({ length: 6 }, (_, i) => {
          const t = ((f + i * 3) % 12) / 12;
          return <circle key={i} cx={dir * (95 + t * 30 + (i % 3) * 6)} cy={10 + t * 120} r={5} fill="#7FD4FF" opacity={1 - t} />;
        })
      : null}
  </svg>
);

// A slice of watermelon (rig coordinates, held in front of the belly).
export const SliceShape: React.FC = () => (
  <g>
    <path d="M -70 0 A 70 70 0 0 0 70 0 Z" fill="#3E8E2E" />
    <path d="M -62 0 A 62 62 0 0 0 62 0 Z" fill="#B5E86A" />
    <path d="M -56 0 A 56 56 0 0 0 56 0 Z" fill="#FF4F6F" />
    {[-30, -12, 8, 26].map((x, i) => (
      <ellipse key={x} cx={x} cy={14 + (i % 2) * 14} rx={3} ry={6} fill="#2B1A12" />
    ))}
  </g>
);
