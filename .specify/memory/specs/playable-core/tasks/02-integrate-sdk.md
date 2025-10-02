# Task 02 — Интеграция @smoud/playable-sdk

## Цель
Подключить @smoud/playable-sdk, реализовать базовую обёртку для init/start/finish/install/track.

## Описание
- Установить `@smoud/playable-sdk` (или заглушку, если SDK ещё не опубликован).
- Создать `src/sdk-wrapper.ts` с методами:
  - `initSDK(callback?: () => void): Promise<void>` — вызывает `sdk.init()`.
  - `startGame(): void` — вызывает `sdk.start()`.
  - `finishGame(): void` — вызывает `sdk.finish()`.
  - `installApp(): void` — вызывает `sdk.install()`.
  - `trackEvent(name: string, payload?: any): void` — вызывает `sdk.track(name, payload)`.
- Реализовать заглушки для `sdk.on('resize'|'pause'|'resume'|'volume'|'interaction')`.

## Технические требования
- Типизация событий: `type EventName = 'game_start' | 'first_interact' | 'level_complete' | 'cta_click' | 'error'`.
- Обработка ошибок: если SDK не инициализирован, логировать предупреждение.

## Acceptance
- [x] `@smoud/playable-sdk` установлен ✅ (npm install).
- [x] `src/sdk-wrapper.ts` создан с методами:
  - [x] `init(callback)` — вызывает `sdk.init()` и настраивает обработчики ✅
  - [x] `start()` — вызывает `sdk.start()` + автоматически `game_start` ✅
  - [x] `finish()` — вызывает `sdk.finish()` ✅
  - [x] `install()` — вызывает `sdk.install()` + автоматически `cta_click` ✅
  - [x] `trackCustomEvent(name, payload)` — кастомные события ✅
- [x] Типизация событий: `CustomEventName`, `LevelCompletePayload`, `ErrorPayload` ✅
- [x] Обработка стандартных событий SDK: `resize`, `pause`, `resume`, `volume`, `interaction` ✅
- [x] `main.ts` обновлён для использования SDK ✅
- [x] Глобальный обработчик ошибок → `trackCustomEvent('error')` ✅
- [x] Сборка проходит без ошибок ✅ (11.88 KB с SDK).
- [x] `src/SDK-USAGE.md` создан с документацией и примерами ✅.

## Оценка
~1 час
