export type GroupId = string;

export interface GroupConfig {
  id: GroupId;
  label: string;
  source: string;
  query?: 'SPECIAL';
  color: string;
  description: string;
  limit: number;
}

const colors = ['#ff4d5a', '#ffd43b', '#42df8b', '#4d9fff', '#c084fc', '#fb923c', '#2dd4bf', '#f472b6'];
const definitions: Array<[string, string, string, string?, 'SPECIAL'?]> = [
  ['last-30-days', 'Запуски за 30 дней', 'Недавно запущенные объекты'],
  ['stations', 'Космические станции', 'МКС и другие станции'],
  ['visual', 'Самые яркие', 'Около 100 ярких объектов'],
  ['active', 'Активные спутники', 'Активные спутники'],
  ['analyst', 'Аналитические', 'Аналитические объекты'],
  ['fengyun-1c-debris', 'Обломки Fengyun 1C', 'Обломки испытания ASAT'],
  ['iridium-33-debris', 'Обломки Iridium 33', 'Обломки столкновения Iridium 33'],
  ['cosmos-2251-debris', 'Обломки Cosmos 2251', 'Обломки столкновения Cosmos 2251'],
  ['weather', 'Погодные спутники', 'Метеорологические спутники'],
  ['resource', 'Ресурсы Земли', 'Спутники ресурсов Земли'],
  ['sar', 'Радиолокация Земли', 'Спутники радиолокационного наблюдения'],
  ['sarsat', 'Поиск и спасение', 'Система SARSAT'],
  ['tdrss', 'Ретрансляторы TDRSS', 'Система космической связи'],
  ['argos', 'ARGOS', 'Спутники сбора данных ARGOS'],
  ['planet', 'Planet', 'Спутники Planet'],
  ['spire', 'Spire', 'Спутники Spire'],
  ['geo', 'Геостационарные', 'Активные геосинхронные спутники'],
  ['gpz', 'GEO Protected Zone', 'Объекты в защищённой зоне GEO', 'GPZ', 'SPECIAL'],
  ['gpz-plus', 'GEO Protected Zone Plus', 'Расширенная защищённая зона GEO', 'GPZ-PLUS', 'SPECIAL'],
  ['intelsat', 'Intelsat', 'Спутники Intelsat'],
  ['ses', 'SES', 'Спутники SES'],
  ['eutelsat', 'Eutelsat', 'Спутники Eutelsat'],
  ['telesat', 'Telesat', 'Спутники Telesat'],
  ['starlink', 'Starlink', 'Группировка SpaceX'],
  ['oneweb', 'OneWeb', 'Группировка OneWeb'],
  ['qianfan', 'Qianfan', 'Группировка Qianfan'],
  ['hulianwang', 'Hulianwang Digui', 'Коммуникационные спутники'],
  ['kuiper', 'Kuiper', 'Группировка Amazon Kuiper'],
  ['iridium-NEXT', 'Iridium NEXT', 'Спутники Iridium NEXT'],
  ['orbcomm', 'Orbcomm', 'Спутники Orbcomm'],
  ['globalstar', 'Globalstar', 'Спутники Globalstar'],
  ['amateur', 'Любительские', 'Любительские радиоспутники'],
  ['satnogs', 'SatNOGS', 'Спутники сети SatNOGS'],
  ['experimental', 'Экспериментальные', 'Экспериментальные коммуникационные спутники', 'x-comm'],
  ['other-comm', 'Другие коммуникационные', 'Другие спутники связи'],
  ['gnss', 'GNSS', 'Все спутники глобальных навигационных систем'],
  ['gps-ops', 'GPS', 'Рабочие спутники GPS'],
  ['glo-ops', 'ГЛОНАСС', 'Рабочие спутники ГЛОНАСС'],
  ['galileo', 'Galileo', 'Спутники Galileo'],
  ['beidou', 'BeiDou', 'Спутники BeiDou'],
  ['sbas', 'SBAS', 'WAAS, EGNOS и MSAS'],
  ['science', 'Научные спутники', 'Научные миссии'],
  ['geodetic', 'Геодезические', 'Геодезические спутники'],
  ['engineering', 'Инженерные', 'Инженерные спутники'],
  ['education', 'Образовательные', 'Образовательные спутники'],
  ['military', 'Военные', 'Военные спутники'],
  ['radar', 'Калибровка радаров', 'Спутники калибровки радаров'],
  ['cubesat', 'CubeSats', 'Малые спутники формата CubeSat'],
];

export const GROUPS: GroupConfig[] = definitions.map(([id, label, description, source = id, query], index) => ({
  id,
  label,
  description,
  source,
  ...(query ? { query } : {}),
  color: colors[index % colors.length],
  limit: 1000,
}));

export const getGroup = (id: GroupId) => GROUPS.find((group) => group.id === id)!;
