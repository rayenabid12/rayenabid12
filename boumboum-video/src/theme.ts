import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Fonts are bundled in public/fonts so renders work offline.
loadFont({ family: "Lilita One", url: staticFile("fonts/LilitaOne.woff2"), weight: "400" });
loadFont({ family: "Fredoka", url: staticFile("fonts/Fredoka.woff2"), weight: "300 700" });
loadFont({ family: "Lobster", url: staticFile("fonts/Lobster.woff2"), weight: "400" });

export const displayFont = "Lilita One";
export const bodyFont = "Fredoka";
export const scriptFont = "Lobster";

export const colors = {
  bubblePink: "#F7B6CF",
  hotPink: "#F06AA8",
  logoRed: "#E3123B",
  green: "#2E9E3E",
  greenDark: "#1F7A2E",
  strawberry: "#E01F3D",
  strawberryDark: "#B5122C",
  white: "#FFFFFF",
};

// Bold candy-style text: white outline + soft drop shadow, like the packaging.
export const candyText = (fill: string, outline = colors.white, size = 10) => ({
  color: fill,
  WebkitTextStroke: `${size}px ${outline}`,
  paintOrder: "stroke fill" as const,
  textShadow: "0 12px 0 rgba(0,0,0,0.18)",
});
