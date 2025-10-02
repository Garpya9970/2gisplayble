# Task 18 — Событие level_complete (при достижении B или препятствия)

## Цель
Привязать событие `level_complete` к моменту завершения игры (победа/поражение).

## Описание
- В `src/game/GameLogic.ts`:
  - При достижении машинкой точки B (без коллизий) → вызвать:
    ```ts
    const time_ms = Date.now() - startTime;
    trackEvent('level_complete', { win: true, time_ms });
    ```
  - При коллизии с препятствием → вызвать:
    ```ts
    const time_ms = Date.now() - startTime;
    trackEvent('level_complete', { win: false, time_ms });
    ```
  - Событие срабатывает ровно один раз за попытку.

## Технические требования
- Типизация payload: `{ win: boolean, time_ms: number }`.
- `time_ms`: разница между `Date.now()` и `startTime` (зафиксирован при клике на маршрут).
- Обработка перезапуска: при `reset()` сбросить флаг, чтобы событие могло сработать снова.

## Acceptance
- [x] `level_complete` срабатывает при победе с `{ win: true, time_ms }`.
- [x] `level_complete` срабатывает при поражении с `{ win: false, time_ms }`.
- [x] В консоли видно логирование события с корректными payload.
- [x] Событие срабатывает ровно один раз за попытку.

## Оценка
~0.5 часа



