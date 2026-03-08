import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, RoundedBox, Text, Environment } from "@react-three/drei";
import * as THREE from "three";

interface ProductPreview3DProps {
  productType: "card" | "banner" | "sticker" | "brochure";
  width: number; // in mm
  height: number; // in mm
  imageUrl?: string | null;
  label?: string;
}

const CardMesh = ({ width, height, imageUrl, label }: { width: number; height: number; imageUrl?: string | null; label?: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Normalize dimensions - scale to fit view (max 3 units)
  const aspect = width / height;
  const scaleW = aspect >= 1 ? 3 : 3 * aspect;
  const scaleH = aspect >= 1 ? 3 / aspect : 3;
  const thickness = 0.04;

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={meshRef as any}>
      {/* Card body */}
      <RoundedBox args={[scaleW, scaleH, thickness]} radius={0.03} smoothness={4}>
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.05} />
      </RoundedBox>
      
      {/* Front face with design or text */}
      <mesh position={[0, 0, thickness / 2 + 0.001]}>
        <planeGeometry args={[scaleW * 0.9, scaleH * 0.9]} />
        <meshStandardMaterial color="#f8f8f8" roughness={0.5} />
      </mesh>

      {/* Label on front */}
      {label && (
        <Text
          position={[0, 0, thickness / 2 + 0.01]}
          fontSize={scaleW * 0.08}
          color="#1a1a2e"
          anchorX="center"
          anchorY="middle"
          maxWidth={scaleW * 0.8}
        >
          {label}
        </Text>
      )}

      {/* Subtle edge accent */}
      <mesh position={[0, -scaleH / 2 + 0.02, 0]}>
        <boxGeometry args={[scaleW, 0.04, thickness + 0.01]} />
        <meshStandardMaterial color="hsl(12, 85%, 62%)" />
      </mesh>
    </group>
  );
};

const BannerMesh = ({ width, height }: { width: number; height: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const aspect = width / height;
  const scaleW = Math.min(4, 2 * aspect);
  const scaleH = scaleW / aspect;

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={meshRef as any}>
      <RoundedBox args={[scaleW, scaleH, 0.02]} radius={0.01} smoothness={2}>
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </RoundedBox>
      {/* Banner grommets */}
      {[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([x, y], i) => (
        <mesh key={i} position={[x * scaleW * 0.45, y * scaleH * 0.45, 0]}>
          <torusGeometry args={[0.06, 0.02, 8, 16]} />
          <meshStandardMaterial color="#888888" metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
};

const ProductPreview3D = ({ productType, width, height, imageUrl, label }: ProductPreview3DProps) => {
  return (
    <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden bg-gradient-to-b from-secondary/50 to-background border border-border">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} shadows>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
          <pointLight position={[-3, 2, 4]} intensity={0.4} color="#ff6b4a" />
          
          {productType === "banner" ? (
            <BannerMesh width={width} height={height} />
          ) : (
            <CardMesh width={width} height={height} imageUrl={imageUrl} label={label || "Your Design"} />
          )}
          
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={3}
            maxDistance={10}
            autoRotate={false}
          />
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
      <p className="text-center text-xs text-muted-foreground -mt-6 relative z-10">
        🖱️ Drag to rotate • Scroll to zoom
      </p>
    </div>
  );
};

export default ProductPreview3D;
