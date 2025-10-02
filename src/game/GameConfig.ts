import * as THREE from 'three';
import { getWaypointPosition, getPositionBetween } from './MapWaypoints';

/**
 * Конфигурация игры в зависимости от ориентации
 */

export type Orientation = 'portrait' | 'landscape';

export interface GameOrientationConfig {
  // Стартовая позиция машинки
  carStartPosition: THREE.Vector3;
  
  // Позиции препятствий
  obstacleLeftPosition: THREE.Vector3; // Пробка на левом маршруте
  obstacleRightPosition: THREE.Vector3; // Знак STOP на правом маршруте
  
  // Позиции остановки машинки
  stopLeftPosition: THREE.Vector3; // Где останавливается машинка слева
  stopRightPosition: THREE.Vector3; // Где останавливается машинка справа
}

/**
 * Конфигурации для разных ориентаций
 */
export const GAME_CONFIG: Record<Orientation, GameOrientationConfig> = {
  portrait: {
    // Стартовая позиция: текущая (start-3, Z=20)
    carStartPosition: getWaypointPosition('start-3'),
    
    // Препятствия между точками road-left-1 и road-left-2
    obstacleLeftPosition: getPositionBetween('road-left-1', 'road-left-2'),
    obstacleRightPosition: getPositionBetween('road-right-1', 'road-right-2'),
    
    // Остановка машинки чуть раньше препятствий
    stopLeftPosition: getPositionBetween('road-left-1', 'road-left-2', 0.4),
    stopRightPosition: getPositionBetween('road-right-1', 'road-right-2', 0.4),
  },
  
  landscape: {
    // Стартовая позиция: road-bottom-1 (Z=12)
    carStartPosition: getWaypointPosition('road-bottom-1'),
    
    // Препятствия между точками road-left-3 и road-left-4
    obstacleLeftPosition: getPositionBetween('road-left-3', 'road-left-4'),
    obstacleRightPosition: getPositionBetween('road-right-3', 'road-right-4'),
    
    // Остановка машинки чуть раньше препятствий
    stopLeftPosition: getPositionBetween('road-left-3', 'road-left-4', 0.4),
    stopRightPosition: getPositionBetween('road-right-3', 'road-right-4', 0.4),
  },
};

/**
 * Определить текущую ориентацию на основе aspect ratio
 */
export function getCurrentOrientation(width: number, height: number): Orientation {
  const aspect = width / height;
  return aspect > 1 ? 'landscape' : 'portrait';
}

/**
 * Получить конфигурацию для текущей ориентации
 */
export function getGameConfig(width: number, height: number): GameOrientationConfig {
  const orientation = getCurrentOrientation(width, height);
  return GAME_CONFIG[orientation];
}

