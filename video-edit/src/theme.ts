import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Condensed high-contrast italic serif for headlines (matches the reference look),
// clean sans for supporting text. Bundled in public/fonts (SIL OFL).
export const displayFont = "Playfair Display";
export const sansFont = "Inter";

for (const weight of ["800", "900"]) {
  loadFont({
    family: displayFont,
    url: staticFile(`fonts/playfair-display-latin-${weight}-italic.woff2`),
    weight,
    style: "italic",
  });
}
for (const weight of ["500", "600", "700"]) {
  loadFont({
    family: sansFont,
    url: staticFile(`fonts/inter-latin-${weight}-normal.woff2`),
    weight,
  });
}

export const colors = {
  purple: "#7B2FF7",
  purpleDeep: "#5512C2",
  purpleLight: "#A66BFF",
  lavender: "#EADCFD",
  lavenderLight: "#F7F1FF",
  lavenderDeep: "#D6BEFA",
  grid: "#B89DEB",
  ink: "#2A1F3D",
  inkSoft: "#5E5373",
};

export const purpleGradientText: React.CSSProperties = {
  backgroundImage: `linear-gradient(180deg, ${colors.purpleLight} 0%, ${colors.purple} 45%, ${colors.purpleDeep} 100%)`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};
