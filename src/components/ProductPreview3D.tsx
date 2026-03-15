import { Suspense, useRef, useMemo, useLayoutEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, RoundedBox, Text, Environment, useTexture } from "@react-three/drei";
import * as THREE from "three";

interface ProductPreview3DProps {
  productType: "card" | "banner" | "sticker" | "brochure" | "idcard" | "poster" | "pamphlet" | "weddingcard";
  width: number; // in mm
  height: number; // in mm
  imageUrl?: string | null;
  label?: string;
  finishId?: string;
}

const TextureFace = ({ 
  url, 
  width, 
  height, 
  roughness, 
  metalness 
}: { 
  url: string; 
  width: number; 
  height: number;
  roughness: number;
  metalness: number;
}) => {
  const texture = useTexture(url);
  
  useLayoutEffect(() => {
    if (texture) {
      texture.anisotropy = 16;
      texture.needsUpdate = true;
    }
  }, [texture]);

  return (
    <meshStandardMaterial 
      map={texture} 
      roughness={roughness} 
      metalness={metalness} 
      transparent 
    />
  );
};

const CardMesh = ({ 
  width, 
  height, 
  imageUrl, 
  label, 
  finishId 
}: { 
  width: number; 
  height: number; 
  imageUrl?: string | null; 
  label?: string;
  finishId?: string;
}) => {
  const meshRef = useRef<THREE.Group>(null);
  
  // Normalize dimensions - scale to fit view (max 3 units)
  const aspect = width / height;
  const scaleW = aspect >= 1 ? 3 : 3 * aspect;
  const scaleH = aspect >= 1 ? 3 / aspect : 3;
  const thickness = 0.04;

  // Material properties based on finish
  const materialProps = useMemo(() => {
    switch (finishId) {
      case "glossy-lam":
      case "gloss-130":
      case "gloss-170":
        return { roughness: 0.1, metalness: 0.2 };
      case "matte-lam":
      case "matte-350":
        return { roughness: 0.8, metalness: 0.05 };
      case "spot-uv":
        return { roughness: 0.2, metalness: 0.3 };
      case "foil-gold":
      case "metallic":
        return { roughness: 0.2, metalness: 0.8, color: "#ffd700" };
      case "foil-silver":
        return { roughness: 0.2, metalness: 0.8, color: "#c0c0c0" };
      default:
        return { roughness: 0.4, metalness: 0.05 };
    }
  }, [finishId]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Card body */}
      <RoundedBox args={[scaleW, scaleH, thickness]} radius={0.03} smoothness={4}>
        <meshStandardMaterial 
          {...materialProps}
          color={materialProps.color || "#ffffff"}
        />
      </RoundedBox>
      
      {/* Front face with texture or designer text */}
      <mesh position={[0, 0, thickness / 2 + 0.002]}>
        <planeGeometry args={[scaleW * 0.98, scaleH * 0.98]} />
        {imageUrl ? (
          <Suspense fallback={<meshStandardMaterial color="#f0f0f0" transparent opacity={0.5} />}>
            <TextureFace 
              url={imageUrl} 
              width={scaleW} 
              height={scaleH}
              roughness={materialProps.roughness}
              metalness={materialProps.metalness}
            />
          </Suspense>
        ) : (
          <meshStandardMaterial color="#f8f8f8" roughness={0.5} opacity={0.1} transparent />
        )}
      </mesh>

      {/* Label on front if no texture */}
      {!imageUrl && label && (
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
        <boxGeometry args={[scaleW, 0.01, thickness + 0.005]} />
        <meshStandardMaterial color="hsl(12, 85%, 62%)" />
      </mesh>
    </group>
  );
};

const BannerMesh = ({ 
  width, 
  height, 
  imageUrl 
}: { 
  width: number; 
  height: number;
  imageUrl?: string | null;
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const aspect = width / height;
  const scaleW = Math.min(4, 2 * aspect);
  const scaleH = scaleW / aspect;

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={meshRef}>
      <RoundedBox args={[scaleW, scaleH, 0.02]} radius={0.01} smoothness={2}>
        {imageUrl ? (
          <Suspense fallback={<meshStandardMaterial color="#f0f0f0" />}>
            <TextureFace 
              url={imageUrl} 
              width={scaleW} 
              height={scaleH}
              roughness={0.6}
              metalness={0.1}
            />
          </Suspense>
        ) : (
          <meshStandardMaterial color="#f0f0f0" roughness={0.6} />
        )}
      </RoundedBox>
      {/* Banner grommets */}
      {[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([x, y], i) => (
        <mesh key={i} position={[x * scaleW * 0.45, y * scaleH * 0.45, 0]}>
          <torusGeometry args={[0.04, 0.01, 8, 16]} />
          <meshStandardMaterial color="#888888" metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
};
const PosterMesh = ({ width, height, imageUrl }: { width: number; height: number; imageUrl?: string | null }) => {
  const meshRef = useRef<THREE.Group>(null);
  const aspect = width / height;
  const scaleW = aspect >= 1 ? 4 : 4 * aspect;
  const scaleH = aspect >= 1 ? 4 / aspect : 4;

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={meshRef}>
      <RoundedBox args={[scaleW, scaleH, 0.01]} radius={0.005} smoothness={2}>
        {imageUrl ? (
          <Suspense fallback={<meshStandardMaterial color="#ffffff" />}>
            <TextureFace url={imageUrl} width={scaleW} height={scaleH} roughness={0.9} metalness={0} />
          </Suspense>
        ) : (
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        )}
      </RoundedBox>
    </group>
  );
};

const IDCardMesh = ({ width, height, imageUrl }: { width: number; height: number; imageUrl?: string | null }) => {
  const meshRef = useRef<THREE.Group>(null);
  const aspect = width / height;
  const scaleW = 2;
  const scaleH = 2 / aspect;

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Card body */}
      <RoundedBox args={[scaleW, scaleH, 0.05]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color="#f0f0f0" roughness={0.3} metalness={0.1} />
      </RoundedBox>
      {/* Front face */}
      <mesh position={[0, 0, 0.026]}>
        <planeGeometry args={[scaleW * 0.95, scaleH * 0.95]} />
        {imageUrl ? (
          <Suspense fallback={<meshStandardMaterial color="#ffffff" />}>
            <TextureFace url={imageUrl} width={scaleW} height={scaleH} roughness={0.4} metalness={0.1} />
          </Suspense>
        ) : (
          <meshStandardMaterial color="#ffffff" />
        )}
      </mesh>
      {/* Lanyard hole */}
      <mesh position={[0, scaleH / 2 - 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  );
};

const BrochureMesh = ({ width, height, imageUrl }: { width: number; height: number; imageUrl?: string | null }) => {
  const meshRef = useRef<THREE.Group>(null);
  const aspect = width / height;
  const scaleW = aspect >= 1 ? 3 : 3 * aspect;
  const scaleH = aspect >= 1 ? 3 / aspect : 3;
  const halfW = scaleW / 2;

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Left panel */}
      <group position={[-halfW / 2, 0, 0]}>
        <RoundedBox args={[halfW, scaleH, 0.02]} radius={0.01} smoothness={2}>
          {imageUrl ? (
            <Suspense fallback={<meshStandardMaterial color="#ffffff" />}>
              <TextureFace url={imageUrl} width={halfW} height={scaleH} roughness={0.7} metalness={0} />
            </Suspense>
          ) : (
            <meshStandardMaterial color="#ffffff" roughness={0.7} />
          )}
        </RoundedBox>
      </group>
      {/* Right panel (folded) */}
      <group position={[halfW / 2, 0, 0]} rotation={[0, -Math.PI / 6, 0]}>
        <RoundedBox args={[halfW, scaleH, 0.02]} radius={0.01} smoothness={2}>
          <meshStandardMaterial color="#ffffff" roughness={0.7} />
        </RoundedBox>
      </group>
    </group>
  );
};


const ProductPreview3D = ({ productType, width, height, imageUrl, label, finishId }: ProductPreview3DProps) => {
  return (
    <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden bg-gradient-to-b from-secondary/50 to-background border border-border">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} shadows>
        <Suspense fallback={null}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
          <pointLight position={[-3, 2, 4]} intensity={0.5} color="#ff6b4a" />
          
          {productType === "banner" ? (
            <BannerMesh width={width} height={height} imageUrl={imageUrl} />
          ) : productType === "brochure" || productType === "weddingcard" ? (
            <BrochureMesh width={width} height={height} imageUrl={imageUrl} />
          ) : productType === "idcard" ? (
            <IDCardMesh width={width} height={height} imageUrl={imageUrl} />
          ) : productType === "poster" || productType === "pamphlet" ? (
            <PosterMesh width={width} height={height} imageUrl={imageUrl} />
          ) : (
            <CardMesh 
              width={width} 
              height={height} 
              imageUrl={imageUrl} 
              label={label || "Your Design"} 
              finishId={finishId}
            />
          )}
          
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={2}
            maxDistance={8}
            autoRotate={false}
          />
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">
          360° Interactive Preview
        </p>
      </div>
    </div>
  );
};

export default ProductPreview3D;
