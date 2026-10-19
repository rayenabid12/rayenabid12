// The family, in their seating order at the table. accent = the colour of their top in the painted sheets.
export const CAST = {
  girl: { name: "Girl", accent: "#5E6FB8" },
  boy: { name: "Boy", accent: "#B47DBB" },
  mom: { name: "Mom", accent: "#9478BE" },
  dad: { name: "Dad", accent: "#3A9C98" },
  grandma: { name: "Grandma", accent: "#CF94BA" },
  grandpa: { name: "Grandpa", accent: "#5B3A90" },
} as const;
export type Who = keyof typeof CAST;

// Must match EMO_LIST, EMO_T0 and EMO_DUR in family-character-sheets/src/scenes/family_anim.js.
export const EMOTIONS = ["neutral", "happy", "laugh", "surprised", "scared", "sad", "cry", "angry", "love", "thinking", "idea", "excited", "proud", "sleepy"];
export const EMO_T0 = 0.3;
export const EMO_DUR = 1.3;
