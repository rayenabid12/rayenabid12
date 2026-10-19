import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// The same marker font and paper/ink palette as the painted sheets.
export const MARKER = "Permanent Marker";
loadFont({ family: MARKER, url: staticFile("PermanentMarker-Regular.ttf") });

export const PAPER = "#F3EBDC";
export const INK = "#2B2233";
export const CREAM = "#FFF5E2";
