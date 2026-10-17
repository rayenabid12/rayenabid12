import type React from "react";
import { displayFont } from "../../theme";
import { GROUND } from "../ep3/ParkSet";

// The Boum-o-mètre: a fairground "high striker" for bubbles, in the Ep. 3 park (WORLD coordinates).
// A horn listens to the BOUM; the louder it is, the higher the puck flies. Ring the bell = MÉGA BOUM.
export const METER_X = 700;
export const METER_TOP = 300; // the bell
export const PUCK_REST = 1255;
export const LEVELS = [
  { y: 1130, label: "pff…", color: "#9AA0B4" },
  { y: 930, label: "pop", color: "#7BCB4A" },
  { y: 700, label: "BOUM", color: "#FF9A3C" },
  { y: 460, label: "MÉGA BOUM", color: "#E3123B" },
];

export const BoumOMeter: React.FC<{ puck: number; ring: number; f: number }> = ({ puck, ring, f }) => {
  const shake = ring > 0 ? Math.sin(f * 2.2) * 8 * ring : 0;
  return (
    <svg viewBox="-800 -1200 6400 4200" style={{ position: "absolute", left: -800, top: -1200, width: 6400, height: 4200, overflow: "visible" }}>
      {/* pole + scale */}
      <rect x={METER_X - 40} y={METER_TOP + 60} width={80} height={GROUND - METER_TOP - 240} rx={20} fill="#FFF3F8" stroke="#B8578C" strokeWidth={8} />
      {LEVELS.map((l, i) => (
        <g key={l.label}>
          <rect x={METER_X - 32} y={l.y - 6} width={64} height={12} rx={6} fill={l.color} />
          <rect x={METER_X + 60} y={l.y - 34} width={l.label.length * 30 + 40} height={68} rx={34} fill={l.color} />
          <text x={METER_X + 80 + (l.label.length * 30) / 2} y={l.y + 16} textAnchor="middle" fontFamily={displayFont} fontSize={i === 3 ? 44 : 48} fill="white">
            {l.label}
          </text>
        </g>
      ))}
      {/* stripes on the pole */}
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={METER_X - 34} y={METER_TOP + 90 + i * 64} width={68} height={22} fill="#F9C9DD" opacity={0.6} />
      ))}
      {/* the bell */}
      <g transform={`rotate(${shake} ${METER_X} ${METER_TOP - 40})`}>
        <path d={`M ${METER_X - 70} ${METER_TOP + 50} C ${METER_X - 70} ${METER_TOP - 60} ${METER_X + 70} ${METER_TOP - 60} ${METER_X + 70} ${METER_TOP + 50} Z`} fill="#FFD84D" stroke="#C99A1A" strokeWidth={8} />
        <circle cx={METER_X} cy={METER_TOP + 60} r={16} fill="#C99A1A" />
        <ellipse cx={METER_X - 28} cy={METER_TOP - 6} rx={14} ry={26} fill="white" opacity={0.6} />
      </g>
      {ring > 0
        ? [-1, 1].map((sd) => (
            <g key={sd} opacity={ring}>
              {[0, 1, 2].map((k) => (
                <path key={k} d={`M ${METER_X + sd * (100 + k * 34)} ${METER_TOP - 60 + k * 20} q ${sd * 30} 40 0 80`} stroke="#FFD84D" strokeWidth={10} fill="none" strokeLinecap="round" />
              ))}
            </g>
          ))
        : null}
      {/* the puck */}
      <g transform={`translate(${METER_X} ${puck})`}>
        <rect x={-58} y={-26} width={116} height={52} rx={26} fill="#E3123B" stroke="#8C0A26" strokeWidth={6} />
        <ellipse cx={-22} cy={-10} rx={18} ry={7} fill="white" opacity={0.6} />
      </g>
      {/* base with the listening horn */}
      <rect x={METER_X - 110} y={GROUND - 200} width={220} height={200} rx={26} fill="#C77DFF" />
      <rect x={METER_X - 120} y={GROUND - 210} width={240} height={36} rx={18} fill="#A855F7" />
      <text x={METER_X} y={GROUND - 80} textAnchor="middle" fontFamily={displayFont} fontSize={40} fill="white">BOUM-O</text>
      <text x={METER_X} y={GROUND - 36} textAnchor="middle" fontFamily={displayFont} fontSize={40} fill="white">MÈTRE</text>
      <path d={`M ${METER_X + 100} ${GROUND - 150} L ${METER_X + 170} ${GROUND - 190} L ${METER_X + 170} ${GROUND - 70} L ${METER_X + 100} ${GROUND - 110} Z`} fill="#FFD84D" stroke="#C99A1A" strokeWidth={6} />
      <ellipse cx={METER_X + 170} cy={GROUND - 130} rx={18} ry={60} fill="#C99A1A" />
      {/* bunting */}
      <path d={`M ${METER_X - 500} ${METER_TOP + 260} Q ${METER_X - 250} ${METER_TOP + 360} ${METER_X - 40} ${METER_TOP + 240}`} stroke="#8C3B67" strokeWidth={4} fill="none" />
      <path d={`M ${METER_X + 40} ${METER_TOP + 240} Q ${METER_X + 300} ${METER_TOP + 360} ${METER_X + 620} ${METER_TOP + 260}`} stroke="#8C3B67" strokeWidth={4} fill="none" />
      {Array.from({ length: 12 }, (_, i) => {
        const left = i < 6;
        const t = (i % 6) / 5;
        const x = left ? METER_X - 480 + t * 420 : METER_X + 70 + t * 520;
        const y = METER_TOP + 260 + Math.sin(t * Math.PI) * 80;
        return <path key={i} d={`M ${x - 22} ${y} L ${x + 22} ${y} L ${x} ${y + 44} Z`} fill={["#F06AA8", "#7BCB4A", "#FFD84D", "#C77DFF"][i % 4]} />;
      })}
    </svg>
  );
};

// A big bush drawn IN FRONT of the characters (Mélo hides behind it).
export const BushFront: React.FC<{ x: number; w: number; shake?: number }> = ({ x, w, shake = 0 }) => (
  <svg viewBox="-800 -1200 6400 4200" style={{ position: "absolute", left: -800, top: -1200, width: 6400, height: 4200, overflow: "visible" }}>
    <g transform={`translate(${shake} 0)`}>
      <ellipse cx={x} cy={GROUND - 20} rx={w / 2} ry={w * 0.3} fill="#4CAF50" />
      <ellipse cx={x - w * 0.24} cy={GROUND - 50} rx={w * 0.3} ry={w * 0.27} fill="#5DBB4A" />
      <ellipse cx={x + w * 0.22} cy={GROUND - 60} rx={w * 0.3} ry={w * 0.26} fill="#6EC85A" />
      <ellipse cx={x} cy={GROUND - 90} rx={w * 0.26} ry={w * 0.24} fill="#7BD06A" />
      {[-0.3, 0.05, 0.32].map((k) => (
        <circle key={k} cx={x + k * w} cy={GROUND - 70 - Math.abs(k) * 40} r={12} fill="#FF6F91" />
      ))}
    </g>
  </svg>
);
