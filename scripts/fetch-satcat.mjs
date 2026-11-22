import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const outputPath = resolve('public/data/satcat.json');
const refreshInterval = 24 * 60 * 60 * 1000;
const groups = [
  { name: 'STARLINK', max: 500 },
  { name: 'STATIONS' },
  { name: 'GPS-OPS' },
  { name: 'WEATHER' },
];

function readExisting() {
  if (!existsSync(outputPath)) return null;
  try {
    return JSON.parse(readFileSync(outputPath, 'utf8'));
  } catch {
    return null;
  }
}

const existing = readExisting();
if (existing?.fetchedAt && Date.now() - Date.parse(existing.fetchedAt) < refreshInterval) {
  console.log(`Using CelesTrak SATCAT snapshot from ${existing.fetchedAt}`);
  process.exit(0);
}

try {
  const datasets = await Promise.all(groups.map(async ({ name, max }) => {
    const params = new URLSearchParams({ GROUP: name, FORMAT: 'JSON' });
    if (max) params.set('MAX', String(max));
    const url = `https://celestrak.org/satcat/records.php?${params}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
    const rows = await response.json();
    if (!Array.isArray(rows) || rows.length === 0) throw new Error(`${name}: empty or invalid SATCAT response`);
    return rows;
  }));

  const records = {};
  for (const rows of datasets) {
    for (const row of rows) {
      if (!row.NORAD_CAT_ID) continue;
      records[String(row.NORAD_CAT_ID)] = {
        name: row.OBJECT_NAME ?? '',
        internationalId: row.OBJECT_ID ?? '',
        type: row.OBJECT_TYPE ?? '',
        status: row.OPS_STATUS_CODE ?? '',
        owner: row.OWNER ?? '',
        launchDate: row.LAUNCH_DATE ?? '',
        launchSite: row.LAUNCH_SITE ?? '',
        decayDate: row.DECAY_DATE ?? '',
        period: row.PERIOD ?? null,
        inclination: row.INCLINATION ?? null,
        apogee: row.APOGEE ?? null,
        perigee: row.PERIGEE ?? null,
      };
    }
  }

  const snapshot = { source: 'CelesTrak SATCAT', fetchedAt: new Date().toISOString(), records };
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(snapshot)}\n`);
  console.log(`Saved ${Object.keys(records).length} CelesTrak SATCAT records`);
} catch (error) {
  if (!existing) {
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, JSON.stringify({ source: 'CelesTrak SATCAT', fetchedAt: null, records: {} }) + '\n');
  }
  console.warn(`Could not refresh CelesTrak SATCAT; keeping the previous snapshot. ${error instanceof Error ? error.message : error}`);
}
