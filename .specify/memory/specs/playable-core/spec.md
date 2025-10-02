# Playable Spec (Core) — пересборка под максимальную адаптивность

## Цель
Единый HTML5 playable (один `index.html`) с полной адаптацией под любые экраны, кросс-сетевой SDK и изометрическим 3D-рендером.

## Технологический стек
- Язык/сборка: TypeScript + Vite + `vite-plugin-singlefile` (один HTML, все ассеты inline/base64).
- Рендер: Three.js `OrthographicCamera` (изометрия, без перспективных искажений).
- SDK: `@smoud/playable-sdk` (init/on/start/finish/install/track), обёртка с типами и кастомными событиями.
- 3D-модели: GLB (GLTF Binary) через `GLTFLoader` из `three-stdlib` с инлайн-текстурами через `?url`.

## Сборка/окружения
- Команды: `npm run build <network-orientation>` для портрет/ландшафт, сети Mintegral/Unity/Bigo.
- Переменные: `VITE_AD_NETWORK`, `VITE_ORIENTATION` (без UI-логики по сетям).
- Single-file: результирующий билд — один `dist/index.html` (inline JS/CSS/ассеты), без внешних запросов.

## Адаптив (обязательно)
- 3D: `OrthographicCamera`; viewport рассчитывается по aspect ratio; сцена всегда помещается полностью.
- Canvas: `renderer.setPixelRatio(1)` для точного соответствия CSS размерам; `position: fixed` + `100dvh` для заполнения viewport.
- Динамическая геометрия: земля и дороги рассчитываются от границ камеры (`camera.left/right/top/bottom`) с коэффициентом запаса (scale=2 для земли, extendFactor=3 для дорог).
- Resize: двойная обработка — события SDK (prod) + `window.resize` (fallback, debounce 100ms) с пересчётом геометрии земли/дорог через `geometry.dispose()`.
- Фон сцены: `scene.background` совпадает с цветом земли (#2c3e50) для бесшовного отображения.
- UI (HUD/CTA): только `clamp()` + `vw/vh/em/rem`; `safe-area` обязателен.

## События (абстрактные имена)
- Обязательные: `game_start`, `first_interact`, `level_complete { win, time_ms }`, `cta_click`, `error { code, detail? }`.
- Привязка к моментам — см. `integrations/instrumentation-map.md`.

## Запрещено
- Любые внешние запросы (CDN, web-fonts), `window.open` для EXIT.
- Любая логика `if Meta/Google/...` в UI-коде (всё различия на уровне SDK/сборки).

## Бюджеты
- ZIP ≤ 5 MB; 60 FPS; TTFI ≤ 300 ms.

## Интеграция 3D-моделей с текстурами (GLB)

### Требования к моделям
1. **Формат:** GLB (GLTF Binary) — обязательно. OBJ/FBX не поддерживаются для production.
2. **Размер:** ≤ 500 KB на модель (low-poly, 300-1000 полигонов).
3. **Текстуры:** Должны быть либо:
   - **Встроены в GLB** (preferred), либо
   - **В отдельной папке** (`Textures/colormap.png`) — тогда загружаются через `TextureLoader` и применяются вручную.
4. **Масштаб:** Любой (автонормализация до 3-4 метров в коде).
5. **Ориентация:** Любая (автоматический разворот через `rotation.y = Math.PI`).

### Алгоритм интеграции (пример: машина sedan.glb)

#### Шаг 1: Добавление файлов
```
src/assets/car/
  ├── Models/
  │   └── GLB format/
  │       ├── sedan.glb          # 3D-модель
  │       └── Textures/
  │           └── colormap.png   # Текстура (если не встроена в GLB)
```

#### Шаг 2: Импорт через ?url (инлайн в single-file билд)
```typescript
// src/game/CarSprite.ts
import { GLTFLoader } from 'three-stdlib';
// @ts-ignore — Vite обрабатывает ?url для GLB
import sedanGlbUrl from '@/assets/car/Models/GLB format/sedan.glb?url';
// @ts-ignore — Vite обрабатывает ?url для текстур
import colormapUrl from '@/assets/car/Models/GLB format/Textures/colormap.png?url';
```

#### Шаг 3: Загрузка GLB + текстура параллельно
```typescript
public async loadCarModel(glbUrl: string): Promise<void> {
  const gltfLoader = new GLTFLoader();
  const textureLoader = new THREE.TextureLoader();
  
  // Загружаем модель и текстуру одновременно
  const [gltf, colormap] = await Promise.all([
    gltfLoader.loadAsync(glbUrl),
    textureLoader.loadAsync(colormapUrl)
  ]);
  
  const carObject = gltf.scene;
  
  // Настройка текстуры
  colormap.colorSpace = THREE.SRGBColorSpace;
  colormap.flipY = false; // GLB-текстуры обычно не перевёрнуты
  
  // Применяем текстуру ко всем материалам (если не встроена в GLB)
  carObject.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.material) {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((mat: any) => {
          if (mat.isMeshStandardMaterial || mat.isMeshBasicMaterial) {
            mat.map = colormap; // Применяем colormap
            mat.needsUpdate = true;
          }
        });
      }
    }
  });
  
  // Автонормализация: центрирование + масштаб
  const box = new THREE.Box3().setFromObject(carObject);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const targetLength = 3.5; // целевая длина в игровых единицах
  const scale = targetLength / Math.max(size.x, size.y, size.z);
  carObject.scale.setScalar(scale);
  carObject.position.sub(center.multiplyScalar(scale));
  carObject.position.y = 0;
  carObject.rotation.y = Math.PI; // бампер вперёд по -Z
  
  // Добавляем на сцену
  this.mesh.add(carObject);
}
```

#### Шаг 4: Vite конфигурация
```typescript
// vite.config.ts
export default defineConfig({
  assetsInclude: ['**/*.glb', '**/*.gltf'], // Разрешить импорт GLB
  build: {
    assetsInlineLimit: 100000000, // Инлайнить всё (включая GLB/текстуры)
  },
});
```

### Проверка корректности загрузки
В консоли должны появиться логи:
```
[CarSprite] Loading car model from: data:model/gltf-binary;base64,...
[CarSprite] Colormap loaded successfully
[CarSprite] Applied colormap to material: colormap
[CarSprite] Configured 5 meshes with colormap
[CarSprite] Car model loaded: 1.50x1.30x2.55, scale=1.373
```

### Troubleshooting
1. **Модель белая/серая:**
   - Проверьте консоль на ошибки `THREE.GLTFLoader: Couldn't load texture ...`
   - Если текстура не встроена в GLB → загрузите отдельно через `TextureLoader` и примените вручную (см. Шаг 3).
   
2. **Модель слишком мелкая/крупная:**
   - Измените `targetLength` в автонормализации (по умолчанию 3.5).
   
3. **Модель перевёрнута/не той стороной:**
   - Измените `rotation.y` (π для разворота на 180°).
   - Или используйте `rotation.x/z` для других осей.

### Источники моделей (CC0/Free)
- [Kenney Assets](https://kenney.nl/assets) — low-poly пакеты (Cars, City Kit, Racing Pack).
- [Poly Pizza](https://poly.pizza) — community low-poly модели.
- [Quaternius](https://quaternius.com) — Ultimate Vehicles/Buildings Pack.

## Приёмка (DoD)
См. `acceptance.md`: вес/перф; сеть=0; адаптив (нет фиксированных px, `clamp`/`vw`/`vh`/`em`/`rem`, `safe-area`); события/CTA; обе ориентации.
