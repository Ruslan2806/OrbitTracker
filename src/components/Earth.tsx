import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { RepeatWrapping } from 'three';

export function Earth() {
  const texture = useTexture(`${import.meta.env.BASE_URL}textures/earth.jpg`);
  const alignedTexture = useMemo(() => {
    texture.wrapS = RepeatWrapping;
    texture.repeat.x = -1;
    texture.offset.x = 1;
    texture.needsUpdate = true;
    return texture;
  }, [texture]);

  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial map={alignedTexture} roughness={0.92} metalness={0.02} />
    </mesh>
  );
}
