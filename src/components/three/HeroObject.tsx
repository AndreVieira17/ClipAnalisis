import { useRef, useState } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { Environment, RoundedBox, Float } from '@react-three/drei';
import * as THREE from 'three';

/**
 * ★ Camada B — the single REAL 3D moment (hero signature).
 *
 * A vertical "phone/clip" slab in gold metal. While HELD it advances in Z
 * toward the camera and rotates to follow the pointer (R3F's normalised
 * pointer). Idle = subtle float. Performance: low-poly, dpr capped, demand
 * frameloop is unnecessary because it's a tiny scene but we keep geometry
 * cheap and a light env map. Never blocks the page — it's lazy + has a
 * static fallback for weak/reduced-motion devices.
 */
function ClipSlab() {
  const group = useRef<THREE.Group>(null);
  const [held, setHeld] = useState(false);
  const targetZ = useRef(0);
  const targetRX = useRef(0);
  const targetRY = useRef(0);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    // follow pointer (-1..1) — tilt toward it
    targetRY.current = state.pointer.x * 0.5;
    targetRX.current = -state.pointer.y * 0.4;
    targetZ.current = held ? 1.6 : 0; // "pop toward camera" while held

    g.rotation.y += (targetRY.current - g.rotation.y) * 0.08;
    g.rotation.x += (targetRX.current - g.rotation.x) * 0.08;
    g.position.z += (targetZ.current - g.position.z) * 0.12;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.5} enabled={!held}>
      <group
        ref={group}
        onPointerDown={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHeld(true);
          (e.target as unknown as { setPointerCapture?: (id: number) => void })?.setPointerCapture?.(
            e.pointerId,
          );
        }}
        onPointerUp={() => setHeld(false)}
        onPointerOut={() => setHeld(false)}
      >
        {/* phone body */}
        <RoundedBox args={[2.1, 3.7, 0.32]} radius={0.18} smoothness={4}>
          <meshStandardMaterial
            color="#1a1a1d"
            metalness={0.9}
            roughness={0.35}
            emissive="#3a2c08"
            emissiveIntensity={0.25}
          />
        </RoundedBox>
        {/* gold bezel/frame */}
        <RoundedBox args={[2.18, 3.78, 0.28]} radius={0.2} smoothness={4} position={[0, 0, -0.02]}>
          <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.22} emissive="#8C6E22" emissiveIntensity={0.3} />
        </RoundedBox>
        {/* extruded play triangle */}
        <mesh position={[0.06, 0, 0.2]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.6, 1, 3]} />
          <meshStandardMaterial color="#F6E08A" metalness={1} roughness={0.18} emissive="#D4AF37" emissiveIntensity={0.55} />
        </mesh>
      </group>
    </Float>
  );
}

export default function HeroObject() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 7], fov: 38 }}
      style={{ touchAction: 'pan-y' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} color="#F6E08A" />
      <directionalLight position={[-5, -2, 2]} intensity={0.5} color="#ffffff" />
      <ClipSlab />
      <Environment preset="city" />
    </Canvas>
  );
}
