# Plan — Playable 1 (2ГИС) — пересборка под максимальную адаптивность

## Жёсткие инварианты (из Конституции)
- ZIP ≤ 5 MB; 60 FPS; TTFI ≤ 300 ms.
- Внешних запросов = 0; web-fonts = 0; один HTML-файл (single-file).
- Ориентации: отдельные билды portrait/landscape.
- События SDK: game_start, first_interact, level_complete{win,time_ms}, cta_click→install, error.
- Никаких `window.open`, никакой UI-логики по сетям (всё решает SDK/сборка).

## Workstreams (сокращённая версия)

### WS1. Single-file Build & SDK
- Настроить Vite + `vite-plugin-singlefile` (инлайн JS/CSS/ассеты как base64).
- Интегрировать `@smoud/playable-sdk`; обёртка с типами и событиями.
- Команды сборки: 3 сети × 2 ориентации (env: `VITE_AD_NETWORK`, `VITE_ORIENTATION`).

Acceptance: индекс один файл; SDK-события работают; сборка без ошибок.

### WS2. Rendering (Orthographic 3D, изометрия)
- Three.js с `OrthographicCamera`; viewport рассчитывается по aspect ratio.
- Двойной resize: SDK события + `window.resize` (fallback, debounce 100ms).
- Сцена: земля, маршруты (полилинии), точки A/B, машинка, препятствия.

Acceptance: сцена одинаково читается на любых экранах без перезагрузки.

### WS3. Gameplay Core
- Выбор маршрута, старт движения, фиксируем `startTime`.
- Победа/поражение; `level_complete { win, time_ms }`.
- Перезапуск без перезагрузки.

Acceptance: проходится от старта до конца; корректные события.

### WS4. UI & CTA (адаптив)
- Туториал, HUD/таймер, финал + CTA через `sdk.install()`.
- Только `clamp()` + `vw/vh/em/rem`, `safe-area`.

Acceptance: UI адаптивен, нет фиксированных px; CTA работает.

### WS5. Performance & QA
- Профилирование FPS/TTFI; оптимизация ассетов/бандла.
- QA: вес, сеть=0, события, ориентации, single-file, без `window.open`.

Acceptance: все пункты `acceptance.md` пройдены.

## Риски
- Вес моделей/текстур → строгая оптимизация.
- Разные SDK окружения → унификация через обёртку и тестовые стенды.

## Статус выполнения

### ✅ Выполнено (02.10.2025)
- [x] **WS1. Single-file Build & SDK**
  - ✅ Task 01: Setup Project (Vite + TypeScript + vite-plugin-singlefile)
  - ✅ Task 02: SDK Integration (@smoud/playable-sdk)
  - ✅ Task 03: Build Targets (3 сети × 2 ориентации)

- [x] **WS2. Rendering (Orthographic 3D)**
  - ✅ Task 08: Render Engine (ThreeRenderer.ts с OrthographicCamera)
  - ✅ Task 09: Map Scene (земля, дороги, здания, адаптивная геометрия)
  - ✅ Task 31: City Environment (деревья, фонари, бордюры)
  - ✅ Адаптивные дороги (примитивы BoxGeometry вместо GLB)
  - ✅ Бетонные тротуары и бордюры
  - ✅ Динамическая геометрия при resize

- [x] **Машинка и движение**
  - ✅ Task 10: Car Sprite (восстановлен после удаления)
  - ✅ Загрузка GLB модели с текстурой
  - ✅ Фиксированная высота Y=0.6 (без проваливания в дорогу)
  - ✅ Плавное движение по waypoints (только X и Z)
  - ✅ Автонормализация и ориентация модели

- [x] **Waypoints система**
  - ✅ 23 именованные точки с шагом 4 единицы
  - ✅ Адаптивные стартовые позиции (portrait/landscape)
  - ✅ Визуализация для отладки (розовые сферы + метки)

### 🔄 В процессе
- [ ] **WS2. Camera Work**
  - ⏳ Task 32: Camera Work & Zoom-in (СЛЕДУЮЩАЯ ЗАДАЧА)
    - Приближение камеры (BASE_VIEW_SIZE: 10 → 6-7)
    - Следование за машинкой (camera lerp)
    - Zoom-in эффект на старте (first_interact)
    - Zoom-out эффект на финише (level_complete)

### 📋 Осталось сделать

#### WS3. Gameplay Core
- [ ] Task 11: Obstacles (пробка слева, знак STOP справа)
- [ ] Task 12: Route Selection (выбор направления на перекрестке)
- [ ] Task 13: Obstacles Logic (столкновение/проезд)
- [ ] Task 14: Timer (15 секунд)
- [ ] Task 15: Replay (перезапуск без перезагрузки)
- [ ] Task 16-19: SDK Events (game_start, first_interact, level_complete, cta_error)

#### WS4. UI & CTA
- [ ] Task 05: Tutorial Screen (инструкция перед стартом)
- [ ] Task 06: HUD Timer (отображение времени)
- [ ] Task 04: Adaptive UI Base (clamp + vw/vh/em/rem)
- [ ] End-card с CTA (sdk.install())
- [ ] Task 21: Branding (2ГИС лого)

#### WS5. Performance & QA
- [ ] Task 20: Assets Prep (оптимизация GLB, текстур)
- [ ] Task 23-25: Performance (профилирование, оптимизация, валидация)
- [ ] Task 26-29: QA (smoke, adaptive, network, final)
- [ ] Проверка ZIP ≤ 5 MB, 60 FPS, TTFI ≤ 300 ms

## Next Steps
1. **Task 32: Camera Work** — приближение и динамика камеры (~2-3 часа)
2. **Task 11: Obstacles** — препятствия на маршрутах (~2 часа)
3. **Task 12: Route Selection** — интерактивный выбор направления (~1.5 часа)
4. **Task 13: Obstacles Logic** — логика столкновений (~1 час)
5. **Task 14: Timer** — обратный отсчёт 15 секунд (~1 час)

**Текущий прогресс**: ~40% (основа готова, нужна геймплейная логика и UI)

