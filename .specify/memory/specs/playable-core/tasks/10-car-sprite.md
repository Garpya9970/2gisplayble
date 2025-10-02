# Task 10 — Спрайт машинки и анимация движения по маршруту (lerp)

## Цель
Реализовать спрайт машинки, анимацию движения по выбранной полилинии (линейная интерполяция).

## Описание
- Создать `src/game/CarSprite.ts`:
  - **3D-модель машинки**: импорт `src/assets/350z.obj` (позже конвертируем в GLB для inline), масштаб/центрирование под сцену.
  - Метод `moveTo(route: {x, y, z}[]): void` — запустить анимацию движения по маршруту.
  - Движение: по сплайну/линиям (CatmullRomCurve3), скорость: 5–10 ед/сек.
  - Повороты: плавный `lookAt(nextPoint)`; easing на поворотах перекрёстка.
- По достижении финальной точки → событие `onArrival()`.

## Технические требования
- Использовать `requestAnimationFrame` / render loop.
- Движение по кривой: параметризация t∈[0..1], расчёт позиции/нормали для `lookAt`.
- Адаптивность: масштаб/позиции не зависят от пикселей экрана (scene units).
- Модель ≤ 500 полигонов; при необходимости заменить на примитивы до конвертации в GLB.

## Acceptance
- [x] Машинка отображается на сцене, плавно движется по выбранному маршруту.
- [x] Анимация работает при 60 FPS без тормозов.
- [x] По достижении финальной точки срабатывает событие `onArrival()`.
- [x] Машинка поворачивается в направлении движения (автоматический `lookAt`).
- [x] **Адаптивные стартовые позиции** (см. `GameConfig.ts`):
  - Portrait: `start-3` (Z=20)
  - Landscape: `road-bottom-1` (Z=12)
  - Автоперемещение при смене ориентации (если машинка не движется)
- [x] **Маршруты с препятствиями**:
  - Left/Right: остановка перед препятствием в зависимости от ориентации
  - Straight (победа): машинка уезжает за дорогу, камера останавливается раньше
- [x] **Система waypoints** (`MapWaypoints.ts`): 23 именованные точки с шагом 4 ед.

## Оценка
~1.5 часа

## История изменений

### Восстановление класса (02.10.2025)
- **Проблема**: Файл `CarSprite.ts` был случайно очищен/удалён
- **Решение**: Класс полностью восстановлен на основе использования в `MapScene.ts`
- **Реализация**:
  - Загрузка GLB модели (`hatchback-sports.glb`) с текстурой `colormap.png`
  - Параллельная загрузка модели и текстуры через `Promise.all`
  - Метод `waitForModelLoad()` для синхронизации с `MapScene.init()`
  - Автонормализация: масштаб до 3.5 единиц, центрирование, поворот `rotation.y = Math.PI`
  - Корректная ориентация: машинка стоит бампером вперёд

### Исправление высоты машинки (02.10.2025)
- **Проблема**: Машинка "проваливалась" в текстуры дороги
- **Причины**:
  1. Дорога находится на высоте Y=0.05
  2. Машинка изначально была на Y=0
  3. При движении Y-координата менялась из-за waypoints
- **Решение**:
  - Установлена фиксированная высота **Y = 0.6** над дорогой
  - Движение происходит только по X и Z (горизонтали)
  - Y фиксируется в трёх местах:
    - Конструктор: `position = new THREE.Vector3(0, 0.6, 0)`
    - `setPosition()`: `position.y = 0.6`
    - `update()`: `position.y = 0.6` перед обновлением mesh
- **Улучшения**:
  - Расстояние вычисляется по 2D: `Math.sqrt(dx*dx + dz*dz)`
  - Направление движения игнорирует Y: `targetFlat = new THREE.Vector3(x, this.position.y, z)`
  - Устранены "подергивания" при движении

### Формат модели
- **Окончательный выбор**: GLB (hatchback-sports.glb) из Kenney Car Kit
- **Причины**:
  - Компактный формат с инлайн-геометрией
  - Поддержка текстур через `colormap.png`
  - Правильные цвета при явной загрузке текстуры
  - Удаление vertex colors для корректного рендеринга
- **Альтернативы (не сработали)**:
  - OBJ: требует отдельный MTL, проблемы с цветами
  - Встроенные текстуры в GLB: перезаписывались vertex colors

### Код восстановленного класса
```typescript
// src/game/CarSprite.ts
export default class CarSprite {
  private mesh: THREE.Group;
  private position: THREE.Vector3;
  private route: THREE.Vector3[] = [];
  private currentWaypointIndex = 0;
  private speed = 5; // units per second
  private onArrival?: () => void;
  private isMoving = false;
  private modelLoaded = false;
  
  constructor(options: CarSpriteOptions = {}) {
    this.mesh = new THREE.Group();
    this.position = new THREE.Vector3(0, 0.6, 0); // Фиксированная высота
    this.onArrival = options.onArrival;
    this.loadPromise = this.loadCarModel();
  }
  
  public async waitForModelLoad(): Promise<void> { }
  public getMesh(): THREE.Group { }
  public setPosition(position: THREE.Vector3): void {
    this.position.x = position.x;
    this.position.z = position.z;
    this.position.y = 0.6; // Фиксированная высота
  }
  public getPosition(): THREE.Vector3 { }
  public moveTo(route: THREE.Vector3[]): void { }
  public update(deltaTime: number): void {
    // Движение только по X и Z
    // Y всегда = 0.6
  }
}
```
