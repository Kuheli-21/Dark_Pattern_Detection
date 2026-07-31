import React, { useRef, useState, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Points, PointMaterial } from '@react-three/drei';

// 1. Sentinel Scanner Mascot Component (Hero Section)
const SentinelMascot = ({ isMobile, scrollProgress, isLoginMode }) => {
  const groupRef = useRef();
  const outerRingRef = useRef();
  const innerRingRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Idle bobbing animation
    groupRef.current.position.y = (isMobile ? 1.2 : 0.2) + Math.sin(t * 1.5) * 0.15;
    
    // Smooth cursor-tracking rotation
    const targetX = state.pointer.y * 0.45;
    const targetY = state.pointer.x * 0.6;
    
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.08);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.08);

    // Spin rings
    outerRingRef.current.rotation.z = t * 0.4;
    innerRingRef.current.rotation.y = -t * 0.6;

    // Scale mapping - stay visible in login mode
    const targetScale = isLoginMode ? 1.05 : (scrollProgress > 0.25 ? 0 : (isMobile ? 0.75 : 1));
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.1));
  });

  const positionX = isLoginMode ? (isMobile ? 0 : -2.0) : (isMobile ? 0 : -1.3);

  return (
    <group ref={groupRef} position={[positionX, 0.2, 0]}>
      {/* Outer translucent body */}
      <mesh>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshPhysicalMaterial 
          color="#8b5cf6"
          roughness={0.15}
          metalness={0.1}
          transmission={0.7}
          thickness={0.8}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Emissive center scanner eye */}
      <mesh position={[0, 0, 0.45]}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial 
          color="#f43f5e" 
          emissive="#f43f5e" 
          emissiveIntensity={2.5} 
        />
      </mesh>

      {/* Outer Cyan Ring */}
      <mesh ref={outerRingRef} rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[1.25, 0.06, 16, 100]} />
        <meshStandardMaterial 
          color="#06b6d4" 
          emissive="#06b6d4" 
          emissiveIntensity={1.2} 
        />
      </mesh>

      {/* Inner Purple Ring */}
      <mesh ref={innerRingRef} rotation={[-Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[1.05, 0.04, 16, 80]} />
        <meshStandardMaterial 
          color="#a78bfa" 
          emissive="#a78bfa" 
          emissiveIntensity={1} 
        />
      </mesh>
    </group>
  );
};

// 2. Interactive Mockup Plane Component (Hero Section)
const CheckoutMockupPlane = ({ isMobile, scrollProgress, onDismiss }) => {
  const planeRef = useRef();

  useFrame((state) => {
    // Pitch/Yaw rotation based on pointer coordinate
    const targetX = -state.pointer.y * 0.12; 
    const targetY = state.pointer.x * 0.18;  
    
    planeRef.current.rotation.x = THREE.MathUtils.lerp(planeRef.current.rotation.x, targetX, 0.08);
    planeRef.current.rotation.y = THREE.MathUtils.lerp(planeRef.current.rotation.y, targetY, 0.08);

    // Fade out as scroll progress passes hero
    const targetScale = scrollProgress > 0.25 ? 0 : (isMobile ? 0.72 : 1);
    planeRef.current.scale.setScalar(THREE.MathUtils.lerp(planeRef.current.scale.x, targetScale, 0.1));
  });

  const positionX = isMobile ? 0 : 1.7;
  const positionY = isMobile ? -1.3 : 0;

  return (
    <mesh ref={planeRef} position={[positionX, positionY, -0.4]}>
      <planeGeometry args={[4.2, 3.2]} />
      <meshBasicMaterial transparent opacity={0} />
      
      <Html transform distanceFactor={3.2} style={{ pointerEvents: 'auto' }}>
        <div 
          className="glass-panel" 
          style={{ 
            width: '450px', 
            borderRadius: '16px', 
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), 0 0 40px rgba(139, 92, 246, 0.18)',
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(13, 21, 39, 0.96)',
            color: '#ffffff',
            pointerEvents: 'auto'
          }}
        >
          {/* Mock Browser Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(7, 10, 19, 0.4)' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
            <div style={{ flex: 1, textAlign: 'center', fontSize: '0.725rem', color: '#94a3b8', fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', padding: '0.15rem 0' }}>
              checkout-portal.io
            </div>
          </div>
          {/* Mock Browser Layout */}
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
            <div style={{ height: '14px', width: '40%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} />
            <div style={{ height: '32px', width: '90%', background: 'rgba(255,255,255,0.15)', borderRadius: '6px' }} />
            <div style={{ height: '14px', width: '70%', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }} />
            
            {/* Warning Scanner Overlay Box */}
            <div style={{ 
              position: 'relative', 
              padding: '1rem', 
              borderRadius: '8px', 
              border: '1px solid rgba(244, 63, 94, 0.4)', 
              background: 'rgba(244, 63, 94, 0.06)',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '2px',
                background: '#f43f5e',
                boxShadow: '0 0 10px #f43f5e',
                animation: 'scanline-sweep 2.5s infinite linear'
              }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '14px' }}>🚨</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Deceptive Text Node Flagged
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#fda4af', fontWeight: 500, fontStyle: 'italic', lineHeight: 1.4 }}>
                "No thanks, I prefer risking my baggage without travel protection insurance."
              </div>
            </div>

            <button 
              type="button"
              onClick={(e) => { 
                e.stopPropagation(); 
                if (onDismiss) onDismiss(); 
              }}
              style={{ 
                width: '100%', 
                padding: '0.8rem', 
                fontSize: '0.85rem', 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #7c3aed 0%, #d946ef 100%)', 
                border: '1px solid rgba(255, 255, 255, 0.2)', 
                borderRadius: '10px', 
                color: '#ffffff', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
                fontFamily: 'var(--font-heading)'
              }}
            >
              Verify Scan Resolution
            </button>
          </div>
        </div>
      </Html>
    </mesh>
  );
};

// 3. Floating Parallax Scatter Component (Carousel / Middle Background)
const ParallaxScatter = () => {
  const shapesRef = useRef([]);
  const [particles] = useState(() => {
    const list = [];
    for (let i = 0; i < 15; i++) {
      const z = (Math.random() * -5) - 2.5; 
      const x = (Math.random() - 0.5) * 11;
      const y = (Math.random() - 0.5) * 6 - 5.5; // Centered around Y = -5.5
      const size = Math.random() * 0.14 + 0.07;
      const speed = Math.random() * 0.4 + 0.15;
      const type = Math.floor(Math.random() * 3); // 0: Checkmark Shield, 1: Exclamation Warning Triangle, 2: Telemetry Radar Node
      list.push({ x, y, z, size, speed, type });
    }
    return list;
  });

  useFrame((state) => {
    particles.forEach((p, idx) => {
      const mesh = shapesRef.current[idx];
      if (mesh) {
        const factor = (7.5 + p.z) * 0.045;
        mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, p.x + state.pointer.x * factor * 2, 0.06);
        mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, p.y + state.pointer.y * factor * 1.5, 0.06);
        mesh.rotation.x += 0.005 * p.speed;
        mesh.rotation.y += 0.007 * p.speed;
      }
    });
  });

  return (
    <group>
      {particles.map((p, i) => (
        <mesh 
          key={i} 
          ref={el => shapesRef.current[i] = el} 
          position={[p.x, p.y, p.z]}
        >
          {p.type === 0 && (
            // Security Shield Geometry (icosahedron)
            <icosahedronGeometry args={[p.size, 1]} />
          )}
          {p.type === 1 && (
            // Alert Triangle Geometry (Cylinder with 3 segments)
            <cylinderGeometry args={[0, p.size * 1.3, p.size * 1.3, 3]} />
          )}
          {p.type === 2 && (
            // Telemetry Radar Node (Torus ring shape)
            <torusGeometry args={[p.size, p.size * 0.25, 8, 24]} />
          )}
          
          <meshPhysicalMaterial 
            color={p.type === 0 ? "#10b981" : (p.type === 1 ? "#f59e0b" : "#f43f5e")}
            roughness={0.2}
            metalness={0.1}
            transmission={0.65}
            transparent
            opacity={0.65}
          />
        </mesh>
      ))}
    </group>
  );
};

// 4. Morphing Benefits Shape Component (Section 3: Y = -11)
const MorphingBenefit = ({ activeBenefit, isMobile }) => {
  const groupRef = useRef();
  
  // Ref handles for individual meshes
  const shape0Ref = useRef();
  const shape1Ref = useRef();
  const shape2Ref = useRef();
  const shape3Ref = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Idle rotation on the master group
    groupRef.current.rotation.y = t * 0.15;
    groupRef.current.position.y = -11.5 + Math.sin(t * 1.2) * 0.12;

    // Smoothly scale the active shape up and non-active shapes down to 0
    shape0Ref.current.scale.setScalar(THREE.MathUtils.lerp(shape0Ref.current.scale.x, activeBenefit === 0 ? 1 : 0, 0.1));
    shape1Ref.current.scale.setScalar(THREE.MathUtils.lerp(shape1Ref.current.scale.x, activeBenefit === 1 ? 1 : 0, 0.1));
    shape2Ref.current.scale.setScalar(THREE.MathUtils.lerp(shape2Ref.current.scale.x, activeBenefit === 2 ? 1 : 0, 0.1));
    shape3Ref.current.scale.setScalar(THREE.MathUtils.lerp(shape3Ref.current.scale.x, activeBenefit === 3 ? 1 : 0, 0.1));

    // Spin specific components inside the active shapes
    shape1Ref.current.rotation.x = t * 0.5;
    shape3Ref.current.rotation.y = -t * 0.3;
  });

  const positionX = isMobile ? 0 : -1.5;

  return (
    <group ref={groupRef} position={[positionX, -11.5, 0]} scale={isMobile ? 0.7 : 1}>
      
      {/* Benefit 0: Real-Time Scanning Eye */}
      <group ref={shape0Ref}>
        <mesh>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshPhysicalMaterial color="#8b5cf6" roughness={0.1} transmission={0.7} transparent thickness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.45]}>
          <sphereGeometry args={[0.24, 32, 32]} />
          <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={3} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.15, 0.05, 16, 100]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={1} />
        </mesh>
      </group>

      {/* Benefit 1: Probability Graph Nested Rings */}
      <group ref={shape1Ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.9, 0.06, 16, 80]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.5} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.7, 0.05, 16, 64]} />
          <meshStandardMaterial color="#d946ef" emissive="#d946ef" emissiveIntensity={1.2} />
        </mesh>
        <mesh>
          <octahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={1.5} />
        </mesh>
      </group>

      {/* Benefit 2: Explaining Glass Magnifying Lens */}
      <group ref={shape2Ref}>
        {/* Handle */}
        <mesh position={[0, -0.7, 0]} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.07, 0.07, 0.8, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Ring Frame */}
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[0.65, 0.06, 16, 64]} />
          <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={1} />
        </mesh>
        {/* Glass plane inside */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.04, 32]} rotation={[Math.PI / 2, 0, 0]} />
          <meshPhysicalMaterial color="#ffffff" transmission={0.9} transparent roughness={0.1} />
        </mesh>
      </group>

      {/* Benefit 3: Audit Security Lock */}
      <group ref={shape3Ref}>
        {/* Base body */}
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[1, 0.8, 0.5]} />
          <meshPhysicalMaterial color="#10b981" roughness={0.2} metalness={0.1} transmission={0.6} transparent thickness={0.5} />
        </mesh>
        {/* Shackle arch */}
        <mesh position={[0, 0.35, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.38, 0.08, 16, 64, Math.PI]} />
          <meshStandardMaterial color="#22d3ee" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Glowing lock heart indicator */}
        <mesh position={[0, -0.3, 0.26]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={2.5} />
        </mesh>
      </group>

    </group>
  );
};

// 5. Footer Particle Stars Component (Section 4: Y = -18)
const FooterParticles = () => {
  const pointsRef = useRef();
  
  // 180 points (540 coordinates) mapped around y = -18
  const [coords] = useState(() => {
    const arr = new Float32Array(540);
    for (let i = 0; i < 540; i += 3) {
      arr[i] = (Math.random() - 0.5) * 11;
      arr[i + 1] = (Math.random() - 0.5) * 8 - 18; // centered around -18
      arr[i + 2] = (Math.random() - 0.5) * 5;
    }
    return arr;
  });

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = t * 0.035;
    pointsRef.current.position.y = Math.sin(t * 0.4) * 0.08;
  });

  return (
    <Points ref={pointsRef} positions={coords} stride={3} limit={180}>
      <PointMaterial 
        transparent 
        color="#22d3ee" 
        size={0.065} 
        sizeAttenuation 
        depthWrite={false} 
        opacity={0.7}
      />
    </Points>
  );
};

// 6. Camera Controller connecting scroll progress to WebGL
const SceneController = ({ scrollProgress }) => {
  const { camera } = useThree();

  useFrame(() => {
    // Smooth camera path following scroll timeline height coordinate
    // Scroll progress maps Z camera zoom and Y camera elevation pan down
    const targetZ = 4.8 - scrollProgress * 1.5;
    const targetY = -scrollProgress * 18; // pans down to -18 at bottom footer

    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.075);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.075);
  });

  return null;
};

// 7. Main Unified Scene Wrapper
export default function SceneRoot({ scrollProgress = 0, activeBenefit = 0, onDismiss, isLoginMode = false }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 960);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        zIndex: 1, 
        pointerEvents: 'none' 
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 4.8], fov: 60 }}
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <ambientLight intensity={0.4} />
        
        {/* Purple directional light from the left */}
        <directionalLight 
          position={[-3, 2, 2]} 
          intensity={1.5} 
          color="#8b5cf6" 
        />
        
        {/* Cyan point light */}
        <pointLight 
          position={[3, -1, 3]} 
          intensity={2.2} 
          color="#06b6d4" 
        />
        
        {/* Emissive pink light */}
        <pointLight 
          position={[-2, 1, 2]} 
          intensity={1.2} 
          color="#f43f5e" 
        />

        {/* Global camera controller - skip movement in login mode */}
        <SceneController scrollProgress={isLoginMode ? 0 : scrollProgress} />

        {/* Section 1: Mascot Shield Orb (Hero) */}
        <SentinelMascot isMobile={isMobile} scrollProgress={isLoginMode ? 0 : scrollProgress} isLoginMode={isLoginMode} />

        {/* Section 1: Mockup browser transform plane (Hero) */}
        {!isLoginMode && (
          <CheckoutMockupPlane isMobile={isMobile} scrollProgress={scrollProgress} onDismiss={onDismiss} />
        )}

        {/* Section 2: Floating geometric scatter (Carousel background) */}
        <ParallaxScatter />

        {/* Section 3: Morphing Security Meshes (Benefits) */}
        {!isLoginMode && <MorphingBenefit activeBenefit={activeBenefit} isMobile={isMobile} />}

        {/* Section 4: Star Drift (Footer Background) */}
        <FooterParticles />

      </Canvas>

      <style>{`
        @keyframes scanline-sweep {
          0% { top: 0%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
