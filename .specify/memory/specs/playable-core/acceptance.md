# Acceptance (DoD)

Вес/перф:
- ZIP ≤ 5 MB; 60 FPS; TTFI ≤ 300 ms.

Сеть/ресурсы:
- Внешних запросов 0; web-fonts 0; все ассеты локальные.

Адаптив:
- Соответствие `adaptive-visuals.md` (ревью: нет px для шрифтов/контейнеров, везде clamp/vw/vh/em/rem, safe-area учтён).

События/CTA:
- Все события из `events-contract.md` срабатывают строго по `instrumentation-map.md` (одноразово, где требуется).
- CTA: по клику → `track('cta_click')` → `sdk.install()` в каждом билде.

Ориентации:
- Две сборки (portrait/landscape) проходят smoke-тест + все пункты DoD.
