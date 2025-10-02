# SDK Usage Guide

## @smoud/playable-sdk Integration

Этот проект использует [@smoud/playable-sdk](https://github.com/smoudjs/playable-sdk) — унифицированный SDK для playable-рекламы, поддерживающий MRAID, Google, Facebook, Vungle, Mintegral, Unity и другие сети.

## Wrapper API

Обёртка `src/sdk-wrapper.ts` предоставляет удобный интерфейс для работы с SDK.

### Инициализация

```typescript
import playableSDK from './sdk-wrapper';

// Инициализация с callback для получения размеров контейнера
playableSDK.init((width, height) => {
  console.log(`Container: ${width}x${height}`);
  console.log(`Landscape: ${playableSDK.isLandscape}`);
  
  // Инициализируйте рендерер здесь
  // const renderer = new ThreeRenderer();
  // renderer.init(canvas, width, height);
});
```

### Старт playable

```typescript
// Вызывайте после загрузки всех ассетов
playableSDK.start();

// Автоматически вызовет trackCustomEvent('game_start')
```

### Завершение playable

```typescript
// Маркирует playable как завершённый
playableSDK.finish();
```

### Переход в стор (CTA)

```typescript
// Единственный способ EXIT — НЕ используйте window.open()!
playableSDK.install();

// Автоматически вызовет trackCustomEvent('cta_click')
```

## Кастомные события

Наша обёртка добавляет кастомные события из `events-contract.md`:

### game_start
```typescript
// Автоматически вызывается в playableSDK.start()
playableSDK.onCustomEvent('game_start', () => {
  console.log('Game started!');
});
```

### first_interact
```typescript
// Автоматически вызывается при первом взаимодействии
playableSDK.onCustomEvent('first_interact', () => {
  console.log('First user interaction!');
  // Скрыть туториал, начать игру и т.д.
});
```

### level_complete
```typescript
// Вручную вызывается при завершении уровня
playableSDK.trackCustomEvent('level_complete', {
  win: true,        // true = победа, false = поражение
  time_ms: 5420     // время прохождения в миллисекундах
});

// Подписка на событие
playableSDK.onCustomEvent('level_complete', (payload) => {
  if (payload.win) {
    console.log(`Victory in ${payload.time_ms}ms!`);
    showVictoryScreen();
  } else {
    console.log(`Defeat in ${payload.time_ms}ms`);
    showDefeatScreen();
  }
});
```

### cta_click
```typescript
// Автоматически вызывается в playableSDK.install()
playableSDK.onCustomEvent('cta_click', () => {
  console.log('CTA clicked, redirecting to store...');
});
```

### error
```typescript
// Вручную вызывается при ошибках
playableSDK.trackCustomEvent('error', {
  code: 'asset_load_error',
  detail: 'Failed to load model.glb'
});

// Подписка на событие
playableSDK.onCustomEvent('error', (payload) => {
  console.error(`Error [${payload.code}]:`, payload.detail);
  // Отправить в аналитику, показать пользователю и т.д.
});
```

## Свойства SDK

```typescript
// Размеры контейнера
const width = playableSDK.width;
const height = playableSDK.height;

// Ориентация
const isLandscape = playableSDK.isLandscape; // true = ландшафт, false = портрет

// Состояния
const isReady = playableSDK.ready;       // SDK инициализирован
const isStarted = playableSDK.started;   // Playable начат
const isPaused = playableSDK.paused;     // На паузе
const isFinished = playableSDK.finished; // Завершён

// Взаимодействия
const count = playableSDK.interactions;  // Счётчик кликов пользователя
```

## Полный пример использования

```typescript
import playableSDK from './sdk-wrapper';

// 1. Инициализация
playableSDK.init((width, height) => {
  // Инициализация рендерера
  const renderer = new ThreeRenderer();
  renderer.init(canvas, width, height);
  
  // Загрузка ассетов
  loadAssets().then(() => {
    // 2. Старт после загрузки
    playableSDK.start();
  });
});

// 3. Подписка на события
playableSDK.onCustomEvent('first_interact', () => {
  hideTutorial();
  startGameplay();
});

playableSDK.onCustomEvent('level_complete', (payload) => {
  if (payload.win) {
    showVictoryScreen();
    playableSDK.finish();
  } else {
    showDefeatScreen();
  }
});

// 4. Геймплей
function onUserClickRoute() {
  const startTime = Date.now();
  
  // Движение машинки...
  
  carSprite.onArrival(() => {
    const time_ms = Date.now() - startTime;
    playableSDK.trackCustomEvent('level_complete', {
      win: true,
      time_ms
    });
  });
}

// 5. CTA
function onCTAButtonClick() {
  playableSDK.install(); // Автоматически вызовет cta_click
}

// 6. Обработка ошибок
try {
  // Рискованный код
} catch (error) {
  playableSDK.trackCustomEvent('error', {
    code: 'gameplay_error',
    detail: String(error)
  });
}
```

## Инструментация (Instrumentation Map)

Согласно `.specify/memory/specs/playable-core/integrations/instrumentation-map.md`:

| Событие        | Когда вызывается                                      | Код                                                    |
|----------------|-------------------------------------------------------|--------------------------------------------------------|
| game_start     | После `sdk.init()` и готовности ассетов              | Автоматически в `playableSDK.start()`                  |
| first_interact | Первый `pointerdown` пользователя (one-shot)          | Автоматически при первом SDK.interaction               |
| level_complete | Победа/поражение (машинка достигла B или препятствия) | `playableSDK.trackCustomEvent('level_complete', {...})` |
| cta_click      | Клик по кнопке «Скачать 2ГИС»                         | Автоматически в `playableSDK.install()`                |
| error          | Runtime-ошибки, ошибки загрузки ассетов               | `playableSDK.trackCustomEvent('error', {...})`          |

## Запрещённые практики

❌ **НЕ используйте `window.open()` для EXIT**
```typescript
// ❌ ПЛОХО
button.onclick = () => window.open('https://...');

// ✅ ХОРОШО
button.onclick = () => playableSDK.install();
```

❌ **НЕ проверяйте сеть в UI-коде**
```typescript
// ❌ ПЛОХО
if (AD_NETWORK === 'facebook') {
  // Фейсбук-специфичная логика
}

// ✅ ХОРОШО
// Различия решает SDK/сборка, UI-код общий
```

## Дополнительные ресурсы

- [@smoud/playable-sdk GitHub](https://github.com/smoudjs/playable-sdk)
- [MRAID 3.0 Specification](https://www.iab.com/guidelines/mraid/)
- [Constitution](../.specify/memory/constitution.md)
- [Events Contract](../.specify/memory/specs/playable-core/events-contract.md)
- [Instrumentation Map](../.specify/memory/specs/playable-core/integrations/instrumentation-map.md)


