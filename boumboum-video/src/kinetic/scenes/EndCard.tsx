import type React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { headline, K, MARGIN, SIZE } from "../design";
import { Labels } from "../Labels";
import { Reveal, wipeUp } from "../Reveal";

// End card: BOUM / BOUM with both packs held between the lines.
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 75], [1, 1.04], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: K.cream }}>
      <Reveal at={0} duration={9} style={{ position: "absolute", top: 150, left: MARGIN }}>
        <div style={headline(SIZE.BOUM, K.red)}>BOUM</div>
      </Reveal>
      <Img
        src={staticFile("packs-pasteque.webp")}
        style={{
          position: "absolute",
          left: 40,
          top: 610,
          width: 640,
          height: 640,
          objectFit: "contain",
          clipPath: wipeUp(frame, 8, 12),
          scale: drift,
          rotate: "-6deg",
        }}
      />
      <Img
        src={staticFile("pack-fraise.webp")}
        style={{
          position: "absolute",
          left: 640,
          top: 560,
          width: 380,
          height: 720,
          objectFit: "contain",
          clipPath: wipeUp(frame, 11, 12),
          scale: drift,
          rotate: "7deg",
        }}
      />
      <Reveal at={4} duration={9} style={{ position: "absolute", top: 1330, left: MARGIN }}>
        <div style={headline(SIZE.BOUM, K.red)}>BOUM</div>
      </Reveal>
      <Labels color={K.red} tl="Ballon" tr="Bubble gum fourré" bl="Pastèque · Fraise" br="Colorants naturels" />
    </AbsoluteFill>
  );
};
