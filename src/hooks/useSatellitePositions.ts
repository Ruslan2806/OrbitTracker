import { useEffect, useMemo, useRef } from 'react';
import * as satellite from 'satellite.js';
import type { GroupId } from './groups';
import { getGroup } from './groups';
import type { OrbitalRecord } from './useOrbitalGroups';

export interface SatellitePosition {
  noradId: string;
  lat: number;
  lng: number;
  alt: number;
  color: string;
  name: string;
  group: GroupId;
}

function getSatrec(record: OrbitalRecord) {
  try {
    return satellite.json2satrec(record);
  } catch {
    return null;
  }
}

export function useSatellitePositions(groups: { id: GroupId; records: OrbitalRecord[] }[]) {
  const positionsRef = useRef<SatellitePosition[]>([]);
  const elements = useMemo(() => {
    const seenIds = new Set<string>();
    return groups.flatMap(({ id, records }) => records.flatMap((record) => {
      const noradId = String(record.NORAD_CAT_ID);
      if (seenIds.has(noradId)) return [];
      seenIds.add(noradId);
      const satrec = getSatrec(record);
      return satrec ? [{ record, satrec, color: getGroup(id).color, group: id }] : [];
    }));
  }, [groups]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    const update = () => {
      const now = new Date();
      const next: SatellitePosition[] = [];
      for (const { record, satrec, color, group } of elements) {
        try {
          const position = satellite.propagate(satrec, now)?.position;
          if (!position || typeof position === 'boolean') continue;
          const geodetic = satellite.eciToGeodetic(position, satellite.gstime(now));
          next.push({
            noradId: String(record.NORAD_CAT_ID),
            lat: satellite.degreesLat(geodetic.latitude),
            lng: satellite.degreesLong(geodetic.longitude),
            alt: geodetic.height,
            color,
            name: record.OBJECT_NAME,
            group,
          });
        } catch { /* Ignore malformed or decayed orbit records. */ }
      }
      positionsRef.current = next;
    };
    update();
    timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [elements]);

  return positionsRef;
}
