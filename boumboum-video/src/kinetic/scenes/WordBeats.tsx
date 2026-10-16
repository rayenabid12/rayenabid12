import type React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { headline, K, MARGIN, SIZE } from "../design";
import { Labels } from "../Labels";
import { Reveal } from "../Reveal";

const WORDS = [
  { text: "CROQUANT.", bg: K.pink, fg: K.red, size: SIZE.CROQUANT },
  { text: "FONDANT.", bg: K.green, fg: K.pink, size: SIZE.FONDANT },
  { text: "BOUM.", bg: K.red, fg: K.cream, size: SIZE.BOUM_DOT },
];

// Three words, one per beat, hard cuts between two-color cards.
export const WordBeats: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(Math.floor(frame / 15), WORDS.length - 1);
  const w = WORDS[i];
  return (
    <AbsoluteFill style={{ backgroundColor: w.bg, justifyContent: "center" }}>
      <Reveal key={i} at={i * 15} duration={7} style={{ marginLeft: MARGIN }}>
        <div style={headline(w.size, w.fg)}>{w.text}</div>
      </Reveal>
      <Labels color={w.fg} tl="Ballon" tr="Boum Boum" bl="Bubble gum fourré" br={`0${i + 1} / 03`} />
    </AbsoluteFill>
  );
};
