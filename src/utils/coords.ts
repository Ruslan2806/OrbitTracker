import { Vector3 } from 'three';

export function geodeticToVector(latitude: number, longitude: number, altitudeKm: number): Vector3 {
  const radius = 1 + altitudeKm / 6371;
  const lat = (latitude * Math.PI) / 180;
  const lng = (longitude * Math.PI) / 180;
  return new Vector3(radius * Math.cos(lat) * Math.cos(lng), radius * Math.sin(lat), -radius * Math.cos(lat) * Math.sin(lng));
}
