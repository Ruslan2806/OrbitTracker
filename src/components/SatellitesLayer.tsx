import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, InstancedMesh, Object3D } from 'three';
import { geodeticToVector } from '../utils/coords';
import type { SatellitePosition } from '../hooks/useSatellitePositions';
import { GROUPS } from '../hooks/groups';

export const MAX_SATELLITES = GROUPS.reduce((total, group) => total + group.limit, 0);

export function SatellitesLayer({
  positionsRef,
  onHover,
}: {
  positionsRef: React.MutableRefObject<SatellitePosition[]>;
  onHover: (position: SatellitePosition | null) => void;
}) {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const lastPositions = useRef<SatellitePosition[] | null>(null);

  useEffect(() => {
    if (meshRef.current) meshRef.current.instanceMatrix.setUsage(35048);
  }, []);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const source = positionsRef.current;
    const changed = source !== lastPositions.current;
    if (!changed) return;
    lastPositions.current = source;
    const positions = source.slice(0, MAX_SATELLITES);
    for (let index = 0; index < positions.length; index += 1) {
      const satellite = positions[index];
      dummy.position.copy(geodeticToVector(satellite.lat, satellite.lng, satellite.alt));
      dummy.scale.setScalar(0.012);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      mesh.setColorAt(index, new Color(satellite.color));
    }
    mesh.count = positions.length;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    // Raycasting uses the InstancedMesh bounds; refresh them after satellites move,
    // otherwise satellites on higher orbits can sit outside the original bounds.
    mesh.computeBoundingSphere();
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, MAX_SATELLITES]}
      frustumCulled={false}
      onPointerMove={(event) => {
        event.stopPropagation();
        const position = event.instanceId === undefined ? undefined : positionsRef.current[event.instanceId];
        onHover(position ?? null);
      }}
      onPointerOut={() => onHover(null)}
    >
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#ffffff" toneMapped={false} />
    </instancedMesh>
  );
}
