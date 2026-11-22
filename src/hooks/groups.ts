export type GroupId = 'starlink' | 'stations' | 'gps' | 'weather';

export interface GroupConfig {
  id: GroupId;
  label: string;
  source: string;
  limit?: number;
  color: string;
  description: string;
}

export const GROUPS: GroupConfig[] = [
  { id: 'starlink', label: 'Starlink', source: 'starlink', limit: 500, color: '#ff4d5a', description: 'Низкая околоземная орбита' },
  { id: 'stations', label: 'Станции', source: 'stations', color: '#ffd43b', description: 'МКС и другие станции' },
  { id: 'gps', label: 'GPS', source: 'gps-ops', color: '#42df8b', description: 'Навигационная группировка' },
  { id: 'weather', label: 'Погодные', source: 'weather', color: '#4d9fff', description: 'Метеорологические спутники' },
];

export const getGroup = (id: GroupId) => GROUPS.find((group) => group.id === id)!;
