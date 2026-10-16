import type React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Interactive,
  interpolate,
  Sequence,
  useCurrentFrame,
  type InteractivitySchema,
} from "remotion";
import { bodyFont, candyText, colors, displayFont } from "../../theme";
import { Goo } from "../Goo";
import { Mascot } from "../Mascot";
import { shake } from "../util";

type BiteProps = {
  readonly flavor: string;
  readonly subtitle: string;
  readonly bg: string;
  readonly bgLight: string;
  readonly titleOutline: string;
  readonly gooColor: string;
  readonly gooLight: string;
  readonly heroSrc: string;
  readonly packSrc: string;
  readonly mascotSide: "left" | "right";
  readonly biteFrame: number;
};

// Mascot lunges, CHOMP, the filling erupts in slow motion, the flavor slams in.
const BiteInner: React.FC<BiteProps> = ({
  flavor,
  subtitle,
  bg,
  bgLight,
  titleOutline,
  gooColor,
  gooLight,
  heroSrc,
  packSrc,
  mascotSide,
  biteFrame: b,
}) => {
  const frame = useCurrentFrame();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const left = mascotSide === "left";
  const dir = left ? 1 : -1;

  // hero + goo + mascot layout per side
  const hero = left
    ? { left: 80, top: 600, width: 920, height: 740 }
    : { left: 330, top: 520, width: 520, height: 880 };
  const gooAt = left ? { x: 236, y: 1130 } : { x: 790, y: 1150 };
  const mascotRest = left ? { left: 70, top: 1330 } : { left: 590, top: 1330 };
  const pack = left
    ? { left: 560, top: 1350, width: 480, height: 460 }
    : { left: 40, top: 1420, width: 540, height: 400 };

  const enter = interpolate(frame, [b - 42, b - 28], [1, 0], {
    ...clamp,
    easing: Easing.spring({ damping: 12 }),
  });
  const lean = interpolate(frame, [b - 20, b - 8], [0, 1], clamp); // anticipation
  const lunge = interpolate(frame, [b - 6, b, b + 10, b + 24], [0, 1, 1, 0], {
    ...clamp,
    easing: Easing.bezier(0.5, 0, 0.2, 1),
  });
  const chomp = frame >= b && frame < b + 6;
  const happy = frame > b + 24;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 50%, ${bgLight} 0%, ${bg} 70%)`,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          translate: shake(frame, b, 14, 26),
          // slow camera push-in for the whole scene
          scale: interpolate(frame, [0, 130], [1, 1.08], clamp),
        }}
      >
        <Img
          name="Hero"
          src={heroSrc}
          style={{
            position: "absolute",
            ...hero,
            objectFit: "contain",
            filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.35))",
            scale: interpolate(frame, [0, 10, b, b + 4, b + 12], [0.6, 1, 1, 0.92, 1], {
              ...clamp,
              easing: Easing.out(Easing.back(2)),
            }),
          }}
        />
        <Sequence from={b} layout="none" name="Filling splash">
          <Goo x={gooAt.x} y={gooAt.y} color={gooColor} light={gooLight} />
        </Sequence>
        <Img
          name="Pack"
          src={packSrc}
          style={{
            position: "absolute",
            ...pack,
            objectFit: "contain",
            filter: "drop-shadow(0 25px 30px rgba(0,0,0,0.35))",
            translate: interpolate(frame, [b + 33, b + 45], ["0px 900px", "0px 0px"], {
              ...clamp,
              easing: Easing.spring({ damping: 11 }),
            }),
            rotate: `${-dir * 6}deg`,
          }}
        />
        <Mascot
          eyesOpen={chomp ? 0.15 : 1}
          lookX={0}
          lookY={happy ? 0 : -0.8}
          mouthOpen={chomp ? 0 : happy ? 0.7 : 0.2 + lean * 0.8}
          armWave={happy ? Math.sin(frame / 3) * 25 : 0}
          style={{
            position: "absolute",
            width: 420,
            left: mascotRest.left,
            top: mascotRest.top,
            translate: `${dir * (-500 * enter) + dir * 40 * lunge}px ${30 * lean * (1 - lunge) - 270 * lunge}px`,
            rotate: `${dir * (-8 * lean * (1 - lunge) + 12 * lunge)}deg`,
            scale: chomp ? "1.25 0.85" : `${1 + 0.15 * lunge}`,
            transform: left ? undefined : "scaleX(-1)",
          }}
        />
      </AbsoluteFill>
      <Interactive.Div
        name="Subtitle"
        style={{
          position: "absolute",
          top: 220,
          left: 80,
          right: 80,
          textAlign: "center",
          fontFamily: bodyFont,
          fontWeight: 700,
          fontSize: 66,
          color: colors.white,
          textShadow: "0 6px 0 rgba(0,0,0,0.2)",
          opacity: interpolate(frame, [b + 10, b + 18], [0, 1], clamp),
          translate: interpolate(frame, [b + 10, b + 18], ["0px 40px", "0px 0px"], clamp),
        }}
      >
        {subtitle}
      </Interactive.Div>
      <Interactive.Div
        name="Flavor title"
        style={{
          position: "absolute",
          top: 300,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: displayFont,
          fontSize: 210,
          ...candyText(colors.white, titleOutline, 15),
          scale: interpolate(frame, [b + 4, b + 12], [3, 1], {
            ...clamp,
            easing: Easing.spring({ damping: 9 }),
            output: "perceptual-scale",
          }),
          opacity: interpolate(frame, [b + 4, b + 6], [0, 1], clamp),
        }}
      >
        {flavor}
      </Interactive.Div>
    </AbsoluteFill>
  );
};

const biteSchema = {
  flavor: { type: "string", default: "PASTÈQUE", description: "Flavor" },
  subtitle: { type: "string", default: "Fourré coulis", description: "Subtitle" },
  bg: { type: "color", default: colors.green, description: "Background" },
  bgLight: { type: "color", default: "#5CC46A", description: "Background glow" },
  titleOutline: { type: "color", default: colors.greenDark, description: "Title outline" },
  gooColor: { type: "color", default: "#C70D3A", description: "Filling color" },
  gooLight: { type: "color", default: "#FF7A9A", description: "Filling highlight" },
  heroSrc: { type: "asset", assetType: "image", default: undefined, description: "Hero image" },
  packSrc: { type: "asset", assetType: "image", default: undefined, description: "Pack image" },
  mascotSide: {
    type: "enum",
    default: "left",
    description: "Mascot side",
    variants: { left: {}, right: {} },
  },
  biteFrame: { type: "number", default: 50, min: 30, max: 90, step: 1, description: "Bite frame", hiddenFromList: false },
} as const satisfies InteractivitySchema;

export const BiteScene = Interactive.withSchema({
  Component: BiteInner,
  componentName: "BiteScene",
  schema: biteSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});
