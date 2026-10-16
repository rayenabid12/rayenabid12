import type React from "react";
import { AbsoluteFill } from "remotion";
import { bodyFont, candyText, colors, displayFont } from "../theme";
import { BoumMonster, MELO_PALETTE, PALETTE, type Skin } from "./BoumMonster";
import { MELO_COOL } from "./meloKeys";
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
const Crop: React.FC<{ p: Partial<Pose>; x: number; y: number; w: number; h: number; size: number; skin?: Skin; bg?: string }> = ({ p, x, y, w, h, size, skin, bg = "#FFF7FB" }) => {
  const scale = size / w;
  return (
    <div style={{ width: size, height: h * scale, overflow: "hidden", position: "relative", borderRadius: 24, background: bg }}>
      <BoumMonster
        pose={pose(p)}
        skin={skin}
        shadow={false}
        style={{ position: "absolute", width: 400 * scale, height: 500 * scale, left: -x * scale, top: -y * scale }}
      />
    </div>
  );
};

type SheetProps = {
  skin: Skin;
  name: string;
  version: string;
  personality: string;
  turnaround: { label: string; p: Partial<Pose> }[];
  expressions: { label: string; p: Partial<Pose> }[];
  mouths: { label: string; p: Partial<Pose> }[];
  swatches: [string, string][];
  rules: string[];
  guides: [number, string][];
  bg: string;
  accent: string;
  ink: string;
  guide: string;
  card: string;
};

export const CharacterSheet: React.FC<SheetProps> = ({ skin, name, version, personality, turnaround, expressions, mouths, swatches, rules, guides, bg, accent, ink, guide, card }) => {
  const txt: React.CSSProperties = { ...label, color: ink };
  const head: React.CSSProperties = { ...heading, color: accent };
  return (
    <AbsoluteFill style={{ background: bg, padding: 80, display: "block" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 40 }}>
        <div style={{ fontFamily: displayFont, fontSize: 130, ...candyText(accent, colors.white, 10) }}>{name}</div>
        <div style={{ ...txt, fontSize: 48 }}>{version}</div>
      </div>
      <div style={{ ...txt, fontSize: 44, fontWeight: 600, marginTop: 6 }}>{personality}</div>

      {/* turnaround */}
      <div style={{ position: "absolute", left: 80, top: 330, width: 2700, height: 900 }}>
        <div style={head}>Turnaround</div>
        {guides.map(([y, g]) => (
          <div key={g} style={{ position: "absolute", left: 0, right: 0, top: 100 + y * 1.5, borderTop: `3px dashed ${guide}` }}>
            <span style={{ ...txt, fontSize: 28, position: "absolute", left: 0, top: -40 }}>{g}</span>
          </div>
        ))}
        {turnaround.map((v, i) => (
          <div key={v.label} style={{ position: "absolute", left: 180 + i * 640, top: 100, width: 600, textAlign: "center" }}>
            <BoumMonster pose={pose(v.p)} skin={skin} style={{ width: 600, height: 750 }} />
            <div style={{ ...txt, fontSize: 44 }}>{v.label}</div>
          </div>
        ))}
      </div>

      {/* palette + notes */}
      <div style={{ position: "absolute", left: 2880, top: 330, width: 880 }}>
        <div style={head}>Couleurs</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
          {swatches.map(([sw, hex]) => (
            <div key={sw} style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ width: 90, height: 90, borderRadius: 20, background: hex, boxShadow: "0 4px 10px rgba(0,0,0,0.12)" }} />
              <div>
                <div style={{ ...txt, fontSize: 30 }}>{sw}</div>
                <div style={{ ...txt, fontSize: 28, fontWeight: 600, opacity: 0.7 }}>{hex}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ ...head, marginTop: 50 }}>Règles</div>
        {rules.map((t) => (
          <div key={t} style={{ ...txt, fontSize: 32, fontWeight: 600, marginBottom: 14, lineHeight: 1.3 }}>
            • {t}
          </div>
        ))}
      </div>

      {/* expressions */}
      <div style={{ position: "absolute", left: 80, top: 1290, width: 2300 }}>
        <div style={head}>Expressions</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 28 }}>
          {expressions.map((e) => (
            <div key={e.label} style={{ textAlign: "center" }}>
              <Crop p={e.p} skin={skin} bg={card} x={30} y={60} w={340} h={300} size={540} />
              <div style={{ ...txt, fontSize: 36, marginTop: 6 }}>{e.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* mouth chart */}
      <div style={{ position: "absolute", left: 2480, top: 1760, width: 1280 }}>
        <div style={head}>Bouches</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 22 }}>
          {mouths.map((m) => (
            <div key={m.label} style={{ textAlign: "center" }}>
              <Crop p={m.p} skin={skin} bg={card} x={90} y={250} w={220} h={180} size={300} />
              <div style={{ ...txt, fontSize: 28, marginTop: 4 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ModelSheet: React.FC = () => (
  <CharacterSheet
    skin="pink"
    name="Le monstre Boum Boum"
    version="Model sheet · v2"
    personality="Personnalité : joyeux, gourmand, curieux… et un peu trop ambitieux avec les bulles."
    turnaround={TURNAROUND}
    expressions={EXPRESSIONS}
    mouths={MOUTHS}
    swatches={SWATCHES}
    rules={[
      "Silhouette en goutte de chewing-gum : 4 jambes gluantes, 2 oreilles en éclaboussure.",
      "Pas de contour noir : volume par dégradé rose, reflet en haut à gauche.",
      "Yeux à ~40 % de la hauteur ; la bouche s'ouvre jusqu'à la moitié du corps.",
      "Matière gélatineuse : tout ce qui bouge rebondit, déborde puis se stabilise.",
    ]}
    guides={[[58, "haut"], [190, "yeux"], [292, "bouche"], [470, "pieds"]]}
    bg="#FFF1F7"
    accent={colors.logoRed}
    ink="#7A2350"
    guide="#F2A7C9"
    card="#FFF7FB"
  />
);


export const MeloSheet: React.FC = () => (
  <CharacterSheet
    skin="melo"
    name="Mélo"
    version="Model sheet · v1 · le copain Pastèque"
    personality="Personnalité : cool, calme, « frais comme une pastèque »… et un peu frimeur avec ses bulles parfaites."
    turnaround={[
      { label: "FACE", p: MELO_COOL },
      { label: "3/4", p: { ...MELO_COOL, turn: 0.5 } },
      { label: "PROFIL", p: { ...MELO_COOL, turn: 1 } },
      { label: "DOS", p: { back: 1 } },
    ]}
    expressions={[
      { label: "Cool (défaut)", p: MELO_COOL },
      { label: "Rire", p: { squint: 1, mouthOpen: 1, browY: -10 } },
      { label: "Miam", p: { squint: 1, mouthOpen: 0, mouthWidth: 0.6, cheeks: 1 } },
      { label: "Surpris", p: { eyeScale: 1.3, pupil: 0.6, browY: -22, mouthOpen: 0.9, mouthWidth: 0.45 } },
      { label: "Frimeur", p: { blink: 0.35, browTilt: -10, browY: 4, mouthOpen: 0, mouthWidth: 0.7, smile: 0.6, lookX: 0.4 } },
      { label: "Défi", p: { browTilt: -16, browY: 6, mouthOpen: 0.3, mouthWidth: 0.8, lookX: -0.3 } },
      { label: "Clin d'œil", p: { ...MELO_COOL, wink: 1, mouthOpen: 0.6 } },
      { label: "Vexé", p: { blink: 0.3, browTilt: 14, smile: -0.8, mouthOpen: 0, mouthWidth: 0.5, lookX: -0.5 } },
    ]}
    mouths={[
      { label: "Demi-sourire", p: { mouthOpen: 0.2, mouthWidth: 0.72, smile: 0.4 } },
      { label: "Grand sourire", p: { mouthOpen: 1 } },
      { label: "« O »", p: { mouthOpen: 0.9, mouthWidth: 0.45 } },
      { label: "Souffle", p: { mouthOpen: 0.3, mouthWidth: 0.28 } },
      { label: "Mâche", p: { mouthOpen: 0.14, mouthWidth: 0.55 } },
      { label: "Langue", p: { mouthOpen: 0.55, mouthWidth: 0.7, tongue: 1, tongueX: 0.4 } },
      { label: "Moue", p: { mouthOpen: 0, mouthWidth: 0.5, smile: -1 } },
    ]}
    swatches={[
      ["Corps clair", MELO_PALETTE.bodyLight],
      ["Corps", MELO_PALETTE.body],
      ["Corps ombre", MELO_PALETTE.bodyMid],
      ["Ombre profonde", MELO_PALETTE.bodyShadow],
      ["Rayures", MELO_PALETTE.stripe ?? "#2E7D32"],
      ["Pépins", MELO_PALETTE.speckle],
      ["Joues pastèque", MELO_PALETTE.cheek],
      ["Iris", MELO_PALETTE.iris],
      ["Iris foncé", MELO_PALETTE.irisDark],
      ["Trait", MELO_PALETTE.ink],
      ["Bouche", MELO_PALETTE.mouth],
      ["Langue", MELO_PALETTE.tongue],
    ]}
    rules={[
      "Plus rond et plus large que le monstre rose : une petite pastèque sur 4 jambes courtes.",
      "Rayures d'écorce vert foncé, pépins en taches de rousseur, tige + feuille sur la tête.",
      "Visage par défaut : paupières mi-closes, demi-sourire. Il ne perd son calme que pour les grandes surprises.",
      "Il bouge moins mais plus précis : gestes courts, poses assurées, bulles parfaitement rondes.",
    ]}
    guides={[[60, "tige"], [206, "yeux"], [304, "bouche"], [470, "pieds"]]}
    bg="#F1FBEA"
    accent="#2E9E3E"
    ink="#1D4A26"
    guide="#9ED68A"
    card="#F8FFF2"
  />
);
