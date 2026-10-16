import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { HERO } from "../components/FaceCard";
import { Pill } from "../components/Headline";
import { Brackets, Editorial, Scribble, Word } from "../components/Kinetic";
import { colors, sansFont } from "../theme";
import { Bars3D } from "../components/ThreeD";

const Center: React.FC<{ top: number; children: React.ReactNode; gap?: number }> = ({
  top,
  children,
  gap = 0,
}) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 0,
      width: 1080,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap,
    }}
  >
    {children}
  </div>
);

/* 1 · Hook ------------------------------------------------------------- */
export const HookText: React.FC = () => (
  <AbsoluteFill>
    {/* while the speaker is full screen */}
    <Center top={1430}>
      <Word variant="sans" size={72} color="white" at={3} out={16} style={{ textShadow: "0 4px 20px rgba(0,0,0,0.6)" }}>
        When you start
      </Word>
    </Center>
    {/* after the card shrinks */}
    <Center top={250}>
      <Word variant="sans" size={64} at={26} out={54}>
        you&apos;re
      </Word>
      <Word size={230} at={30} out={54}>
        BUILDING
      </Word>
      <Word variant="sans" size={84} at={38} out={54} style={{ marginTop: 6 }}>
        a brand.
      </Word>
    </Center>
    <Brackets at={34} rect={HERO} />
    <Editorial at={36} style={{ left: 70, top: 90 }}>
      Building a brand from zero — the process, step by step. Part 01.
    </Editorial>
  </AbsoluteFill>
);

/* 2 · Any brand: purple sphere + orbiting badges ------------------------ */
const Badge: React.FC<{ i: number; at: number; glyph: React.ReactNode }> = ({ i, at, glyph }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at - i * 2, fps, config: { damping: 11, stiffness: 200 } });
  const a = (i / 5) * Math.PI * 2 + frame * 0.03;
  return (
    <svg
      width={120}
      height={120}
      viewBox="0 0 100 100"
      style={{
        position: "absolute",
        left: 540 + Math.cos(a) * 430 - 60,
        top: 820 + Math.sin(a) * 430 - 60,
        scale: String(s),
        filter: "drop-shadow(0 10px 18px rgba(85,18,194,0.35))",
      }}
    >
      <circle cx={50} cy={50} r={48} fill={i % 2 ? colors.ink : "white"} />
      <g fill={i % 2 ? "white" : colors.purple}>{glyph}</g>
    </svg>
  );
};

export const AnyBrandDecor: React.FC = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [36, 44], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Badge i={0} at={10} glyph={<circle cx={50} cy={50} r={26} />} />
      <Badge i={1} at={10} glyph={<rect x={26} y={26} width={48} height={48} rx={10} />} />
      <Badge i={2} at={10} glyph={<polygon points="50,16 59,40 85,40 64,56 72,82 50,66 28,82 36,56 15,40 41,40" />} />
      <Badge i={3} at={10} glyph={<polygon points="50,20 82,78 18,78" />} />
      <Badge i={4} at={10} glyph={<path d="M30 30 h40 v12 h-26 v8 h20 v12 h-20 v8 h26 v12 h-40z" />} />
    </AbsoluteFill>
  );
};

export const AnyBrandText: React.FC = () => (
  <AbsoluteFill>
    <Center top={600}>
      <Word variant="sans" size={84} color="white" at={7} out={36}>
        any
      </Word>
      <Word size={290} fill="white" at={11} out={36} style={{ filter: "drop-shadow(0 12px 30px rgba(40,0,90,0.5))" }}>
        BRAND
      </Word>
    </Center>
  </AbsoluteFill>
);

/* 3 · Step 01: vertical purple band on the left -------------------------- */
export const FirstDecor: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const out = interpolate(frame, [30, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        top: 0,
        width: 420,
        height: 1920,
        background: `linear-gradient(180deg, ${colors.purpleLight}, ${colors.purple} 55%, ${colors.purpleDeep})`,
        translate: `0px ${interpolate(p, [0, 1], [-1920, 0]) + out * 1920}px`,
        opacity: 0.95,
      }}
    />
  );
};

export const FirstText: React.FC = () => (
  <AbsoluteFill>
    <div
      style={{
        position: "absolute",
        left: 60,
        width: 420,
        top: 660,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      <Pill delay={4}>STEP 01</Pill>
      <Word variant="sans" size={84} color="white" at={8} out={30}>
        the
      </Word>
      <Word size={230} fill="white" at={12} out={30}>
        FIRST
      </Word>
      <Word variant="sans" size={84} color="white" at={20} out={30}>
        thing
      </Word>
    </div>
  </AbsoluteFill>
);

/* 4 · Brand research: heartbeat line + magnifier ------------------------ */
export const ResearchDecor: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = interpolate(frame, [2, 24], [1500, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  });
  const lensX = interpolate(frame, [8, 40], [1100, 520], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.45, 0, 0.2, 1),
  });
  const out = interpolate(frame, [40, 46], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <svg width={1080} height={300} viewBox="0 0 1080 300" style={{ position: "absolute", top: 380 }}>
        <path
          d="M 0 150 L 330 150 L 370 150 L 395 60 L 425 250 L 455 90 L 480 180 L 505 150 L 640 150 L 665 80 L 690 220 L 715 150 L 1080 150"
          fill="none"
          stroke={colors.purple}
          strokeWidth={7}
          strokeLinejoin="round"
          strokeDasharray={1500}
          strokeDashoffset={pulse}
          style={{ filter: "drop-shadow(0 0 14px rgba(166,107,255,0.9))" }}
        />
      </svg>
      <svg
        width={300}
        height={300}
        viewBox="0 0 100 100"
        style={{
          position: "absolute",
          left: lensX,
          top: 1330,
          rotate: `${interpolate(frame, [8, 40], [25, -5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}deg`,
          filter: "drop-shadow(0 14px 22px rgba(42,31,61,0.35))",
        }}
      >
        <circle cx={40} cy={40} r={26} fill="rgba(255,255,255,0.4)" stroke={colors.ink} strokeWidth={7} />
        <line x1={60} y1={60} x2={88} y2={88} stroke={colors.ink} strokeWidth={11} strokeLinecap="round" />
      </svg>
    </AbsoluteFill>
  );
};

export const ResearchText: React.FC = () => (
  <AbsoluteFill>
    <Center top={720}>
      <Word variant="sans" size={72} at={4} out={40}>
        this is the
      </Word>
      <Word size={260} at={11} out={40}>
        BRAND
      </Word>
      <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Word size={205} at={18} out={40}>
          RESEARCH
        </Word>
        <Scribble at={24} width={900} height={290} style={{ top: -62 }} />
      </div>
    </Center>
  </AbsoluteFill>
);

/* 5 · In this phase ------------------------------------------------------ */
export const PhaseText: React.FC = () => {
  const frame = useCurrentFrame();
  const line = interpolate(frame, [19, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const out = interpolate(frame, [33, 38], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Center top={1150}>
        <Word variant="sans" size={84} at={12} out={33}>
          in this
        </Word>
        <Word size={250} at={17} out={33}>
          PHASE
        </Word>
        <div
          style={{
            width: 560 * line,
            height: 10,
            borderRadius: 5,
            marginTop: 8,
            opacity: out,
            background: `linear-gradient(90deg, ${colors.purpleDeep}, ${colors.purpleLight})`,
          }}
        />
        <Word variant="sans" size={52} color={colors.inkSoft} at={26} out={33} style={{ marginTop: 22 }}>
          you do two things ↓
        </Word>
      </Center>
    </AbsoluteFill>
  );
};

/* 6 · The brief ---------------------------------------------------------- */
const Row: React.FC<{ at: number; label: string }> = ({ at, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tick = spring({ frame: frame - at, fps, config: { damping: 10, stiffness: 250 } });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 26, marginBottom: 34 }}>
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: 16,
          border: `4px solid ${colors.purple}`,
          background: frame >= at ? colors.purple : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 40,
          fontWeight: 800,
          fontFamily: sansFont,
        }}
      >
        <span style={{ scale: String(tick) }}>✓</span>
      </div>
      <div
        style={{
          fontFamily: sansFont,
          fontSize: 46,
          fontWeight: 600,
          color: colors.ink,
          opacity: interpolate(frame - at + 4, [0, 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const BriefDecor: React.FC = () => {
  const frame = useCurrentFrame();
  const card = interpolate(frame, [10, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const out = interpolate(frame, [43, 49], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.7, 0, 0.84, 0),
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 160,
        top: 720,
        width: 760,
        borderRadius: 40,
        background: "rgba(255,255,255,0.94)",
        boxShadow: "0 40px 80px rgba(85,18,194,0.25)",
        overflow: "hidden",
        translate: `${out * -1200}px ${interpolate(card, [0, 1], [700, 0])}px`,
        rotate: `${interpolate(card, [0, 1], [10, -3])}deg`,
      }}
    >
      <div
        style={{
          background: `linear-gradient(90deg, ${colors.purpleDeep}, ${colors.purpleLight})`,
          color: "white",
          fontFamily: sansFont,
          fontWeight: 700,
          fontSize: 36,
          letterSpacing: 6,
          padding: "26px 44px",
        }}
      >
        CLIENT BRIEF
      </div>
      <div style={{ padding: "50px 44px 20px" }}>
        <Row at={22} label="Goals & vision" />
        <Row at={29} label="Target audience" />
        <Row at={36} label="Budget & timeline" />
      </div>
    </div>
  );
};

export const BriefText: React.FC = () => (
  <AbsoluteFill>
    <Center top={190}>
      <Word variant="sans" size={84} at={8} out={43}>
        take the
      </Word>
      <Word size={300} at={16} out={43}>
        BRIEF
      </Word>
    </Center>
  </AbsoluteFill>
);

/* 7 · Market research ---------------------------------------------------- */
export const MarketText: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Bars3D at={14} />
      <Center top={1430}>
        <Word variant="sans" size={72} at={18} style={{ marginBottom: 10 }}>
          research the
        </Word>
        <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Word size={250} at={38}>
            MARKET
          </Word>
        </div>
        <div
          style={{
            width: 600 * interpolate(frame, [41, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
            height: 10,
            borderRadius: 5,
            marginTop: 10,
            background: `linear-gradient(90deg, ${colors.purpleDeep}, ${colors.purpleLight})`,
            boxShadow: "0 0 18px rgba(166,107,255,0.8)",
          }}
        />
      </Center>
    </AbsoluteFill>
  );
};

/* 8 · Outro -------------------------------------------------------------- */
export const OutroText: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <Word size={340} at={6}>
        SAVE
      </Word>
      <Word variant="sans" size={60} color={colors.inkSoft} at={14}>
        & follow for step 02
      </Word>
      <div
        style={{
          marginTop: 40,
          fontSize: 90,
          color: colors.purple,
          translate: `0px ${interpolate(frame % 20, [0, 10, 20], [0, 18, 0])}px`,
          opacity: interpolate(frame, [18, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        ↓
      </div>
    </AbsoluteFill>
  );
};
