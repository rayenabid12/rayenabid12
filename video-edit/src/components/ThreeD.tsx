import { ThreeCanvas } from "@remotion/three";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme";

// Camera: fov 30 at z=20 → the 1080×1920 frame spans ~6.03 × 10.72 world units.
const UNIT = 1920 / (2 * 20 * Math.tan((15 * Math.PI) / 180));
export const px = (x: number, y: number): [number, number] => [(x - 540) / UNIT, (960 - y) / UNIT];

const Lights: React.FC = () => (
  <>
    <ambientLight intensity={0.9} />
    <directionalLight position={[4, 8, 10]} intensity={3} color="#ffffff" />
    <pointLight position={[-6, -2, 6]} intensity={60} color={colors.purpleLight} />
    <pointLight position={[5, -6, 4]} intensity={40} color="#ff8bd8" />
    <pointLight position={[0, 4, -6]} intensity={50} color="#c9a6ff" />
  </>
);

const Canvas: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{ position: [0, 0, 20], fov: 30 }}
      style={{ position: "absolute", inset: 0 }}
      gl={{ antialias: true, alpha: true }}
    >
      <Lights />
      {children}
    </ThreeCanvas>
  );
};

const Glossy: React.FC<{ color?: string; metal?: boolean }> = ({ color = colors.purple, metal }) => (
  <meshPhysicalMaterial
    color={color}
    roughness={metal ? 0.15 : 0.22}
    metalness={metal ? 0.85 : 0.1}
    clearcoat={1}
    clearcoatRoughness={0.1}
  />
);

const pop = (frame: number, fps: number, at: number) =>
  spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 90 } });

/* Glossy shapes drifting at the edges of the frame for the whole video. */
export const FloatingShapes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const out = interpolate(frame, [durationInFrames - 70, durationInFrames - 55], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const t = frame / fps;
  const bob = (phase: number) => Math.sin(t * 1.3 + phase) * 0.18;
  return (
    <Canvas>
      {/* torus — top left */}
      <mesh
        position={[px(120, 330)[0], px(120, 330)[1] + bob(0), -1]}
        rotation={[0.6 + t * 0.5, t * 0.7, 0.2]}
        scale={pop(frame, fps, 20) * 0.85 * out}
      >
        <torusGeometry args={[0.55, 0.22, 48, 96]} />
        <Glossy />
      </mesh>
      {/* icosahedron — right middle */}
      <mesh
        position={[px(990, 1150)[0], px(990, 1150)[1] + bob(1.7), -2]}
        rotation={[t * 0.6, t * 0.4, 0]}
        scale={pop(frame, fps, 28) * 0.6 * out}
      >
        <icosahedronGeometry args={[0.7, 0]} />
        <Glossy color={colors.purpleLight} />
      </mesh>
      {/* chrome sphere — bottom left */}
      <mesh
        position={[px(110, 1820)[0], px(110, 1820)[1] + bob(3.1), -1]}
        scale={pop(frame, fps, 34) * 0.42 * out}
      >
        <sphereGeometry args={[1, 64, 64]} />
        <Glossy color="#d9c8ff" metal />
      </mesh>
      {/* small capsule — top right, under the petals */}
      <mesh
        position={[px(860, 520)[0], px(860, 520)[1] + bob(4.4), -3]}
        rotation={[0.4, 0.2, 0.9 + t * 0.5]}
        scale={pop(frame, fps, 40) * 0.5 * out}
      >
        <capsuleGeometry args={[0.28, 0.8, 16, 32]} />
        <Glossy color={colors.purpleDeep} />
      </mesh>
    </Canvas>
  );
};

/* "ANY BRAND": glossy sphere with a tilted orbit ring. */
export const Sphere3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, 3);
  const out = interpolate(frame, [36, 44], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const [x, y] = px(540, 820);
  return (
    <Canvas>
      <group position={[x, y, 0]} scale={s * out} rotation={[0, frame * 0.02, 0]}>
        <mesh>
          <sphereGeometry args={[1.85, 96, 96]} />
          <Glossy />
        </mesh>
        <mesh rotation={[Math.PI / 2.4, 0.25, frame * 0.03]}>
          <torusGeometry args={[2.55, 0.06, 24, 160]} />
          <Glossy color="#ffffff" metal />
        </mesh>
        <mesh
          position={[Math.cos(frame * 0.08) * 2.55, Math.sin(frame * 0.08) * 0.6, Math.sin(frame * 0.08) * 2.4]}
        >
          <sphereGeometry args={[0.2, 32, 32]} />
          <Glossy color={colors.purpleLight} metal />
        </mesh>
      </group>
    </Canvas>
  );
};

/* "MARKET": isometric 3D bar chart growing. */
export const Bars3D: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const heights = [0.45, 0.75, 0.6, 1.0, 1.45];
  const [x, y] = px(540, 1255);
  return (
    <Canvas>
      <group
        position={[x, y, 0]}
        rotation={[0.35, -0.55 + interpolate(frame, [at, at + 60], [0, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), 0]}
      >
        {heights.map((h, i) => {
          const g = spring({ frame: frame - at - i * 3, fps, config: { damping: 15, stiffness: 80 } });
          const hh = Math.max(0.001, h * g);
          return (
            <mesh key={i} position={[(i - 2) * 0.62, hh / 2 - 0.6, 0]}>
              <boxGeometry args={[0.44, hh, 0.44]} />
              <Glossy color={i === heights.length - 1 ? colors.purple : "#cdb4ff"} />
            </mesh>
          );
        })}
      </group>
    </Canvas>
  );
};

/* Outro: torus knot spinning above "SAVE". */
export const Knot3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, 2);
  const [x, y] = px(540, 470);
  return (
    <Canvas>
      <mesh
        position={[x, y, 0]}
        rotation={[frame * 0.02, frame * 0.035, 0]}
        scale={s * interpolate(frame, [0, 60], [0.75, 0.88], { easing: Easing.out(Easing.quad) })}
      >
        <torusKnotGeometry args={[0.85, 0.28, 220, 32]} />
        <Glossy />
      </mesh>
    </Canvas>
  );
};
