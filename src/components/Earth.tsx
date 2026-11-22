import { useTexture } from '@react-three/drei';

export function Earth() {
  const texture = useTexture(`${import.meta.env.BASE_URL}textures/earth.jpg`);
  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial map={texture} roughness={0.92} metalness={0.02} />
    </mesh>
  );
}
