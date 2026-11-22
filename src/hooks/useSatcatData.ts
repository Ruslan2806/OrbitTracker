import { useEffect, useState } from 'react';

export interface SatcatRecord {
  name: string;
  internationalId: string;
  type: string;
  status: string;
  owner: string;
  launchDate: string;
  launchSite: string;
  decayDate: string;
  period: number | string | null;
  inclination: number | string | null;
  apogee: number | string | null;
  perigee: number | string | null;
}

interface SatcatSnapshot {
  fetchedAt: string | null;
  records: Record<string, SatcatRecord>;
}

export function useSatcatData() {
  const [snapshot, setSnapshot] = useState<SatcatSnapshot>({ fetchedAt: null, records: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`${import.meta.env.BASE_URL}data/satcat.json`, { cache: 'no-cache' })
      .then((response) => {
        if (!response.ok) throw new Error(`SATCAT snapshot: ${response.status}`);
        return response.json() as Promise<SatcatSnapshot>;
      })
      .then((data) => {
        if (active && data.records && typeof data.records === 'object') setSnapshot(data);
      })
      .catch(() => { /* Orbit tracking remains available if the metadata snapshot is missing. */ })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return { ...snapshot, loading };
}
