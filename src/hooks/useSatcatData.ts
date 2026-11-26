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

function toRecord(row: Record<string, string | number | null>): SatcatRecord {
  return {
    name: String(row.OBJECT_NAME ?? ''),
    internationalId: String(row.OBJECT_ID ?? ''),
    type: String(row.OBJECT_TYPE ?? ''),
    status: String(row.OPS_STATUS_CODE ?? ''),
    owner: String(row.OWNER ?? ''),
    launchDate: String(row.LAUNCH_DATE ?? ''),
    launchSite: String(row.LAUNCH_SITE ?? ''),
    decayDate: String(row.DECAY_DATE ?? ''),
    period: row.PERIOD ?? null,
    inclination: row.INCLINATION ?? null,
    apogee: row.APOGEE ?? null,
    perigee: row.PERIGEE ?? null,
  };
}

export function useSatcatData(noradId: string | null) {
  const [savedRecord, setSavedRecord] = useState<{ noradId: string | null; record: SatcatRecord | null }>({ noradId: null, record: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!noradId) {
      setSavedRecord({ noradId: null, record: null });
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setSavedRecord({ noradId, record: null });
    setLoading(true);
    const params = new URLSearchParams({ CATNR: noradId, FORMAT: 'JSON' });
    const timer = window.setTimeout(() => {
      fetch(`https://celestrak.org/satcat/records.php?${params}`, { signal: controller.signal, cache: 'no-store' })
        .then((response) => {
          if (!response.ok) throw new Error(`SATCAT: ${response.status}`);
          return response.json() as Promise<unknown>;
        })
        .then((data) => {
          if (controller.signal.aborted) return;
          const row = Array.isArray(data) ? data[0] : null;
          const nextRecord = row && typeof row === 'object' ? toRecord(row as Record<string, string | number | null>) : null;
          setSavedRecord({ noradId, record: nextRecord });
        })
        .catch(() => { /* Ignore aborted or failed requests. */ })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [noradId]);

  return { record: savedRecord.noradId === noradId ? savedRecord.record : null, loading };
}
