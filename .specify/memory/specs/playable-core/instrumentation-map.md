# Instrumentation Map (шаблон, дополни под игру)

Триггеры → событие:

- После `sdk.init()` и готовности ассетов → `track('game_start')`
- Первый ввод пользователя (тап/клик/drag) → `track('first_interact')` (одноразово)
- Конец сессии:
  • победа → `track('level_complete', { win: true, time_ms })`
  • поражение → `track('level_complete', { win: false, time_ms })`
- CTA-кнопка/логотип/финальный баннер → `track('cta_click'); sdk.install()`
- Ошибки (catch/unhandled) → `track('error', { code, detail? })`

[Здесь пропиши конкретные сцены/файлы/функции, где именно ставим вызовы]
