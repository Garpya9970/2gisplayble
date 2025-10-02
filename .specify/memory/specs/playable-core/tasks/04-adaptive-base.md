# Task 04 — Базовая CSS-сетка с адаптивом (clamp + vw/vh/em/rem + safe-area)

## Цель
Реализовать CSS-фреймворк для полностью адаптивного UI без фиксированных px.

## Описание
- Создать `src/styles/adaptive.css` с базовыми правилами:
  - CSS-переменные: `--scale`, `--base-font-size`, `--safe-area-top/bottom/left/right`.
  - Функция `clamp()` для всех размеров: шрифты, отступы, border-radius, gap.
  - Пример: `font-size: clamp(0.8rem, 2vw, 1.5rem);`.
  - `safe-area-inset`: `padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);`.
- Создать утилитарные классы: `.text-title`, `.text-body`, `.btn-primary`, `.hud-panel`.
- Запретить использование `px` для шрифтов/контейнеров (добавить ESLint-правило или комментарий).

## Технические требования
- Все размеры через `clamp()`, `vw`, `vh`, `em`, `rem`.
- Поддержка portrait/landscape: медиа-запросы `@media (orientation: portrait/landscape)`.

## Acceptance
- [x] UI-элементы (текст, кнопки) адаптируются на разных разрешениях без горизонтальной прокрутки.
- [x] `safe-area-inset` учтён в паддингах HUD/кнопок.
- [x] Нет фиксированных `px` для шрифтов/контейнеров в CSS.

## Оценка
~1.5 часа

