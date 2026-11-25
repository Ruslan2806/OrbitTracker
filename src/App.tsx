import { useCallback, useMemo, useState } from 'react';
import { GlobeScene } from './components/GlobeScene';
import { UIOverlay } from './components/UIOverlay';
import { useSatellitePositions } from './hooks/useSatellitePositions';
import type { SatellitePosition } from './hooks/useSatellitePositions';
import { GROUPS, type GroupId } from './hooks/groups';
import { useOrbitalGroups } from './hooks/useOrbitalGroups';
import './styles.css';

export default function App() {
  const [selectedGroups, setSelectedGroups] = useState<Set<GroupId>>(() => new Set(['stations']));
  const [hovered, setHovered] = useState<SatellitePosition | null>(null);
  const groupStates = useOrbitalGroups(selectedGroups);
  const groups = useMemo(() => GROUPS
    .filter(({ id }) => selectedGroups.has(id))
    .map(({ id }) => ({ id, records: groupStates[id].records })),
  [selectedGroups, groupStates]);
  const positionsRef = useSatellitePositions(groups);
  const visibleCount = new Set(groups.flatMap(({ records }) => records.map((record) => String(record.NORAD_CAT_ID)))).size;

  const onToggle = useCallback((id: GroupId) => {
    setSelectedGroups((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onToggleAll = useCallback(() => {
    setSelectedGroups((current) => current.size === GROUPS.length
      ? new Set()
      : new Set(GROUPS.map(({ id }) => id)));
  }, []);

  return (
    <div className="app-shell">
      <div className="scene"><GlobeScene positionsRef={positionsRef} onHover={setHovered} /></div>
      <UIOverlay
        selected={selectedGroups}
        onToggle={onToggle}
        onToggleAll={onToggleAll}
        states={Object.fromEntries(GROUPS.map(({ id }) => [id, {
          loading: groupStates[id].loading,
          error: groupStates[id].error,
          count: groupStates[id].records.length,
        }]))}
        visibleCount={visibleCount}
        hovered={hovered}
      />
    </div>
  );
}
