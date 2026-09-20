'use client';
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text } from '@react-three/drei';
import * as THREE from 'three';

// An individual piston that animates up and down based on RPM
const Piston = ({ position, offsetPhase, rpm, isFaulty, label }: { position: [number, number, number], offsetPhase: number, rpm: number, isFaulty: boolean, label: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create a ref for time accumulation to handle dynamic frequency smoothly
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Calculate angular velocity (radians per second) based on RPM
      // RPM / 60 = Hz (cycles per sec)
      // Hz * 2PI = radians per sec
      const angularVelocity = (rpm / 60) * Math.PI * 2;
      
      // Accumulate time based on the current angular velocity
      timeRef.current += angularVelocity * delta;

      // Stroke length (amplitude)
      const stroke = 1.5;
      
      // Calculate Y position
      const y = Math.sin(timeRef.current + offsetPhase) * (stroke / 2);
      
      // Update position (base Y is 0)
      meshRef.current.position.y = y;
    }
  });

  return (
    <group position={position}>
      {/* Cylinder Block (Transparent) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.1, 1.1, 4, 32]} />
        <meshPhysicalMaterial 
          color={isFaulty ? "#ff5555" : "#4488ff"} 
          transparent 
          opacity={0.15} 
          roughness={0.1} 
          transmission={0.9} 
          thickness={0.5} 
        />
      </mesh>
      
      {/* The Piston Head */}
      <mesh ref={meshRef}>
        <cylinderGeometry args={[0.95, 0.95, 1, 32]} />
        <meshStandardMaterial 
          color={isFaulty ? "#ff9999" : "#bbbbcc"} 
          metalness={0.8} 
          roughness={0.2} 
        />
      </mesh>

      {/* Label */}
      <Text position={[0, -2.5, 0]} fontSize={0.4} color="white" anchorX="center" anchorY="middle">
        {label}
      </Text>
    </group>
  );
};

export default function Engine3DView({ currentData, height = '500px' }: { currentData: any, height?: string }) {
  const rpm = currentData?.rpm || 0;
  
  // Calculate if specific cylinders are running too hot (simulated localized fault)
  const isCyl1Hot = currentData?.cht_1_c > 220;
  const isCyl2Hot = currentData?.cht_2_c > 220;
  const isCyl3Hot = currentData?.cht_3_c > 220;
  const isCyl4Hot = currentData?.cht_4_c > 220;

  return (
    <div className="panel" style={{ height, width: '100%', padding: 0, overflow: 'hidden', position: 'relative' }}>
      
      {/* Overlay UI */}
      <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, background: 'rgba(0,0,0,0.5)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ margin: 0, color: 'var(--accent-blue)' }}>Inline-4 Piston Engine</h3>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Live Telemetry: {rpm.toFixed(0)} RPM</p>
      </div>

      <Canvas camera={{ position: [5, 4, 12], fov: 45 }}>
        <color attach="background" args={['#0a0a0f']} />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4488ff" />

        {/* Engine Layout */}
        <group position={[0, 0, 0]}>
          {/* Cylinder 1 - Phase 0 */}
          <Piston position={[-3.5, 0, 0]} offsetPhase={0} rpm={rpm} isFaulty={isCyl1Hot} label="CYL 1" />
          
          {/* Cylinder 2 - Phase PI (180 deg) */}
          <Piston position={[-1.16, 0, 0]} offsetPhase={Math.PI} rpm={rpm} isFaulty={isCyl2Hot} label="CYL 2" />
          
          {/* Cylinder 3 - Phase PI (180 deg) */}
          <Piston position={[1.16, 0, 0]} offsetPhase={Math.PI} rpm={rpm} isFaulty={isCyl3Hot} label="CYL 3" />
          
          {/* Cylinder 4 - Phase 0 */}
          <Piston position={[3.5, 0, 0]} offsetPhase={0} rpm={rpm} isFaulty={isCyl4Hot} label="CYL 4" />
        </group>

        {/* Decorative Base Plate */}
        <mesh position={[0, -3.5, 0]}>
          <boxGeometry args={[10, 0.5, 3]} />
          <meshStandardMaterial color="#222" metalness={0.5} roughness={0.8} />
        </mesh>

        <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000" position={[0, -3.8, 0]} />
        
        {/* Environment mapping for reflections */}
        <Environment preset="city" />
        
        {/* Mouse Interaction */}
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minDistance={5} maxDistance={25} />
      </Canvas>
    </div>
  );
}
