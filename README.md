# Orbit Tracker

Одностраничное приложение на React, TypeScript, Three.js и satellite.js. Показывает Землю и спутники CelesTrak; выберите группы в панели слева. Данные каждой группы загружаются при первом включении и кэшируются в браузере на два часа.

## Локальный запуск

```sh
npm install
npm run dev
```

Для production-сборки: `npm run build`.

## GitHub Pages

Workflow `.github/workflows/deploy.yml` публикует ветку `main` на GitHub Pages. В настройках репозитория выберите **Settings → Pages → Source: GitHub Actions**. После успешного запуска адрес сайта появится в настройках Pages и в результате workflow.

Текстура глобуса находится локально в `public/textures/earth.jpg`; внешние данные запрашиваются у CelesTrak.
