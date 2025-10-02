import * as THREE from 'three';

/**
 * Именованные точки на карте (waypoints)
 * Используются для позиционирования машинки, препятствий, камеры
 */

export type WaypointId = 
  // Стартовые позиции
  | 'start-1' | 'start-2' | 'start-3' | 'start-4'
  
  // Дорога снизу к перекрёстку (Z: 20 → 0)
  | 'road-bottom-1' | 'road-bottom-2' | 'road-bottom-3' | 'road-bottom-4'
  
  // Перекрёсток
  | 'intersection-center'
  
  // Дорога вверх от перекрёстка (Z: 0 → -20)
  | 'road-top-1' | 'road-top-2' | 'road-top-3' | 'road-top-4' | 'road-top-5'
  
  // Дорога налево от перекрёстка (X: 0 → -20)
  | 'road-left-1' | 'road-left-2' | 'road-left-3' | 'road-left-4' | 'road-left-5'
  
  // Дорога направо от перекрёстка (X: 0 → 20)
  | 'road-right-1' | 'road-right-2' | 'road-right-3' | 'road-right-4' | 'road-right-5';

export interface Waypoint {
  id: WaypointId;
  position: THREE.Vector3;
  description: string;
}

/**
 * Все именованные точки на карте
 * Сетка точек с шагом ~4-5 единиц по всем дорогам
 */
export const WAYPOINTS: Record<WaypointId, Waypoint> = {
  // === СТАРТОВЫЕ ПОЗИЦИИ (далеко внизу) ===
  'start-1': {
    id: 'start-1',
    position: new THREE.Vector3(0, 0.2, 28),
    description: 'Старт 1 (самый дальний)'
  },
  'start-2': {
    id: 'start-2',
    position: new THREE.Vector3(0, 0.2, 24),
    description: 'Старт 2'
  },
  'start-3': {
    id: 'start-3',
    position: new THREE.Vector3(0, 0.2, 20),
    description: 'Старт 3'
  },
  'start-4': {
    id: 'start-4',
    position: new THREE.Vector3(0, 0.2, 16),
    description: 'Старт 4 (ближе к перекрёстку)'
  },

  // === ДОРОГА СНИЗУ К ПЕРЕКРЁСТКУ (Z: 20 → 0) ===
  'road-bottom-1': {
    id: 'road-bottom-1',
    position: new THREE.Vector3(0, 0.2, 12),
    description: 'Дорога снизу, точка 1'
  },
  'road-bottom-2': {
    id: 'road-bottom-2',
    position: new THREE.Vector3(0, 0.2, 8),
    description: 'Дорога снизу, точка 2 (перед перекрёстком)'
  },
  'road-bottom-3': {
    id: 'road-bottom-3',
    position: new THREE.Vector3(0, 0.2, 4),
    description: 'Дорога снизу, точка 3'
  },
  'road-bottom-4': {
    id: 'road-bottom-4',
    position: new THREE.Vector3(0, 0.2, 2),
    description: 'Дорога снизу, точка 4 (вход в перекрёсток)'
  },

  // === ПЕРЕКРЁСТОК ===
  'intersection-center': {
    id: 'intersection-center',
    position: new THREE.Vector3(0, 0.2, 0),
    description: 'Центр перекрёстка'
  },

  // === ДОРОГА ВВЕРХ ОТ ПЕРЕКРЁСТКА (Z: 0 → -20) ===
  'road-top-1': {
    id: 'road-top-1',
    position: new THREE.Vector3(0, 0.2, -4),
    description: 'Дорога вверх, точка 1'
  },
  'road-top-2': {
    id: 'road-top-2',
    position: new THREE.Vector3(0, 0.2, -8),
    description: 'Дорога вверх, точка 2'
  },
  'road-top-3': {
    id: 'road-top-3',
    position: new THREE.Vector3(0, 0.2, -12),
    description: 'Дорога вверх, точка 3'
  },
  'road-top-4': {
    id: 'road-top-4',
    position: new THREE.Vector3(0, 0.2, -16),
    description: 'Дорога вверх, точка 4'
  },
  'road-top-5': {
    id: 'road-top-5',
    position: new THREE.Vector3(0, 0.2, -20),
    description: 'Дорога вверх, точка 5 (конец прямого маршрута)'
  },

  // === ДОРОГА НАЛЕВО ОТ ПЕРЕКРЁСТКА (X: 0 → -20) ===
  'road-left-1': {
    id: 'road-left-1',
    position: new THREE.Vector3(-4, 0.2, 0),
    description: 'Дорога налево, точка 1'
  },
  'road-left-2': {
    id: 'road-left-2',
    position: new THREE.Vector3(-8, 0.2, 0),
    description: 'Дорога налево, точка 2'
  },
  'road-left-3': {
    id: 'road-left-3',
    position: new THREE.Vector3(-12, 0.2, 0),
    description: 'Дорога налево, точка 3'
  },
  'road-left-4': {
    id: 'road-left-4',
    position: new THREE.Vector3(-16, 0.2, 0),
    description: 'Дорога налево, точка 4'
  },
  'road-left-5': {
    id: 'road-left-5',
    position: new THREE.Vector3(-20, 0.2, 0),
    description: 'Дорога налево, точка 5 (конец левого маршрута)'
  },

  // === ДОРОГА НАПРАВО ОТ ПЕРЕКРЁСТКА (X: 0 → 20) ===
  'road-right-1': {
    id: 'road-right-1',
    position: new THREE.Vector3(4, 0.2, 0),
    description: 'Дорога направо, точка 1'
  },
  'road-right-2': {
    id: 'road-right-2',
    position: new THREE.Vector3(8, 0.2, 0),
    description: 'Дорога направо, точка 2'
  },
  'road-right-3': {
    id: 'road-right-3',
    position: new THREE.Vector3(12, 0.2, 0),
    description: 'Дорога направо, точка 3'
  },
  'road-right-4': {
    id: 'road-right-4',
    position: new THREE.Vector3(16, 0.2, 0),
    description: 'Дорога направо, точка 4'
  },
  'road-right-5': {
    id: 'road-right-5',
    position: new THREE.Vector3(20, 0.2, 0),
    description: 'Дорога направо, точка 5 (конец правого маршрута)'
  },
};

/**
 * Получить waypoint по ID
 */
export function getWaypoint(id: WaypointId): Waypoint {
  return WAYPOINTS[id];
}

/**
 * Получить позицию waypoint
 */
export function getWaypointPosition(id: WaypointId): THREE.Vector3 {
  return WAYPOINTS[id].position.clone();
}

/**
 * Получить позицию между двумя waypoints (интерполяция)
 */
export function getPositionBetween(id1: WaypointId, id2: WaypointId, t = 0.5): THREE.Vector3 {
  const pos1 = getWaypointPosition(id1);
  const pos2 = getWaypointPosition(id2);
  return pos1.lerp(pos2, t);
}

/**
 * Построить маршрут из массива waypoint ID
 */
export function buildRoute(waypointIds: WaypointId[]): THREE.Vector3[] {
  return waypointIds.map(id => getWaypointPosition(id));
}

/**
 * Визуализация waypoints для отладки (маленькие сферы + текстовые метки)
 */
export function createWaypointMarkers(scene: THREE.Scene, color = 0xff00ff): void {
  Object.values(WAYPOINTS).forEach(waypoint => {
    // Сфера-маркер
    const geo = new THREE.SphereGeometry(0.4, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color });
    const marker = new THREE.Mesh(geo, mat);
    marker.position.copy(waypoint.position);
    marker.name = `waypoint-${waypoint.id}`;
    scene.add(marker);

    // Текстовая метка над сферой (используем Sprite для текста)
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      canvas.width = 256;
      canvas.height = 64;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#ffffff';
      context.font = 'bold 24px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(waypoint.id, 128, 32);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        alphaTest: 0.05,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(waypoint.position);
      sprite.position.y += 1.5; // Поднять метку над сферой
      sprite.scale.set(3, 0.75, 1); // Размер метки
      sprite.renderOrder = 999; // поверх всего
      scene.add(sprite);
    }
  });
  console.log(`[MapWaypoints] Added ${Object.keys(WAYPOINTS).length} waypoint markers with labels`);
}

