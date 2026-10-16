import type React from "react";
import { AbsoluteFill } from "remotion";
import { bodyFont, candyText, colors, displayFont } from "../theme";
import { BoumMonster, PALETTE } from "./BoumMonster";
import { DEFAULT_POSE, type Pose } from "./pose";

const pose = (over: Partial<Pose>): Pose => ({ ...DEFAULT_POSE, ...over });

const TURNAROUND: { label: string; p: Partial<Pose> }[] = [
  { label: "FACE", p: {} },
  { label: "3/4", p: { turn: 0.5 } },
  { label: "PROFIL", p: { turn: 1, mouthOpen: 0.7 } },
  { label: "DOS", p: { back: 1 } },
];

const EXPRESSIONS: { label: string; p: Partial<Pose> }[] = [
  { label: "Joyeux", p: { browY: -6 } },
  { label: "Rire", p: { squint: 1, mouthOpen: 1, browY: -10 } },
  { label: "Miam", p: { squint: 1, mouthOpen: 0, mouthWidth: 0.6, cheeks: 1 } },
  { label: "Surpris", p: { eyeScale: 1.25, pupil: 0.6, browY: -22, mouthOpen: 0.9, mouthWidth: 0.45 } },
  { label: "Inquiet", p: { browTilt: 18, browY: -4, eyeScale: 1.1, mouthOpen: 0.3, mouthWidth: 0.5, smile: -0.6, lookX: 0.5 } },
  { label: "Déterminé", p: { browTilt: -16, browY: 6, mouthOpen: 0, mouthWidth: 0.6, smile: 0.5 } },
  { label: "Clin d'œil", p: { wink: 1, mouthOpen: 0.6, browY: -4 } },
  { label: "Triste", p: { browTilt: 20, smile: -1, mouthOpen: 0, mouthWidth: 0.6, lookY: 0.5 } },
];

const MOUTHS: { label: string; p: Partial<Pose> }[] = [
  { label: "Sourire", p: { mouthOpen: 0, mouthWidth: 0.7 } },
  { label: "Grand sourire", p: { mouthOpen: 1 } },
  { label: "« O »", p: { mouthOpen: 0.9, mouthWidth: 0.45 } },
  { label: "Souffle", p: { mouthOpen: 0.3, mouthWidth: 0.28 } },
  { label: "Mâche", p: { mouthOpen: 0.14, mouthWidth: 0.55 } },
  { label: "Langue", p: { mouthOpen: 0.55, mouthWidth: 0.7, tongue: 1, tongueX: 0.4 } },
  { label: "Moue", p: { mouthOpen: 0, mouthWidth: 0.5, smile: -1 } },
];

const SWATCHES: [string, string][] = [
  ["Corps clair", PALETTE.bodyLight],
  ["Corps", PALETTE.body],
  ["Corps ombre", PALETTE.bodyMid],
  ["Ombre profonde", PALETTE.bodyShadow],
  ["Joues", PALETTE.cheek],
  ["Taches", PALETTE.speckle],
  ["Iris", PALETTE.iris],
  ["Iris foncé", PALETTE.irisDark],
  ["Trait", PALETTE.ink],
  ["Bouche", PALETTE.mouth],
  ["Langue", PALETTE.tongue],
  ["Logo rouge", colors.logoRed],
];

const label: React.CSSProperties = { fontFamily: bodyFont, fontWeight: 700, color: "#7A2350" };
const heading: React.CSSProperties = { fontFamily: displayFont, fontSize: 64, color: colors.logoRed, marginBottom: 20 };

// A window onto part of the 400x500 rig (for head and mouth close-ups).
const Crop: React.FC<{ p: Partial<Pose>; x: number; y: number; w: number; h: number; size: number }> = ({ p, x, y, w, h, size }) => {
  const scale = size / w;
  return (
    <div style={{ width: size, height: h * scale, overflow: "hidden", position: "relative", borderRadius: 24, background: "#FFF7FB" }}>
      <BoumMonster
        pose={pose(p)}
        shadow={false}
        style={{ position: "absolute", width: 400 * scale, height: 500 * scale, left: -x * scale, top: -y * scale }}
      />
    </div>
  );
};

export const ModelSheet: React.FC = () => (
  <AbsoluteFill style={{ background: "#FFF1F7", padding: 80, display: "block" }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 40 }}>
      <div style={{ fontFamily: displayFont, fontSize: 130, ...candyText(colors.logoRed, colors.white, 10) }}>Le monstre Boum Boum</div>
      <div style={{ ...label, fontSize: 48 }}>Model sheet · v2</div>
    </div>
    <div style={{ ...label, fontSize: 44, fontWeight: 600, marginTop: 6 }}>
      Personnalité : joyeux, gourmand, curieux… et un peu trop ambitieux avec les bulles.
    </div>

    {/* turnaround */}
    <div style={{ position: "absolute", left: 80, top: 330, width: 2700, height: 900 }}>
      <div style={heading}>Turnaround</div>
      {[
        [58, "haut"],
        [190, "yeux"],
        [292, "bouche"],
        [470, "pieds"],
      ].map(([y, name]) => (
        <div key={name as string} style={{ position: "absolute", left: 0, right: 0, top: 100 + (y as number) * 1.5, borderTop: "3px dashed #F2A7C9" }}>
          <span style={{ ...label, fontSize: 28, position: "absolute", left: 0, top: -40 }}>{name}</span>
        </div>
      ))}
      {TURNAROUND.map((v, i) => (
        <div key={v.label} style={{ position: "absolute", left: 180 + i * 640, top: 100, width: 600, textAlign: "center" }}>
          <BoumMonster pose={pose(v.p)} style={{ width: 600, height: 750 }} />
          <div style={{ ...label, fontSize: 44 }}>{v.label}</div>
        </div>
      ))}
    </div>

    {/* palette + notes */}
    <div style={{ position: "absolute", left: 2880, top: 330, width: 880 }}>
      <div style={heading}>Couleurs</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {SWATCHES.map(([name, hex]) => (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 90, height: 90, borderRadius: 20, background: hex, boxShadow: "0 4px 10px rgba(0,0,0,0.12)" }} />
            <div>
              <div style={{ ...label, fontSize: 30 }}>{name}</div>
              <div style={{ ...label, fontSize: 28, fontWeight: 600, opacity: 0.7 }}>{hex}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ ...heading, marginTop: 50 }}>Règles</div>
      {[
        "Silhouette en goutte de chewing-gum : 4 jambes gluantes, 2 oreilles en éclaboussure.",
        "Pas de contour noir : volume par dégradé rose, reflet en haut à gauche.",
        "Yeux à ~40 % de la hauteur ; la bouche s'ouvre jusqu'à la moitié du corps.",
        "Matière gélatineuse : tout ce qui bouge rebondit, déborde puis se stabilise.",
      ].map((t) => (
        <div key={t} style={{ ...label, fontSize: 32, fontWeight: 600, marginBottom: 14, lineHeight: 1.3 }}>
          • {t}
        </div>
      ))}
    </div>

    {/* expressions */}
    <div style={{ position: "absolute", left: 80, top: 1290, width: 2300 }}>
      <div style={heading}>Expressions</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 28 }}>
        {EXPRESSIONS.map((e) => (
          <div key={e.label} style={{ textAlign: "center" }}>
            <Crop p={e.p} x={30} y={60} w={340} h={300} size={540} />
            <div style={{ ...label, fontSize: 36, marginTop: 6 }}>{e.label}</div>
          </div>
        ))}
      </div>
    </div>

    {/* mouth chart */}
    <div style={{ position: "absolute", left: 2480, top: 1760, width: 1280 }}>
      <div style={heading}>Bouches</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 22 }}>
        {MOUTHS.map((m) => (
          <div key={m.label} style={{ textAlign: "center" }}>
            <Crop p={m.p} x={90} y={250} w={220} h={180} size={300} />
            <div style={{ ...label, fontSize: 28, marginTop: 4 }}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  </AbsoluteFill>
);
