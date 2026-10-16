import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export type Rect = { left: number; top: number; width: number; height: number; radius: number };

// Named card positions used through the edit.
export const FULL: Rect = { left: 0, top: 0, width: 1080, height: 1920, radius: 0 };
export const HERO: Rect = { left: 190, top: 820, width: 700, height: 960, radius: 56 };
export const CORNER_R: Rect = { left: 680, top: 1320, width: 320, height: 470, radius: 40 };
export const CORNER_L: Rect = { left: 80, top: 1320, width: 320, height: 470, radius: 40 };
export const RIGHT: Rect = { left: 520, top: 560, width: 500, height: 820, radius: 48 };
export const TOP: Rect = { left: 230, top: 150, width: 620, height: 940, radius: 56 };
export const GONE: Rect = { left: 540, top: 900, width: 0, height: 0, radius: 40 };

const ease = Easing.bezier(0.83, 0, 0.17, 1);

// Frame → rect along a keyframe track; each move uses a snappy in-out curve.
export const rectAt = (frame: number, track: [number, Rect][]): Rect => {
  if (frame <= track[0][0]) return track[0][1];
  for (let i = 0; i < track.length - 1; i++) {
    const [f0, r0] = track[i];
    const [f1, r1] = track[i + 1];
    if (frame <= f1) {
      const t = interpolate(frame, [f0, f1], [0, 1], { easing: ease });
      return {
        left: r0.left + (r1.left - r0.left) * t,
        top: r0.top + (r1.top - r0.top) * t,
        width: r0.width + (r1.width - r0.width) * t,
        height: r0.height + (r1.height - r0.height) * t,
        radius: r0.radius + (r1.radius - r0.radius) * t,
      };
    }
  }
  return track[track.length - 1][1];
};

// The speaker lives inside this floating rounded card. Fast moves get motion blur.
export const FaceCard: React.FC<{ track: [number, Rect][]; children: React.ReactNode }> = ({
  track,
  children,
}) => {
  const frame = useCurrentFrame();
  const r = rectAt(frame, track);
  const p = rectAt(frame - 1, track);
  const speed = Math.hypot(r.left - p.left, r.top - p.top, r.width - p.width, r.height - p.height);
  const framed = r.radius > 1;
  return (
    <div
      style={{
        position: "absolute",
        left: r.left,
        top: r.top,
        width: r.width,
        height: r.height,
        borderRadius: r.radius,
        overflow: "hidden",
        outline: framed ? `${Math.min(8, r.radius / 6)}px solid rgba(255,255,255,0.95)` : undefined,
        boxShadow: framed ? "0 30px 80px rgba(85,18,194,0.45), 0 0 60px rgba(166,107,255,0.35)" : undefined,
        filter: speed > 2 ? `blur(${Math.min(10, speed / 14)}px)` : undefined,
      }}
    >
      {children}
    </div>
  );
};

// Punch-in zoom on each jump cut, with a slow push during the clip.
export const Punch: React.FC<{ children: React.ReactNode; zoom: number; push?: number }> = ({
  children,
  zoom,
  push = 0.04,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        transformOrigin: "50% 30%",
        scale: String(
          interpolate(frame, [0, durationInFrames], [zoom, zoom + push], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        ),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
