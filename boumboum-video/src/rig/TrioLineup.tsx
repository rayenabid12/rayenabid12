import type React from "react";
import { AbsoluteFill } from "remotion";
import { bodyFont, candyText, colors, displayFont } from "../theme";
import { BoumMonster } from "./BoumMonster";
import { MELO_COOL } from "./meloKeys";
import { MYRTILLE_CURIOUS } from "./ModelSheet";
import { DEFAULT_POSE } from "./pose";

// The three friends side by side: Myrtille is about 60 % of their size.
export const TrioLineup: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(90deg, #FFF1F7 0%, #FFF1F7 36%, #F3F1FF 36%, #F3F1FF 64%, #F1FBEA 64%, #F1FBEA 100%)" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 50, textAlign: "center", fontFamily: displayFont, fontSize: 84, ...candyText(colors.logoRed, colors.white, 8) }}>
      Les Aventures Boum Boum · la bande
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 905, borderTop: "3px dashed #E2B8CE" }} />
    <BoumMonster pose={{ ...DEFAULT_POSE, armR: 30, armL: -20, browY: -8, turn: 0.15, lookX: 0.4, lookY: 0.4 }} style={{ position: "absolute", left: 120, top: 200, width: 560, height: 700 }} />
    <BoumMonster pose={{ ...DEFAULT_POSE, ...MYRTILLE_CURIOUS, armL: 60, curlL: -0.3, armR: 8, lookY: -0.3 }} skin="myrtille" style={{ position: "absolute", left: 790, top: 486, width: 340, height: 425 }} />
    <BoumMonster pose={{ ...DEFAULT_POSE, ...MELO_COOL, armL: -10, armR: 40, turn: -0.15, lookX: -0.4, lookY: 0.4 }} skin="melo" style={{ position: "absolute", left: 1240, top: 200, width: 560, height: 700 }} />
    {[
      { x: 0, w: 690, name: "Le monstre Boum Boum", line: "L'hôte de la marque · Fraise · impulsif et joyeux", c: colors.logoRed, c2: "#7A2350" },
      { x: 690, w: 540, name: "Myrtille", line: "La petite Myrtille · curieuse et timide", c: "#5A50C8", c2: "#2A2172" },
      { x: 1230, w: 690, name: "Mélo", line: "Le copain Pastèque · cool et frimeur", c: "#2E9E3E", c2: "#2F5E26" },
    ].map((c) => (
      <div key={c.name} style={{ position: "absolute", left: c.x, width: c.w, top: 935, textAlign: "center" }}>
        <div style={{ fontFamily: displayFont, fontSize: 60, color: c.c }}>{c.name}</div>
        <div style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 26, color: c.c2 }}>{c.line}</div>
      </div>
    ))}
  </AbsoluteFill>
);
