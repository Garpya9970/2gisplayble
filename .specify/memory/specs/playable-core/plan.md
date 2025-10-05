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
- Только `clamp()` + **`vmin/vh` (БЕЗ px и rem!)**, `safe-area`.

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

- [x] **WS2. Camera Work**
  - ✅ Task 32: Camera Work & Zoom-in
    - ✅ Приближение камеры (BASE_VIEW_SIZE: 10 → 5 для 2x zoom)
    - ✅ Следование за машинкой (camera lerp + lookAt)
    - ✅ Изометрический угол обзора (cameraOffset + lookAt)

- [x] **WS3. Gameplay Core**
  - ✅ Task 11: Obstacles (пробка слева, экскаватор на прямой, правая дорога свободна)
  - ✅ Task 12: Route Selection (3 кнопки выбора маршрута: налево/прямо/направо)
  - ✅ Task 13: Obstacles Logic (автоматическая остановка перед препятствиями)
  - ✅ Task 15: Replay (перезапуск через белый fade + reset)
  - ✅ Task 16-19: SDK Events (game_start, first_interact, level_complete, cta_click)

- [x] **WS4. UI & CTA**
  - ✅ Task 05: Tutorial Screen (стартовый экран с заголовком и логотипом)
  - ✅ Task 04: Adaptive UI Base (**clamp + vmin/vmax, БЕЗ px и rem!**)
  - ✅ End-card с CTA (sdk.clickCTA() + confetti + звуки)
  - ✅ Task 21: Branding (2ГИС лого в base64)
  - ✅ Модальные окна для неудачных маршрутов
  - ✅ Звуки: двигатель (zvuk-machine.mp3), победа, проигрыш, клик
  - ✅ Конфетти эффект на победу

### 🔧 Недавние исправления (05.10.2025)
- ✅ Тексты: "Вы" → "вы" (с маленькой буквы) — единообразие
- ✅ Отключены клики по экрану — управление только через UI кнопки
- ✅ Звук машины в портрете — добавлен initAudio() для обхода autoplay политики
- ✅ **Полная адаптивность через vmin/vh** — никаких px или rem!
  - Portrait: `clamp(12vmin, 20vmin, 25vmin)`
  - Landscape: `clamp(10vh, 15vh, 20vh)` (vh вместо vmax для пропорциональности!)

### 📋 Осталось сделать

#### WS5. Performance & QA
- [ ] Task 20: Assets Prep (оптимизация GLB, текстур — если нужно)
- [ ] Task 23-25: Performance (профилирование, оптимизация, валидация)
- [ ] Task 26-29: QA (smoke, adaptive, network, final)
- [ ] Проверка ZIP ≤ 5 MB ✅ (3.5 MB), 60 FPS, TTFI ≤ 300 ms

## Next Steps
1. **Тестирование на устройствах** — iOS/Android (портрет/ландшафт)
2. **Performance профилирование** — FPS/TTFI измерения
3. **QA финальная проверка** — все acceptance критерии
4. **Деплой на платформы** — Facebook, Unity, AppLovin и др.

**Текущий прогресс**: ~95% (игровая механика готова, UI адаптивен, осталось QA и деплой)

