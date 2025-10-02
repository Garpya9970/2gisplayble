# Task 03 — Настройка build targets (Mintegral/Unity/Bigo × portrait/landscape)

## Цель
Настроить команды `npm run build <network>` для генерации билдов под разные сети и ориентации.

## Описание
- Создать конфиги сборки для Mintegral, Unity, Bigo (например, через env-переменные или CLI-флаги).
- Добавить команды в `package.json`:
  - `npm run build:mintegral-portrait`
  - `npm run build:mintegral-landscape`
  - `npm run build:unity-portrait`
  - `npm run build:unity-landscape`
  - `npm run build:bigo-portrait`
  - `npm run build:bigo-landscape`
- Различия по сетям прячет @smoud/playable-sdk (через env-переменные `AD_NETWORK`, `ORIENTATION`).
- Убедиться, что UI-код не содержит `if (network === 'Meta')` — все различия на уровне SDK/сборки.

## Технические требования
- ENV-переменные: `AD_NETWORK`, `ORIENTATION`.
- Итоговый ZIP: `dist-<network>-<orientation>.zip` (опционально, для удобства).

## Acceptance
- [x] Все 6 команд выполняются и генерируют `dist/` с HTML/JS/assets.
- [x] UI-код не содержит условий по сетям.
- [x] В консоли видно, какая сеть/ориентация выбрана (логирование).

## Оценка
~1 час

