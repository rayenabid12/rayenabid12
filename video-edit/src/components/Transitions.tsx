import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// Full-screen B-roll wrapper: zoom-blur in, quick wipe-up out, lavender flash on entry.
export const BrollShell: React.FC<{ children: React.ReactNode; exitFrames?: number }> = ({
  children,
  exitFrames = 5,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const inP = interpolate(frame, [0, 7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const outP = interpolate(frame, [durationInFrames - exitFrames, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.7, 0, 0.84, 0),
  });
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          scale: String(interpolate(inP, [0, 1], [1.25, 1])),
          filter: `blur(${interpolate(inP, [0, 1], [24, 0])}px)`,
          opacity: interpolate(inP, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
          translate: `0px ${interpolate(outP, [0, 1], [0, -1920])}px`,
        }}
      >
        {children}
      </AbsoluteFill>
      <Flash />
    </AbsoluteFill>
  );
};

export const Flash: React.FC<{ at?: number }> = ({ at = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: "radial-gradient(circle at 50% 45%, #ffffff, #E9DAFF)",
        opacity: interpolate(frame - at, [0, 1, 6], [0, 0.85, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    />
  );
};
