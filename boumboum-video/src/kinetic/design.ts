import { loadFont } from "@remotion/fonts";
import { Easing, staticFile } from "remotion";

// Archivo, instanced to two static cuts so headline sizes can be measured offline.
loadFont({ family: "Archivo Condensed", url: staticFile("fonts/ArchivoCondensed-Black.woff2"), weight: "900" });
loadFont({ family: "Archivo Expanded", url: staticFile("fonts/ArchivoExpanded-SemiBold.woff2"), weight: "600" });

export const DISPLAY = "Archivo Condensed";
export const LABEL = "Archivo Expanded";

// Two colors per scene, drawn from the packaging.
export const K = {
  cream: "#FFF4EC",
  pink: "#F9C6D8",
  red: "#E3123B",
  green: "#0F5C2C",
  crimson: "#C8102E",
};

export const MARGIN = 48;

// Headline sizes that set each word edge-to-edge across 984px (measured from the font).
export const SIZE = {
  CROQUANT: 233,
  FONDANT: 274,
  BOUM_DOT: 410,
  BOUM: 447,
  PASTEQUE_LINE: 600,
  FRAISE_LINE: 702,
  PASTEQUE: 259,
  FRAISE: 388,
};

export const expoOut = Easing.bezier(0.16, 1, 0.3, 1);
export const inOut = Easing.bezier(0.65, 0, 0.35, 1);

export const headline = (size: number, color: string) => ({
  fontFamily: DISPLAY,
  fontWeight: 900,
  fontSize: size,
  lineHeight: 0.8,
  letterSpacing: "-0.02em",
  color,
  whiteSpace: "nowrap" as const,
});
