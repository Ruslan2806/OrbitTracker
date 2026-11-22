import { useEffect, useMemo, useRef } from 'react';
import * as satellite from 'satellite.js';
import type { GroupId } from './groups';
import { getGroup } from './groups';
import type { TleRecord } from './useTleGroup';

export interface SatellitePosition {
  lat: number;
  lng: number;
  alt: number;
  color: string;
  name: string;
  group: GroupId;
}

export function useSatellitePositions(groups: { id: GroupId; records: TleRecord[] }[]) {
  const positionsRef = useRef<SatellitePosition[]>([]);
  const elements = useMemo(() => groups.flatMap(({ id, records }) => records.map((record) => ({ record, color: getGroup(id).color, group: id }))), [groups]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    const update = () => {
      const now = new Date();
      const next: SatellitePosition[] = [];
      for (const { record, color, group } of elements) {
        try {
          const satrec = satellite.twoline2satrec(record.line1, record.line2);
          const position = satellite.propagate(satrec, now)?.position;
          if (!position || typeof position === 'boolean') continue;
          const geodetic = satellite.eciToGeodetic(position, satellite.gstime(now));
          next.push({
            lat: satellite.degreesLat(geodetic.latitude),
            lng: satellite.degreesLong(geodetic.longitude),
            alt: geodetic.height,
            color,
            name: record.name,
            group,
          });
        } catch { /* skip malformed or decayed TLE records */ }
      }
      positionsRef.current = next;
    };
    update();
    timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [elements]);

  return positionsRef;
}
