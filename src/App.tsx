import { useCallback, useMemo, useState } from 'react';
import { GlobeScene } from './components/GlobeScene';
import { UIOverlay } from './components/UIOverlay';
import { useSatellitePositions } from './hooks/useSatellitePositions';
import type { SatellitePosition } from './hooks/useSatellitePositions';
import { GROUPS, type GroupId } from './hooks/groups';
import { useTleGroup } from './hooks/useTleGroup';
import './styles.css';

export default function App() {
  const [selectedGroups, setSelectedGroups] = useState<Set<GroupId>>(() => new Set(['stations']));
  const [hovered, setHovered] = useState<SatellitePosition | null>(null);
  const starlink = useTleGroup('starlink', selectedGroups.has('starlink'));
  const stations = useTleGroup('stations', selectedGroups.has('stations'));
  const gps = useTleGroup('gps', selectedGroups.has('gps'));
  const weather = useTleGroup('weather', selectedGroups.has('weather'));
  const hooks = { starlink, stations, gps, weather };
  const groups = useMemo(() => GROUPS
    .filter(({ id }) => selectedGroups.has(id))
    .map(({ id }) => ({ id, records: hooks[id].records })),
  [selectedGroups, starlink.records, stations.records, gps.records, weather.records]);
  const positionsRef = useSatellitePositions(groups);
  const visibleCount = Math.min(groups.reduce((sum, group) => sum + group.records.length, 0), 1000);

  const onToggle = useCallback((id: GroupId) => {
    setSelectedGroups((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div className="app-shell">
      <div className="scene"><GlobeScene positionsRef={positionsRef} onHover={setHovered} /></div>
      <UIOverlay
        selected={selectedGroups}
        onToggle={onToggle}
        states={{
          starlink: { loading: starlink.loading, error: starlink.error, count: starlink.records.length },
          stations: { loading: stations.loading, error: stations.error, count: stations.records.length },
          gps: { loading: gps.loading, error: gps.error, count: gps.records.length },
          weather: { loading: weather.loading, error: weather.error, count: weather.records.length },
        }}
        visibleCount={visibleCount}
        hovered={hovered}
      />
    </div>
  );
}
