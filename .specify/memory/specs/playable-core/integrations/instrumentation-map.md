# Instrumentation Map — Playable 1 (2ГИС)

## Список событий (абстрактные имена)
- game_start
- first_interact
- level_complete { win: boolean, time_ms: number }
- cta_click
- error { code: string, detail?: string }
(+ pause/resume/volume — при наличии в SDK)

## Где что стреляет

1) После `sdk.init()` и готовности ассетов/сцены → `sdk.track('game_start')`.

2) Первый пользовательский ввод:
   - Любой `pointerdown` по сцене/маршрутам → one-shot `sdk.track('first_interact')`.

3) Выбор маршрута:
   - При первом клике по одной из 3–4 линий маршрута: фиксируем `startTime`.
   - Когда машина достигает B ИЛИ встретила препятствие — считаем `time_ms = now - startTime` и шлём:
     - Верный маршрут → `sdk.track('level_complete', { win: true, time_ms })`.
     - Неверный маршрут (пробка/перекрытие/ремонт) → `sdk.track('level_complete', { win: false, time_ms })`.

4) CTA:
   - На финальном экране (после победы) кнопка «Скачать 2ГИС»:
     `click` → `sdk.track('cta_click'); sdk.install()`.

5) Ошибки:
   - Любые runtime-ошибки/исключения/ошибка загрузки ассетов:
     `sdk.track('error', { code: '<краткий_код>', detail: '<optional>' })`.

6) (Опционально) Пауза/резюм/звук:
   - При сворачивании `pause` и возвращении `resume` → использовать соответствующие события, если в SDK доступны.
