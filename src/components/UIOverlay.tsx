import { getGroup, GROUPS, type GroupId } from '../hooks/groups';
import type { SatellitePosition } from '../hooks/useSatellitePositions';

interface GroupState {
  loading: boolean;
  error: string | null;
  count: number;
}

interface Props {
  selected: Set<GroupId>;
  onToggle: (id: GroupId) => void;
  states: Record<GroupId, GroupState>;
  visibleCount: number;
  hovered: SatellitePosition | null;
}

export function UIOverlay({ selected, onToggle, states, visibleCount, hovered }: Props) {
  const errors = [...selected].map((id) => states[id].error).filter(Boolean);

  return (
    <main className="overlay">
      {hovered && (
        <aside className="satellite-info" style={{ '--satellite-color': hovered.color } as React.CSSProperties} aria-live="polite">
          <div className="satellite-info-heading">
            <span className="satellite-info-dot" />
            <span>{getGroup(hovered.group).label}</span>
          </div>
          <strong className="satellite-name">{hovered.name}</strong>
          <dl>
            <div><dt>Высота</dt><dd>{hovered.alt.toFixed(0)} км</dd></div>
            <div><dt>Широта</dt><dd>{hovered.lat.toFixed(2)}°</dd></div>
            <div><dt>Долгота</dt><dd>{hovered.lng.toFixed(2)}°</dd></div>
          </dl>
        </aside>
      )}
      <section className="control-card" aria-label="Настройки отображения">
        <div className="card-heading">
          <h2>Слои карты</h2>
          <span className="group-count">{selected.size} / {GROUPS.length}</span>
        </div>
        <div className="group-list">
          {GROUPS.map((group) => {
            const isSelected = selected.has(group.id);
            const status = states[group.id];
            return (
              <label className={`group-row ${isSelected ? 'is-selected' : ''}`} key={group.id}>
                <input type="checkbox" checked={isSelected} onChange={() => onToggle(group.id)} />
                <span className="custom-check" style={{ '--group-color': group.color } as React.CSSProperties}>
                  {isSelected && <svg viewBox="0 0 14 14" aria-hidden="true"><path d="m2.5 7 3 3 6-6" /></svg>}
                </span>
                <span className="group-swatch" style={{ backgroundColor: group.color, boxShadow: `0 0 10px ${group.color}55` }} />
                <span className="group-text"><strong>{group.label}</strong></span>
                <span className="group-meta">
                  {status.loading ? <span className="spinner" aria-label="Загрузка" /> : isSelected && status.count > 0 ? status.count : ''}
                </span>
              </label>
            );
          })}
        </div>
        {errors.length > 0 && <div className="error-notice" role="status"><span>!</span><div>{[...new Set(errors)].join(' ')}</div></div>}
      </section>

      <section className="counter-card" aria-live="polite">
        <div><strong>{visibleCount.toLocaleString('ru-RU')}</strong><span>спутников</span></div>
      </section>
    </main>
  );
}
