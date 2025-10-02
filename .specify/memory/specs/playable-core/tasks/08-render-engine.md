# Task 08 — Выбор и подключение рендер-движка (Three.js для 3D-карты)

## Цель
Выбрать оптимальный рендер-движок с учётом бюджетов (ZIP ≤ 5 MB, 60 FPS) и подключить его.

## Описание
- **Оценка вариантов**:
  - **Canvas 2D (нативный)**: ~0 KB, простота, но плоский визуал.
  - **Pixi.js (v7)**: ~100–150 KB, 2D WebGL, но без объёма/теней.
  - **Phaser**: ~200–300 KB, 2D-фокус, избыточен для карт.
  - **Three.js**: ~150–200 KB, 3D WebGL — **ВЫБРАН**.

- **Обоснование выбора Three.js**:
  - ✅ **Визуальное превосходство**: изометрический вид карты (камера сверху под углом), объёмные модели машинок/препятствий, тени, глубина.
  - ✅ **Эффектные анимации**: 3D-ковш экскаватора, объёмные машины в пробке, реалистичные знаки.
  - ✅ **Узнаваемость бренда 2ГИС**: современное приложение с 3D-картами → playable должен отражать это.
  - ✅ **Бюджет**: ~150-200 KB укладывается в 5 MB; low-poly модели обеспечат 60 FPS на mid-tier.
  - ✅ **Вид сверху**: ортографическая камера или перспектива с наклоном — соответствует brief (строка 28).

- **Реализация**:
  - Установить `three@^0.160.0` (минимальная сборка, tree-shaking).
  - Создать `src/renderer/ThreeRenderer.ts` с базовыми методами:
    - `init(container: HTMLElement): void` — создать сцену, камеру (OrthographicCamera или PerspectiveCamera с top-down углом), renderer.
    - `render(): void` — основной цикл рендеринга (`requestAnimationFrame`).
    - `resize(width: number, height: number): void` — обработка resize, обновление aspect ratio камеры.
    - `add(object: THREE.Object3D): void` — добавление объектов (машинка, препятствия, маршруты).
  - Настроить освещение: `AmbientLight` + `DirectionalLight` для теней.
  - Оптимизация: импортировать только нужные модули (`Scene`, `OrthographicCamera`, `WebGLRenderer`, `MeshBasicMaterial`, etc.).

## Технические требования
- Рендер должен поддерживать 60 FPS на mid-tier Android/iOS.
- Итоговый размер бандла ≤ 5 MB (проверить после подключения).

## Acceptance
- [x] Three.js установлен ✅ (three@^0.160.0, установлен в Task 01).
- [x] `src/renderer/ThreeRenderer.ts` создан (270 строк) с методами:
  - [x] `init(canvas, width, height)` — создаёт сцену, камеру, рендерер ✅
  - [x] `render()` — рендерит один кадр ✅
  - [x] `resize(width, height)` — обновляет aspect ratio и размеры ✅
  - [x] `add(object)` / `remove(object)` — добавление/удаление объектов ✅
  - [x] `startRenderLoop(callback?)` — запуск цикла рендеринга ✅
  - [x] `stopRenderLoop()` — остановка ✅
  - [x] `dispose()` — очистка ресурсов ✅
- [x] Сцена отображается: тестовый куб (машинка-placeholder) + плоскость (земля) ✅
- [x] Камера настроена: `PerspectiveCamera` с позицией `(0, 15, 20)`, вид сверху под углом ~35° ✅
- [x] Освещение настроено: `AmbientLight` + `DirectionalLight` с тенями ✅
- [x] Тени включены: `shadowMap.enabled = true`, `PCFSoftShadowMap` ✅
- [x] `render()` вызывается в `requestAnimationFrame` через `startRenderLoop()` ✅
- [x] `main.ts` обновлён: инициализация ThreeRenderer в SDK callback ✅
- [x] Обработка resize: двойная защита ✅
  - [x] SDK events → `renderer.resize()` (prod)
  - [x] Window resize listener → `renderer.resize()` (локальные тестеры, fallback)
  - [x] Debounce 100ms для производительности
  - [x] Работает в реальном времени без перезагрузки страницы
- [x] **Максимальная адаптивность через OrthographicCamera** ✅:
  - [x] Изометрическая проекция (нет перспективных искажений)
  - [x] Portrait (aspect < 1): viewport расширяется по вертикали
  - [x] Landscape (aspect > 1): viewport расширяется по горизонтали
  - [x] Сцена ВСЕГДА помещается полностью на любом экране
  - [x] Динамическое пересчёт viewport при resize
  - [x] Базовый размер сцены: 10 единиц (оптимальный zoom-in)
  - [x] `renderer.setPixelRatio(1)` для точного соответствия canvas буфера CSS размерам
  - [x] Canvas: `position: fixed` + `100dvh` для заполнения viewport без полос
  - [x] Фон сцены (`scene.background`) совпадает с цветом земли (#2c3e50)
- [x] Обоснование выбора Three.js зафиксировано в `ThreeRenderer.ts` (комментарии) ✅
- [x] Итоговый бандл: 461 KB (0.461 MB) — укладывается в бюджет 5 MB ✅
- [x] Gzip: 114 KB (сжимается в 4 раза) ✅
- [x] Сборка успешна без ошибок ✅

## Оценка
~1 час
