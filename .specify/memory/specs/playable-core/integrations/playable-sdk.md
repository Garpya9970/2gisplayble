# Playable SDK Integration

- Инициализация: `sdk.init(cb?)` — готовим сцену в колбэке → `sdk.start()`.
- Завершение: `sdk.finish()` (если поддерживается SDK).
- События: `sdk.track(<абстрактное имя>, payload?)` — имена см. в `events-contract.md`.
- CTA: всегда `sdk.track('cta_click')` → `sdk.install()` (никаких `window.open`).
- Подписки (по необходимости): `sdk.on('resize'|'pause'|'resume'|'volume'|'interaction', handler)`.
- Различия по сетям — на **сборке** (`npm run build <ad-network>`). UI-код общий.
