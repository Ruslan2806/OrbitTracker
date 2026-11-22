import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Earth } from './Earth';
import { SatellitesLayer } from './SatellitesLayer';
import type { SatellitePosition } from '../hooks/useSatellitePositions';

export function GlobeScene({
  positionsRef,
  onHover,
}: {
  positionsRef: React.MutableRefObject<SatellitePosition[]>;
  onHover: (position: SatellitePosition | null) => void;
}) {
  return (
    <Canvas camera={{ position: [0, 0.25, 3.4], fov: 42 }} dpr={[1, 1.7]} gl={{ antialias: true, alpha: false }}>
      <color attach="background" args={['#050b13']} />
      <ambientLight intensity={1.05} />
      <directionalLight position={[4, 3, 4]} intensity={2.1} />
      <Suspense fallback={null}>
        <Earth />
        <SatellitesLayer positionsRef={positionsRef} onHover={onHover} />
      </Suspense>
      <Stars radius={80} depth={45} count={1600} factor={3} saturation={0.2} fade speed={0.2} />
      <OrbitControls enablePan={false} minDistance={1.35} maxDistance={7} rotateSpeed={0.55} zoomSpeed={0.7} />
    </Canvas>
  );
}
