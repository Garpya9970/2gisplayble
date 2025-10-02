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

## Next Steps
- Реализовать WS1→WS2→WS3; затем WS4→WS5.

