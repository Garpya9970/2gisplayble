# Task 19 — События cta_click и error (CTA-кнопка, глобальный обработчик ошибок)

## Цель
Привязать событие `cta_click` к кнопке CTA и настроить глобальный обработчик ошибок для события `error`.

## Описание
- В `src/screens/FinalScreen.ts`:
  - По клику на кнопку «Скачать 2ГИС» → вызвать:
    ```ts
    trackEvent('cta_click');
    installApp(); // sdk.install()
    ```
- В `src/main.ts`:
  - Глобальный обработчик ошибок:
    ```ts
    window.addEventListener('error', (event) => {
      trackEvent('error', { code: 'runtime_error', detail: event.message });
    });
    window.addEventListener('unhandledrejection', (event) => {
      trackEvent('error', { code: 'unhandled_promise', detail: event.reason });
    });
    ```
  - Обработка ошибок загрузки ассетов: в `catch` блоке вызвать `trackEvent('error', { code: 'asset_load_error' })`.

## Технические требования
- Типизация payload для `error`: `{ code: string, detail?: string }`.
- Глобальный обработчик: не блокировать исполнение, только логирование.

## Acceptance
- [x] `cta_click` срабатывает при клике на кнопку CTA.
- [x] `installApp()` вызывается после `cta_click` (никаких `window.open`).
- [x] Глобальный обработчик ошибок логирует `error` в консоль.
- [x] Ошибки загрузки ассетов отлавливаются и логируются.

## Оценка
~1 час



