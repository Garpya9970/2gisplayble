# 2ГИС Playable Ad

HTML5 playable-реклама для 2ГИС с 3D-механикой выбора маршрута на карте.

## 🎯 Ключевые характеристики

- **Бюджеты**: ZIP ≤ 5 MB, 60 FPS, TTFI ≤ 300 ms
- **Технологии**: TypeScript + Three.js + Vite + vite-plugin-singlefile
- **Формат**: **Один HTML-файл** с инлайн JS/CSS и base64-изображениями
- **Сети**: Mintegral, Unity, Bigo
- **Ориентации**: Portrait + Landscape
- **Constraints**: 0 внешних запросов, web-fonts = 0

## 📦 Установка

```bash
npm install
```

## 🚀 Разработка

```bash
# Dev-сервер с hot reload
npm run dev

# Открыть http://localhost:5173
```

## 🏗️ Сборка

### Все таргеты
```bash
# Mintegral
npm run build:mintegral-portrait
npm run build:mintegral-landscape

# Unity
npm run build:unity-portrait
npm run build:unity-landscape

# Bigo
npm run build:bigo-portrait
npm run build:bigo-landscape
```

### Ручная сборка
```bash
npm run build
# Результат: dist/index.html — ОДИН файл со всем кодом и ассетами инлайн
```

### 🎯 Single-file билд
После сборки `dist/index.html` содержит:
- ✅ Инлайн `<script>` с минифицированным JS
- ✅ Инлайн `<style>` с минифицированным CSS
- ✅ Base64-изображения (все ассеты инлайнятся)
- ✅ Готов к загрузке в рекламные сети (один файл)

## 🧪 Проверки

```bash
# Линтер
npm run lint
npm run lint:fix

# Проверка размера
du -sh dist.zip  # Должно быть ≤ 5 MB

# Проверка внешних запросов
# Chrome DevTools → Network (должно быть 0 внешних запросов)
```

## 📂 Структура проекта

```
.
├── src/
│   ├── index.html          # HTML-шаблон с safe-area
│   ├── main.ts             # Точка входа
│   ├── renderer/           # Three.js renderer (Task 08)
│   ├── game/               # Игровая логика (Tasks 09-15)
│   ├── ui/                 # HUD, туториал, финальный экран (Tasks 04-07)
│   ├── sdk-wrapper.ts      # SDK-обёртка (Task 02)
│   └── assets/             # Ассеты (модели, текстуры)
├── .specify/memory/        # Спецификации и задачи
│   ├── constitution.md     # Конституция проекта
│   ├── specs/playable-core/
│   │   ├── plan.md         # План разработки
│   │   └── tasks/          # 29 задач (01-29)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 📋 Задачи

См. `.specify/memory/specs/playable-core/tasks/` — 29 задач по 1–2 часа каждая.

**Workstreams**:
1. Setup & Build Pipeline (01-03)
2. Adaptive UI & HUD (04-07)
3. Rendering & Map Scene (08-11)
4. Gameplay Logic (12-15)
5. SDK Instrumentation (16-19)
6. Assets & Branding (20-22)
7. Performance & Optimization (23-25)
8. QA & Acceptance (26-29)

## 🎮 События SDK

Все события абстрактные (см. `.specify/memory/specs/playable-core/events-contract.md`):

- `game_start` — после init и готовности ассетов
- `first_interact` — первый пользовательский ввод (one-shot)
- `level_complete { win: boolean, time_ms: number }` — победа/поражение
- `cta_click` — клик по CTA → `sdk.install()`
- `error { code: string, detail?: string }` — runtime-ошибки

## 🚫 Запрещено

- `window.open()` для EXIT (только `sdk.install()`)
- Фиксированные `px` для шрифтов/контейнеров (только `clamp` + `vw/vh/em/rem`)
- Внешние запросы в runtime
- Web-fonts (Google Fonts и т. п.)
- Логика `if (network === 'Meta')` в UI-коде (различия на уровне SDK/сборки)

## 📄 Документация

- **Constitution**: `.specify/memory/constitution.md`
- **Brief**: `.specify/memory/specs/playable-core/integrations/brief.md`
- **Plan**: `.specify/memory/specs/playable-core/plan.md`
- **Acceptance**: `.specify/memory/specs/playable-core/acceptance.md`

## 📞 Поддержка

См. задачи в `.specify/memory/specs/playable-core/tasks/` для детальных acceptance criteria.
