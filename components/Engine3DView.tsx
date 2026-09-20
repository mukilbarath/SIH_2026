'use client';
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text } from '@react-three/drei';
import * as THREE from 'three';

const CRANK_RADIUS = 0.8;
const CON_ROD_LENGTH = 2.8;
const CYLINDER_SPACING = 2.0;

// --- Kinematic Helpers ---
function valveLift(crankAngle: number, openAngle: number, closeAngle: number): number {
  let a = (crankAngle % (Math.PI * 4));
  if (a < 0) a += Math.PI * 4;
  const center = (openAngle + closeAngle) / 2;
  const duration = closeAngle - openAngle;
  let diff = a - center;
  while (diff < -Math.PI * 2) diff += Math.PI * 4;
  while (diff > Math.PI * 2) diff -= Math.PI * 4;
  if (Math.abs(diff) < duration / 2) {
    return Math.cos((diff / duration) * Math.PI) * 0.45; 
  }
  return 0;
}

// --- Detailed 3D Components ---

const HelixSpring = ({ length, radius, coils }: { length: number, radius: number, coils: number }) => {
  const geo = useMemo(() => {
    class HelixCurve extends THREE.Curve<THREE.Vector3> {
      getPoint(t: number, optionalTarget = new THREE.Vector3()) {
        const x = radius * Math.cos(t * Math.PI * 2 * coils);
        const z = radius * Math.sin(t * Math.PI * 2 * coils);
        const y = (t - 0.5) * length;
        return optionalTarget.set(x, y, z);
      }
    }
    return new THREE.TubeGeometry(new HelixCurve(), 100, 0.04, 12, false);
  }, [length, radius, coils]);
  
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color="#889" metalness={0.8} roughness={0.4} />
    </mesh>
  );
};

const Gear = ({ radius, teeth, thickness, color }: { radius: number, teeth: number, thickness: number, color: string }) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const inner = radius * 0.85;
    const outer = radius;
    for (let i = 0; i < teeth; i++) {
      const a1 = (i / teeth) * Math.PI * 2;
      const a2 = ((i + 0.3) / teeth) * Math.PI * 2;
      const a3 = ((i + 0.7) / teeth) * Math.PI * 2;
      const a4 = ((i + 1.0) / teeth) * Math.PI * 2;
      if (i === 0) s.moveTo(Math.cos(a1) * inner, Math.sin(a1) * inner);
      else s.lineTo(Math.cos(a1) * inner, Math.sin(a1) * inner);
      s.lineTo(Math.cos(a2) * outer, Math.sin(a2) * outer);
      s.lineTo(Math.cos(a3) * outer, Math.sin(a3) * outer);
      s.lineTo(Math.cos(a4) * inner, Math.sin(a4) * inner);
    }
    s.lineTo(Math.cos(0) * inner, Math.sin(0) * inner); 
    
    const hole = new THREE.Path();
    hole.absarc(0, 0, radius * 0.3, 0, Math.PI * 2, true);
    s.holes.push(hole);
    
    if (radius > 1.0) {
      for(let i=0; i<6; i++) {
        const h = new THREE.Path();
        h.absarc(Math.cos(i * Math.PI/3) * radius * 0.55, Math.sin(i * Math.PI/3) * radius * 0.55, radius * 0.15, 0, Math.PI * 2, true);
        s.holes.push(h);
      }
    }
    return s;
  }, [radius, teeth]);
  
  const extrudeSettings = { depth: thickness, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 };
  return (
    <mesh position={[0, 0, -thickness/2]}>
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
    </mesh>
  );
};

const CamLobe = ({ rotationZ, position }: { rotationZ: number, position: [number, number, number] }) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.absarc(0, 0, 0.2, Math.PI/2, -Math.PI/2, false);
    s.lineTo(0.25, -0.05);
    s.absarc(0.25, 0, 0.05, -Math.PI/2, Math.PI/2, false);
    s.lineTo(0, 0.2);
    return s;
  }, []);
  const extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01 };
  
  return (
    <group position={position} rotation={[0, 0, rotationZ]}>
      <mesh position={[0, 0, -0.1]}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial color="#666" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
};

const DetailedSparkPlug = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => (
  <group position={position} rotation={rotation}>
    <mesh position={[0, 0.05, 0]}>
      <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
      <meshStandardMaterial color="#555" metalness={0.8} />
    </mesh>
    <mesh position={[0, 0.15, 0]}>
      <cylinderGeometry args={[0.14, 0.14, 0.1, 6]} />
      <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.3} />
    </mesh>
    {[0.25, 0.3, 0.35, 0.4].map((y, i) => (
      <mesh key={i} position={[0, y, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 16]} />
        <meshStandardMaterial color="#fff" roughness={0.4} />
      </mesh>
    ))}
    <mesh position={[0, 0.325, 0]}>
      <cylinderGeometry args={[0.08, 0.08, 0.25, 16]} />
      <meshStandardMaterial color="#fff" roughness={0.4} />
    </mesh>
    <mesh position={[0, 0.5, 0]}>
      <cylinderGeometry args={[0.04, 0.04, 0.1, 16]} />
      <meshStandardMaterial color="#bbb" metalness={0.8} />
    </mesh>
    <mesh position={[0.06, -0.02, 0]}>
      <boxGeometry args={[0.04, 0.08, 0.04]} />
      <meshStandardMaterial color="#888" metalness={0.9} />
    </mesh>
  </group>
);

const DetailedRockerArm = () => (
  <group>
    <mesh>
      <boxGeometry args={[0.25, 1.2, 0.2]} />
      <meshStandardMaterial color="#555" metalness={0.7} roughness={0.4} />
    </mesh>
    <mesh rotation={[Math.PI/2, 0, 0]}>
      <cylinderGeometry args={[0.15, 0.15, 0.3, 24]} />
      <meshStandardMaterial color="#777" metalness={0.8} />
    </mesh>
    <mesh position={[0, 0.55, 0]}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial color="#444" metalness={0.9} />
    </mesh>
    <mesh position={[-0.05, -0.55, 0]}>
      <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} />
      <meshStandardMaterial color="#444" metalness={0.9} />
    </mesh>
  </group>
);

// --- New Auxiliary Components ---

const Turbocharger = () => (
  <group position={[2.5, -1.0, -CYLINDER_SPACING * 2 - 1.0]}>
    <mesh rotation={[Math.PI/2, 0, 0]}>
      <torusGeometry args={[0.5, 0.3, 16, 32]} />
      <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.3} />
    </mesh>
    <mesh position={[0, 0, 0]} rotation={[0, Math.PI/2, 0]}>
      <cylinderGeometry args={[0.3, 0.3, 1.2, 16]} />
      <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.3} />
    </mesh>
    <mesh position={[0, 0, -0.7]} rotation={[Math.PI/2, 0, 0]}>
      <torusGeometry args={[0.45, 0.35, 16, 32]} />
      <meshStandardMaterial color="#533" metalness={0.6} roughness={0.8} />
    </mesh>
    <mesh position={[0, -0.5, -0.7]} rotation={[Math.PI/2, 0, 0]}>
      <cylinderGeometry args={[0.3, 0.3, 1.0, 16]} />
      <meshStandardMaterial color="#533" metalness={0.6} roughness={0.8} />
    </mesh>
    <mesh position={[0, 0, -0.35]} rotation={[Math.PI/2, 0, 0]}>
      <cylinderGeometry args={[0.2, 0.2, 0.7, 16]} />
      <meshStandardMaterial color="#444" metalness={0.8} />
    </mesh>
  </group>
);

const StarterMotor = () => (
  <group position={[-2.6, -1.0, -4.5]}>
    <mesh rotation={[Math.PI/2, 0, 0]}>
      <cylinderGeometry args={[0.4, 0.4, 1.5, 24]} />
      <meshStandardMaterial color="#222" metalness={0.8} roughness={0.5} />
    </mesh>
    <mesh position={[0, 0, 0.8]} rotation={[Math.PI/2, 0, 0]}>
      <cylinderGeometry args={[0.2, 0.2, 0.4, 16]} />
      <meshStandardMaterial color="#888" metalness={0.9} />
    </mesh>
    <mesh position={[0.3, 0.2, -0.2]} rotation={[Math.PI/2, 0, 0]}>
      <cylinderGeometry args={[0.15, 0.15, 1.0, 16]} />
      <meshStandardMaterial color="#222" metalness={0.8} />
    </mesh>
  </group>
);

const Alternator = () => (
  <group position={[2.0, -0.6, 3.5]}>
    <mesh rotation={[Math.PI/2, 0, 0]}>
      <cylinderGeometry args={[0.6, 0.6, 1.5, 24]} />
      <meshStandardMaterial color="#999" metalness={0.8} roughness={0.4} />
    </mesh>
    <mesh rotation={[Math.PI/2, 0, 0]}>
      <cylinderGeometry args={[0.61, 0.61, 1.0, 24, 1, true]} />
      <meshStandardMaterial color="#222" wireframe />
    </mesh>
  </group>
);

const IntakeManifold = () => (
  <group position={[0, 0, 0]}>
    <mesh position={[0, 3.6, 0]} rotation={[Math.PI/2, 0, 0]}>
      <cylinderGeometry args={[0.6, 0.6, 8.5, 24]} />
      <meshStandardMaterial color="#1a1a1f" roughness={0.9} />
    </mesh>
    {[ { z: 3.0, dir: 1 }, { z: -1.0, dir: 1 }, { z: 1.0, dir: -1 }, { z: -3.0, dir: -1 } ].map((cyl, i) => (
      <group key={i}>
        <mesh position={[1.5 * cyl.dir, 3.4, cyl.z]} rotation={[0, 0, (Math.PI/4) * cyl.dir]}>
          <cylinderGeometry args={[0.3, 0.3, 2.5, 16]} />
          <meshStandardMaterial color="#222" roughness={0.8} />
        </mesh>
        <mesh position={[2.5 * cyl.dir, 3.3, cyl.z]} rotation={[0, 0, (Math.PI/4) * cyl.dir]}>
          <cylinderGeometry args={[0.12, 0.12, 0.6, 12]} />
          <meshStandardMaterial color="#44aa44" metalness={0.6} />
        </mesh>
      </group>
    ))}
    <mesh position={[2.5, 3.5, 0]} rotation={[Math.PI/2, 0, 0]}>
      <cylinderGeometry args={[0.08, 0.08, 8, 8]} />
      <meshStandardMaterial color="#aaa" metalness={0.8} />
    </mesh>
    <mesh position={[-2.5, 3.5, 0]} rotation={[Math.PI/2, 0, 0]}>
      <cylinderGeometry args={[0.08, 0.08, 8, 8]} />
      <meshStandardMaterial color="#aaa" metalness={0.8} />
    </mesh>
  </group>
);

const IgnitionSystem = () => (
  <group position={[0, 3.6, -4.5]}>
    <mesh position={[0.6, 0, 0]}>
      <boxGeometry args={[0.8, 0.8, 1.2]} />
      <meshStandardMaterial color="#cc3333" metalness={0.5} roughness={0.6} />
    </mesh>
    <mesh position={[-0.6, 0, 0]}>
      <boxGeometry args={[0.8, 0.8, 1.2]} />
      <meshStandardMaterial color="#cc3333" metalness={0.5} roughness={0.6} />
    </mesh>
    <mesh position={[0, -0.3, 2.0]} rotation={[Math.PI/2, 0, 0]}>
      <cylinderGeometry args={[0.15, 0.15, 4.0, 16]} />
      <meshStandardMaterial color="#ffaa00" roughness={0.6} />
    </mesh>
  </group>
);

const ECU = () => (
  <group position={[-2.05, -2.5, 1.0]} rotation={[0, 0, Math.PI/2]}>
    <mesh>
      <boxGeometry args={[1.5, 0.2, 2.0]} />
      <meshStandardMaterial color="#555" metalness={0.8} roughness={0.4} />
    </mesh>
    {[-0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8].map((z, i) => (
      <mesh key={i} position={[0, 0.15, z]}>
        <boxGeometry args={[1.4, 0.1, 0.05]} />
        <meshStandardMaterial color="#444" metalness={0.9} />
      </mesh>
    ))}
    <mesh position={[0.6, 0.1, 1.0]}>
      <boxGeometry args={[0.6, 0.3, 0.2]} />
      <meshStandardMaterial color="#111" />
    </mesh>
  </group>
);

// --- Cylinder Assembly ---

const VCylinder = ({ zPos, bankAngle, phaseOffset, rpm, isFaulty, label, cht }: any) => {
  const pistonRef = useRef<THREE.Group>(null);
  const conRodRef = useRef<THREE.Group>(null);
  const crankPinRef = useRef<THREE.Group>(null);
  const crankThrowRef = useRef<THREE.Group>(null);
  
  const inValveRef = useRef<THREE.Group>(null);
  const exValveRef = useRef<THREE.Group>(null);
  const inRockerRef = useRef<THREE.Group>(null);
  const exRockerRef = useRef<THREE.Group>(null);
  const inPushrodRef = useRef<THREE.Group>(null);
  const exPushrodRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    const angVel = (rpm / 60) * Math.PI * 2;
    timeRef.current += angVel * delta;
    const theta = timeRef.current + phaseOffset;

    const R = CRANK_RADIUS;
    const L = CON_ROD_LENGTH;
    const relAngle = theta - bankAngle;
    const disp = R * Math.cos(relAngle) + Math.sqrt(L * L - R * R * Math.sin(relAngle) * Math.sin(relAngle));

    const crankX = R * Math.cos(theta);
    const crankY = R * Math.sin(theta);
    const pistonX = disp * Math.cos(bankAngle);
    const pistonY = disp * Math.sin(bankAngle);

    if (pistonRef.current) pistonRef.current.position.x = disp;
    if (crankPinRef.current) crankPinRef.current.position.set(crankX, crankY, 0);
    if (crankThrowRef.current) crankThrowRef.current.rotation.z = theta;

    if (conRodRef.current) {
      const midX = (pistonX + crankX) / 2;
      const midY = (pistonY + crankY) / 2;
      conRodRef.current.position.set(midX, midY, 0);
      conRodRef.current.rotation.z = Math.atan2(pistonY - crankY, pistonX - crankX);
    }

    const inLift = valveLift(theta, 0, Math.PI);
    const exLift = valveLift(theta, 3 * Math.PI, 4 * Math.PI);

    if (inValveRef.current) inValveRef.current.position.x = 4.8 - inLift;
    if (exValveRef.current) exValveRef.current.position.x = 4.8 - exLift;

    if (inPushrodRef.current) inPushrodRef.current.position.x = 2.0 + inLift;
    if (exPushrodRef.current) exPushrodRef.current.position.x = 2.0 + exLift;

    if (inRockerRef.current) inRockerRef.current.rotation.z = -inLift * 1.5;
    if (exRockerRef.current) exRockerRef.current.rotation.z = -exLift * 1.5;
  });

  const glowColor = new THREE.Color(isFaulty ? '#ff2222' : '#ff7722');

  return (
    <group position={[0, 0, zPos]}>
      <group ref={crankThrowRef}>
         <mesh position={[CRANK_RADIUS / 2, 0, 0.2]}>
            <boxGeometry args={[CRANK_RADIUS * 1.2, 0.6, 0.15]} />
            <meshStandardMaterial color="#555" metalness={0.8} />
         </mesh>
         <mesh position={[CRANK_RADIUS / 2, 0, -0.2]}>
            <boxGeometry args={[CRANK_RADIUS * 1.2, 0.6, 0.15]} />
            <meshStandardMaterial color="#555" metalness={0.8} />
         </mesh>
         <mesh position={[-CRANK_RADIUS / 2, 0, 0.2]}>
            <cylinderGeometry args={[0.4, 0.4, 0.15, 16]} />
            <meshStandardMaterial color="#444" metalness={0.8} />
         </mesh>
         <mesh position={[-CRANK_RADIUS / 2, 0, -0.2]}>
            <cylinderGeometry args={[0.4, 0.4, 0.15, 16]} />
            <meshStandardMaterial color="#444" metalness={0.8} />
         </mesh>
      </group>

      <group ref={crankPinRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.45, 24]} />
          <meshStandardMaterial color="#aaa" metalness={0.9} />
        </mesh>
      </group>

      <group ref={conRodRef}>
        <mesh>
          <boxGeometry args={[CON_ROD_LENGTH - 0.7, 0.25, 0.15]} />
          <meshStandardMaterial color="#888" metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh>
          <boxGeometry args={[CON_ROD_LENGTH - 0.7, 0.15, 0.25]} />
          <meshStandardMaterial color="#888" metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[-CON_ROD_LENGTH / 2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.25, 32]} />
          <meshStandardMaterial color="#777" metalness={0.8} />
        </mesh>
        <mesh position={[CON_ROD_LENGTH / 2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.25, 32]} />
          <meshStandardMaterial color="#777" metalness={0.8} />
        </mesh>
      </group>

      <group rotation={[0, 0, bankAngle]}>
        <mesh position={[2.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.0, 1.0, 3.2, 32]} />
          <meshPhysicalMaterial color="#aaccff" transparent opacity={isFaulty ? 0.35 : 0.15} transmission={0.95} roughness={0.1} />
        </mesh>
        <mesh position={[2.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.88, 0.88, 3.1, 32]} />
          <meshStandardMaterial color="#222" side={THREE.BackSide} metalness={0.5} />
        </mesh>
        {[1.4, 1.8, 2.2, 2.6, 3.0, 3.4].map((fx, i) => (
          <mesh key={i} position={[fx, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[1.25, 1.25, 0.08, 32]} />
            <meshStandardMaterial color="#444" transparent opacity={0.5} metalness={0.5} />
          </mesh>
        ))}

        <mesh position={[4.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.1, 1.1, 0.6, 8]} />
          <meshStandardMaterial color="#333" metalness={0.7} roughness={0.6} />
        </mesh>

        <DetailedSparkPlug position={[4.7, 0, 0]} rotation={[0, 0, -Math.PI/2]} />

        <group ref={inValveRef} position={[4.8, 0, 0.5]}>
          <mesh rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.04, 0.04, 1.2]} />
            <meshStandardMaterial color="#ccc" metalness={0.9} />
          </mesh>
          <mesh position={[-0.55, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.4, 0.04, 0.2, 24]} />
            <meshStandardMaterial color="#aaa" metalness={0.8} />
          </mesh>
          <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.25, 0.25, 0.08, 16]} />
            <meshStandardMaterial color="#444" />
          </mesh>
          <group position={[0.1, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <HelixSpring length={0.7} radius={0.22} coils={7} />
          </group>
        </group>

        <group ref={exValveRef} position={[4.8, 0, -0.5]}>
          <mesh rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.04, 0.04, 1.2]} />
            <meshStandardMaterial color="#ccc" metalness={0.9} />
          </mesh>
          <mesh position={[-0.55, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.35, 0.04, 0.2, 24]} />
            <meshStandardMaterial color="#aaa" metalness={0.8} />
          </mesh>
          <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.25, 0.25, 0.08, 16]} />
            <meshStandardMaterial color="#444" />
          </mesh>
          <group position={[0.1, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <HelixSpring length={0.7} radius={0.22} coils={7} />
          </group>
        </group>

        <group ref={inRockerRef} position={[4.9, 0.4, 0.5]}>
          <DetailedRockerArm />
        </group>
        <group ref={exRockerRef} position={[4.9, 0.4, -0.5]}>
          <DetailedRockerArm />
        </group>

        <group ref={inPushrodRef} position={[2.0, 0.95, 0.5]}>
          <mesh position={[1.4, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.05, 0.05, 2.8, 12]} />
            <meshStandardMaterial color="#aaa" metalness={0.8} />
          </mesh>
        </group>
        <group ref={exPushrodRef} position={[2.0, 0.95, -0.5]}>
          <mesh position={[1.4, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.05, 0.05, 2.8, 12]} />
            <meshStandardMaterial color="#aaa" metalness={0.8} />
          </mesh>
        </group>

        <group ref={pistonRef}>
          <group rotation={[0, 0, Math.PI / 2]}>
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.87, 0.87, 0.7, 32]} />
              <meshStandardMaterial color="#ccc" metalness={0.6} />
            </mesh>
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.85, 0.87, 0.2, 32]} />
              <meshStandardMaterial color="#eee" metalness={0.5} roughness={0.5} />
            </mesh>
            {[0.1, 0.18, 0.26].map((ry, i) => (
              <mesh key={i} position={[0, ry, 0]} rotation={[Math.PI/2, 0, 0]}>
                <torusGeometry args={[0.86, 0.03, 16, 32]} />
                <meshStandardMaterial color="#333" metalness={0.9} />
              </mesh>
            ))}
          </group>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.35, 0.35, 1.6, 24]} />
            <meshStandardMaterial color="#aaa" metalness={0.8} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 1.62, 24]} />
            <meshStandardMaterial color="#111" side={THREE.BackSide} />
          </mesh>
        </group>

        {isFaulty && <pointLight position={[4.0, 0, 0]} color={glowColor} intensity={8} distance={6} />}
        
        <Text position={[5.8, 1.0, 0]} rotation={[0, 0, -bankAngle]} fontSize={0.5} color={isFaulty ? '#ff5555' : '#8888aa'} anchorX="center" anchorY="middle">
          {label}
        </Text>
      </group>
    </group>
  );
};

// Main Crankshaft
const Crankshaft = () => {
  const shaftLength = CYLINDER_SPACING * 3 + 4.0;
  return (
    <group position={[0, 0, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, shaftLength, 32]} />
        <meshStandardMaterial color="#777" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, -shaftLength / 2 + 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 0.6, 64]} />
        <meshStandardMaterial color="#444" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, -shaftLength / 2 + 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.05, 16, 128]} />
        <meshStandardMaterial color="#888" metalness={0.9} />
      </mesh>
    </group>
  );
};

const TimingSystem = ({ rpm, rightBank, leftBank }: any) => {
  const crankGearRef = useRef<THREE.Group>(null);
  const camGearRef = useRef<THREE.Group>(null);
  const camShaftRef = useRef<THREE.Group>(null);
  const accessoryGearRef = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    const angVel = (rpm / 60) * Math.PI * 2;
    if (crankGearRef.current) crankGearRef.current.rotation.z += angVel * delta;
    if (camGearRef.current) camGearRef.current.rotation.z -= (angVel / 2) * delta;
    if (camShaftRef.current) camShaftRef.current.rotation.z -= (angVel / 2) * delta;
    if (accessoryGearRef.current) accessoryGearRef.current.rotation.z -= (angVel * 1.5) * delta;
  });

  const frontZ = CYLINDER_SPACING * 1.5 + 1.5;

  return (
    <group>
      <group position={[0, 0, frontZ]}>
        <group ref={crankGearRef}>
          <Gear radius={0.8} teeth={24} thickness={0.4} color="#888" />
        </group>
        <group ref={camGearRef} position={[0, 1.8, 0]}>
          <Gear radius={1.6} teeth={48} thickness={0.4} color="#999" />
        </group>
        <group ref={accessoryGearRef} position={[2.0, -0.6, 0]}>
          <Gear radius={0.6} teeth={18} thickness={0.3} color="#666" />
        </group>
        <mesh position={[0.2, 0.6, 0.5]}>
          <boxGeometry args={[5.0, 5.5, 0.8]} />
          <meshPhysicalMaterial color="#333340" transparent opacity={0.15} transmission={0.95} roughness={0.1} />
        </mesh>
        {[[-2.2, 3.2], [2.6, 3.2], [-2.2, -2.0], [2.6, -2.0]].map((p, i) => (
           <mesh key={i} position={[p[0], p[1], 0.9]} rotation={[Math.PI/2, 0, 0]}>
             <cylinderGeometry args={[0.08, 0.08, 0.1, 6]} />
             <meshStandardMaterial color="#aaa" />
           </mesh>
        ))}
      </group>

      <group ref={camShaftRef} position={[0, 1.8, 0]}>
        <mesh rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.25, CYLINDER_SPACING * 3 + 2.5, 24]} />
          <meshStandardMaterial color="#666" metalness={0.8} />
        </mesh>
        {[-1.5, -0.5, 0.5, 1.5].map((z, i) => {
           const baseAngle = (i === 1 || i === 2) ? Math.PI : 0;
           const bank = (i === 0 || i === 2) ? rightBank : leftBank;
           const visualAngle = baseAngle - bank;
           return (
            <group key={i} position={[0, 0, -z * CYLINDER_SPACING]}>
              <CamLobe rotationZ={visualAngle} position={[0, 0, 0.5]} />
              <CamLobe rotationZ={visualAngle + Math.PI} position={[0, 0, -0.5]} />
            </group>
          )
        })}
      </group>
    </group>
  );
};

export default function Engine3DView({ currentData, height = '700px' }: { currentData: any; height?: string }) {
  const rpm = currentData?.rpm || 0;
  const faultLabel = currentData?.fault_label || 'HEALTHY';
  
  const rightBank = Math.PI / 4;
  const leftBank = (3 * Math.PI) / 4;

  return (
    <div className="panel" style={{ height, width: '100%', padding: 0, overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, background: 'rgba(0,0,0,0.7)', padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid rgba(100,150,255,0.3)', backdropFilter: 'blur(8px)' }}>
        <h3 style={{ margin: 0, color: '#6ea8fe', fontSize: '1.1rem', letterSpacing: '0.5px' }}>Aero V-4 OHV Digital Twin</h3>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#aaa' }}>
          <span style={{ color: '#fff', fontWeight: 'bold' }}>{rpm.toFixed(0)}</span> RPM &nbsp;•&nbsp; 
          <span style={{ color: faultLabel !== 'HEALTHY' ? '#ff5555' : '#44ee44' }}>{faultLabel}</span>
        </p>
      </div>

      <Canvas camera={{ position: [0, 12, 22], fov: 45 }}>
        <color attach="background" args={['#040406']} />

        <ambientLight intensity={0.6} />
        <directionalLight position={[12, 18, 12]} intensity={2.5} castShadow />
        <pointLight position={[0, 3, 5]} intensity={1.2} color="#4488cc" />
        <pointLight position={[0, -5, 0]} intensity={0.5} color="#cc6644" />

        <group position={[0, -0.5, 0]}>
          
          {/* New Auxiliary Systems */}
          <Turbocharger />
          <StarterMotor />
          <Alternator />
          <IntakeManifold />
          <IgnitionSystem />
          <ECU />

          {/* Main Engine Block Base / Oil Pan */}
          <mesh position={[0, -2.5, 0]}>
            <boxGeometry args={[4.0, 2.0, CYLINDER_SPACING * 3 + 2.5]} />
            <meshStandardMaterial color="#1a1a1f" metalness={0.7} roughness={0.8} />
          </mesh>
          {[-2, -1, 0, 1, 2].map((z, i) => (
             <mesh key={i} position={[0, -3.6, z * CYLINDER_SPACING * 0.7]}>
               <boxGeometry args={[3.8, 0.2, 0.1]} />
               <meshStandardMaterial color="#111" />
             </mesh>
          ))}

          {/* Transparent Upper V-Block Crankcase */}
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[3.2, 4.0, CYLINDER_SPACING * 3 + 1.8]} />
            <meshPhysicalMaterial color="#333340" transparent opacity={0.15} transmission={0.95} roughness={0.1} />
          </mesh>

          <Crankshaft />
          <TimingSystem rpm={rpm} rightBank={rightBank} leftBank={leftBank} />

          {/* Right Bank */}
          <VCylinder zPos={CYLINDER_SPACING * 1.5} bankAngle={rightBank} phaseOffset={0} rpm={rpm} isFaulty={faultLabel.includes('CYL1')} label="CYL 1" cht={currentData?.cht_1_c || 150} />
          <VCylinder zPos={-CYLINDER_SPACING * 0.5} bankAngle={rightBank} phaseOffset={Math.PI} rpm={rpm} isFaulty={faultLabel.includes('CYL3')} label="CYL 3" cht={currentData?.cht_3_c || 150} />

          {/* Left Bank */}
          <VCylinder zPos={CYLINDER_SPACING * 0.5} bankAngle={leftBank} phaseOffset={Math.PI} rpm={rpm} isFaulty={faultLabel.includes('CYL2')} label="CYL 2" cht={currentData?.cht_2_c || 150} />
          <VCylinder zPos={-CYLINDER_SPACING * 1.5} bankAngle={leftBank} phaseOffset={0} rpm={rpm} isFaulty={faultLabel.includes('CYL4')} label="CYL 4" cht={currentData?.cht_4_c || 150} />
        </group>

        <ContactShadows resolution={2048} scale={40} blur={2.0} opacity={0.7} far={20} color="#000" position={[0, -4.0, 0]} />
        <Environment preset="city" />
        <OrbitControls enablePan enableZoom enableRotate minDistance={8} maxDistance={40} target={[0, 0, 0]} />
      </Canvas>
    </div>
  );
}
