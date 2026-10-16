import type React from "react";
import { AbsoluteFill } from "remotion";
import { bodyFont, candyText, colors, displayFont } from "../theme";
import { BoumMonster } from "./BoumMonster";
import { MELO_COOL } from "./meloKeys";
import { DEFAULT_POSE } from "./pose";

// The two friends side by side: size relationship and roles.
export const DuoLineup: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(90deg, #FFF1F7 0%, #FFF1F7 50%, #F1FBEA 50%, #F1FBEA 100%)" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 60, textAlign: "center", fontFamily: displayFont, fontSize: 90, ...candyText(colors.logoRed, colors.white, 8) }}>
      Les Aventures Boum Boum · le duo
    </div>
    {[0, 1].map((i) => (
      <div key={i} style={{ position: "absolute", left: 0, right: 0, top: [905, 245][i], borderTop: "3px dashed #E2B8CE" }} />
    ))}
    <BoumMonster pose={{ ...DEFAULT_POSE, armR: 112, browY: -8 }} style={{ position: "absolute", left: 260, top: 200, width: 600, height: 750 }} />
    <BoumMonster pose={{ ...DEFAULT_POSE, ...MELO_COOL, armL: -10, armR: 40, turn: -0.15 }} skin="melo" style={{ position: "absolute", left: 1060, top: 200, width: 600, height: 750 }} />
    <div style={{ position: "absolute", left: 160, width: 800, top: 935, textAlign: "center" }}>
      <div style={{ fontFamily: displayFont, fontSize: 64, color: colors.logoRed }}>Le monstre Boum Boum</div>
      <div style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 30, color: "#7A2350" }}>L'hôte de la marque · tous les parfums · impulsif et joyeux</div>
    </div>
    <div style={{ position: "absolute", left: 960, width: 800, top: 935, textAlign: "center" }}>
      <div style={{ fontFamily: displayFont, fontSize: 64, color: "#2E9E3E" }}>Mélo</div>
      <div style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 30, color: "#2F5E26" }}>Le copain Pastèque · cool et frimeur</div>
    </div>
  </AbsoluteFill>
);
