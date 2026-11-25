import { useEffect, useRef, useState } from 'react';
import type { OMMJsonObject } from 'satellite.js';
import { GROUPS, type GroupId } from './groups';

export type OrbitalRecord = OMMJsonObject;

interface CacheEntry {
  savedAt: number;
  records: OrbitalRecord[];
}

const CACHE_TTL = 2 * 60 * 60 * 1000;

function getCachedRecords(id: GroupId): OrbitalRecord[] | null {
  try {
    const raw = localStorage.getItem(`orbit:${id}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (Date.now() - entry.savedAt > CACHE_TTL || !Array.isArray(entry.records)) return null;
    return entry.records;
  } catch {
    return null;
  }
}

function parseCsv(text: string): OrbitalRecord[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const input = text.replace(/^\uFEFF/, '');

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (quoted) {
      if (char === '"' && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"' && field.length === 0) quoted = true;
    else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && input[index + 1] === '\n') index += 1;
      row.push(field);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = '';
    } else field += char;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  const [headers, ...dataRows] = rows;
  if (!headers) return [];
  return dataRows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])) as unknown as OrbitalRecord)
    .filter((record) => Boolean(record.NORAD_CAT_ID && record.OBJECT_NAME && record.EPOCH));
}

export interface OrbitalGroupState {
  records: OrbitalRecord[];
  loading: boolean;
  error: string | null;
}

const emptyStates = () => Object.fromEntries(GROUPS.map(({ id }) => [id, { records: [], loading: false, error: null }])) as Record<GroupId, OrbitalGroupState>;

export function useOrbitalGroups(enabledGroups: Set<GroupId>) {
  const [states, setStates] = useState<Record<GroupId, OrbitalGroupState>>(emptyStates);
  const inFlight = useRef(new Set<GroupId>());

  useEffect(() => {
    let disposed = false;
    const pending = GROUPS.filter(({ id }) => enabledGroups.has(id));
    let nextIndex = 0;

    const loadNext = async () => {
      while (!disposed) {
        const group = pending[nextIndex++];
        if (!group) return;

        const cached = getCachedRecords(group.id);
        if (cached) {
          setStates((current) => ({ ...current, [group.id]: { records: cached.slice(0, group.limit), loading: false, error: null } }));
          continue;
        }
        if (inFlight.current.has(group.id)) continue;

        inFlight.current.add(group.id);
        setStates((current) => ({ ...current, [group.id]: { records: [], loading: true, error: null } }));
        try {
          const params = new URLSearchParams({ [group.query ?? 'GROUP']: group.source, FORMAT: 'CSV' });
          const response = await fetch(`https://celestrak.org/NORAD/elements/gp.php?${params}`);
          if (!response.ok) throw new Error(response.status === 403 ? 'CelesTrak временно отклонил запрос (403).' : `Ошибка загрузки: ${response.status}`);
          const records = parseCsv(await response.text()).slice(0, group.limit);
          if (!records.length) throw new Error('Источник не вернул орбитальные элементы.');

          setStates((current) => ({ ...current, [group.id]: { records, loading: false, error: null } }));
          try { localStorage.setItem(`orbit:${group.id}`, JSON.stringify({ savedAt: Date.now(), records } satisfies CacheEntry)); } catch { /* Browser storage is optional. */ }
        } catch (reason: unknown) {
          setStates((current) => ({ ...current, [group.id]: { records: [], loading: false, error: reason instanceof Error ? reason.message : 'Не удалось загрузить данные.' } }));
        } finally {
          inFlight.current.delete(group.id);
        }
      }
    };

    void Promise.all([loadNext(), loadNext(), loadNext()]);
    return () => { disposed = true; };
  }, [enabledGroups]);

  return states;
}
