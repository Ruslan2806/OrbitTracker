import { useEffect, useState } from 'react';
import { getGroup, type GroupId } from './groups';

export interface TleRecord {
  name: string;
  line1: string;
  line2: string;
}

interface CacheEntry {
  savedAt: number;
  records: TleRecord[];
}

const CACHE_TTL = 2 * 60 * 60 * 1000;

function parseTle(text: string, limit?: number): TleRecord[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const records: TleRecord[] = [];
  for (let index = 0; index < lines.length - 2; index += 1) {
    if (lines[index + 1].startsWith('1 ') && lines[index + 2].startsWith('2 ')) {
      records.push({ name: lines[index].replace(/^0\s*/, ''), line1: lines[index + 1], line2: lines[index + 2] });
      index += 2;
    }
  }
  return typeof limit === 'number' ? records.slice(0, limit) : records;
}

function getCachedRecords(id: GroupId): TleRecord[] | null {
  try {
    const raw = localStorage.getItem(`tle:${id}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (Date.now() - entry.savedAt > CACHE_TTL || !Array.isArray(entry.records)) return null;
    return entry.records;
  } catch {
    return null;
  }
}

export function useTleGroup(id: GroupId, enabled: boolean) {
  const [records, setRecords] = useState<TleRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const group = getGroup(id);
    const cached = getCachedRecords(id);
    if (cached) {
      setRecords(cached);
      setError(null);
      return () => { active = false; };
    }

    setLoading(true);
    setError(null);
    setRecords([]);
    fetch(`https://celestrak.org/NORAD/elements/gp.php?GROUP=${group.source}&FORMAT=tle`)
      .then((response) => {
        if (!response.ok) throw new Error(response.status === 403 ? 'CelesTrak временно отклонил запрос (403).' : `Ошибка загрузки: ${response.status}`);
        return response.text();
      })
      .then((text) => {
        const parsed = parseTle(text, group.limit);
        if (!parsed.length) throw new Error('Источник не вернул элементы TLE.');
        if (!active) return;
        setRecords(parsed);
        try { localStorage.setItem(`tle:${id}`, JSON.stringify({ savedAt: Date.now(), records: parsed } satisfies CacheEntry)); } catch { /* cache is optional */ }
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : 'Не удалось загрузить данные.');
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [id, enabled]);

  return { records, loading, error };
}
