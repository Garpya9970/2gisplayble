# Task 30 — Переписать план и спецификацию под максимальную адаптивность

## Цель
Упростить и перефокусировать `plan.md` и `spec.md` под единые жёсткие требования: single-file билд (один `index.html`), 0 внешних запросов, orthographic-рендер (изометрия) с полной адаптацией под любые экраны, события через `@smoud/playable-sdk`.

## Основания
- Конституция: `.specify/memory/constitution.md`
- Бриф: `.specify/memory/specs/playable-core/integrations/brief.md`
- Интеграция SDK: `.specify/memory/specs/playable-core/integrations/playable-sdk.md`
- События: `.specify/memory/specs/playable-core/events-contract.md`
- Инструментация: `.specify/memory/specs/playable-core/integrations/instrumentation-map.md`

## Изменения
- `plan.md`: сократить до 5–6 рабочих направлений, убрать второстепенные детали, чётко зафиксировать orthographic-адаптацию, single-file билд, SDK-события и DoD.
- `spec.md`: зафиксировать стек (TypeScript + Vite + `vite-plugin-singlefile` + Three.js Ortho), строгие бюджеты, отсутствие `window.open`, запрет внешних запросов, обязательные события SDK, 2 ориентации.

## Acceptance
- [x] `plan.md` обновлён: отражает single-file билд, orthographic-рендер, двойную обработку resize (SDK + window), 0 внешних запросов, два билда (portrait/landscape), события SDK (game_start, first_interact, level_complete{win,time_ms}, cta_click → install, error).
- [x] `spec.md` обновлён: фиксирует технологический стек и жёсткие правила (ZIP ≤ 5 MB, 60 FPS, TTFI ≤ 300 ms, web-fonts = 0, без `window.open`, без условной логики по сетям в UI).
- [x] Обе новые версии соответствуют DoD из `acceptance.md` (вес, сеть, адаптив, события, ориентации).

## Оценка
~0.5–1 час

