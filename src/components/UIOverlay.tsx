import { getGroup, GROUPS, type GroupId } from '../hooks/groups';
import type { SatellitePosition } from '../hooks/useSatellitePositions';
import { useSatcatData, type SatcatRecord } from '../hooks/useSatcatData';

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
  const satcat = useSatcatData();
  const catalogRecord = hovered ? satcat.records[hovered.noradId] : undefined;

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
            <div><dt>NORAD ID</dt><dd>{hovered.noradId}</dd></div>
            <div><dt>Высота</dt><dd>{hovered.alt.toFixed(0)} км</dd></div>
            <div><dt>Широта</dt><dd>{hovered.lat.toFixed(2)}°</dd></div>
            <div><dt>Долгота</dt><dd>{hovered.lng.toFixed(2)}°</dd></div>
          </dl>
          <div className="satcat-details">
            <h3>Доп. информация:</h3>
            {satcat.loading && <p className="satcat-message">Загрузка сведений…</p>}
            {!satcat.loading && catalogRecord && <SatcatDetails record={catalogRecord} />}
            {!satcat.loading && !catalogRecord && <p className="satcat-message">Дополнительные сведения для этого спутника не найдены.</p>}
          </div>
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

function SatcatDetails({ record }: { record: SatcatRecord }) {
  const status = statusLabels[record.status] ?? (record.status || 'Неизвестно');
  const type = typeLabels[record.type] ?? (record.type || 'Неизвестно');

  return (
    <>
      <dl>
        <div><dt>Статус</dt><dd>{status}</dd></div>
        <div><dt>Тип</dt><dd>{type}</dd></div>
        {record.owner && <div><dt>Владелец</dt><dd>{record.owner}</dd></div>}
        {record.launchDate && <div><dt>Запуск</dt><dd>{formatDate(record.launchDate)}</dd></div>}
        {record.launchSite && <div><dt>Космодром</dt><dd>{record.launchSite}</dd></div>}
        {record.inclination != null && <div><dt>Наклонение</dt><dd>{formatNumber(record.inclination)}°</dd></div>}
        {record.period != null && <div><dt>Период орбиты</dt><dd>{formatNumber(record.period)} мин</dd></div>}
        {record.apogee != null && <div><dt>Апогей</dt><dd>{formatNumber(record.apogee)} км</dd></div>}
        {record.perigee != null && <div><dt>Перигей</dt><dd>{formatNumber(record.perigee)} км</dd></div>}
        {record.decayDate && <div><dt>Сход с орбиты</dt><dd>{formatDate(record.decayDate)}</dd></div>}
      </dl>
    </>
  );
}

const statusLabels: Record<string, string> = {
  '+': 'Работает', '-': 'Не работает', P: 'Частично работает', B: 'Резервный',
  S: 'Запасной', X: 'Продлённая миссия', D: 'Сошёл с орбиты', '?': 'Неизвестно',
};

const typeLabels: Record<string, string> = { PAY: 'Полезная нагрузка', 'R/B': 'Корпус ракеты', DEB: 'Обломок', UNK: 'Неизвестно' };

function formatDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('ru-RU', { timeZone: 'UTC' });
}

function formatNumber(value: number | string) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString('ru-RU', { maximumFractionDigits: 2 }) : String(value);
}
