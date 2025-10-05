import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';

// @ts-ignore
import carModelUrl from '@/assets/car/Models/GLB format/hatchback-sports.glb?url';
// @ts-ignore
import carTextureUrl from '@/assets/car/Models/GLB format/Textures/colormap.png?url';

export interface CarSpriteOptions {
  onArrival?: () => void;
}

export default class CarSprite {
  private mesh: THREE.Group;
  private position: THREE.Vector3;
  private route: THREE.Vector3[] = [];
  private currentWaypointIndex = 0;
  private speed = 5; // units per second
  private onArrival?: () => void;
  private isMoving = false;
  private modelLoaded = false;
  private loadPromise?: Promise<void>;

  constructor(options: CarSpriteOptions = {}) {
    this.mesh = new THREE.Group();
    this.position = new THREE.Vector3(0, 0.6, 0); // Y=0.6 для высоты над дорогой
    this.onArrival = options.onArrival;

    // Начинаем загрузку модели
    this.loadPromise = this.loadCarModel();
  }

  /**
   * Загружает 3D модель машины
   */
  private async loadCarModel(): Promise<void> {
    try {
      const gltfLoader = new GLTFLoader();
      const textureLoader = new THREE.TextureLoader();

      console.log('[CarSprite] Loading car model and texture...');

      // Параллельная загрузка модели и текстуры
      const [gltf, colormap] = await Promise.all([
        gltfLoader.loadAsync(carModelUrl),
        textureLoader.loadAsync(carTextureUrl),
      ]);

      // Настройка текстуры
      colormap.colorSpace = THREE.SRGBColorSpace;
      colormap.flipY = false;

      console.log('[CarSprite] Colormap loaded successfully');

      // Применяем текстуру ко всем материалам
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat) {
            // Удаляем вершинные цвета если есть
            if (child.geometry.attributes.color) {
              child.geometry.deleteAttribute('color');
            }

            mat.map = colormap;
            mat.needsUpdate = true;
            console.log('[CarSprite] Applied colormap to material');
          }

          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // Нормализация: масштабируем до 3.5 метров, центрируем, поворачиваем
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      const maxDim = Math.max(size.x, size.y, size.z);
      const targetSize = 3.5;
      const scale = targetSize / maxDim;

      gltf.scene.scale.setScalar(scale);
      gltf.scene.position.sub(center.multiplyScalar(scale));

      // Поворот: машина бампером вперед (rotation.y = Math.PI)
      gltf.scene.rotation.y = Math.PI;

      this.mesh.add(gltf.scene);
      this.modelLoaded = true;

      console.log('[CarSprite] ✅ Car model loaded and configured (bumper forward)');
    } catch (error) {
      console.error('[CarSprite] ❌ Failed to load car model:', error);
      throw error;
    }
  }

  /**
   * Ждёт завершения загрузки модели
   */
  public async waitForModelLoad(): Promise<void> {
    if (this.modelLoaded) return;
    if (this.loadPromise) {
      await this.loadPromise;
    }
  }

  /**
   * Возвращает THREE.Group для добавления в сцену
   */
  public getMesh(): THREE.Group {
    return this.mesh;
  }

  /**
   * Устанавливает позицию машины
   */
  public setPosition(position: THREE.Vector3): void {
    this.position.x = position.x;
    this.position.z = position.z;
    this.position.y = 0.6; // Фиксированная высота над дорогой
    this.mesh.position.copy(this.position);
  }

  /**
   * Возвращает текущую позицию машины
   */
  public getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  /**
   * Сбрасывает ротацию машины (смотрит прямо вверх)
   */
  public resetRotation(): void {
    // Сбрасываем ротацию mesh к исходному состоянию (смотрит вверх)
    this.mesh.rotation.set(0, 0, 0);
    console.log('[CarSprite] Rotation reset to forward (up)');
  }

  /**
   * Запускает движение по маршруту
   */
  public moveTo(route: THREE.Vector3[]): void {
    if (route.length === 0) {
      console.warn('[CarSprite] Empty route provided');
      return;
    }

    this.route = route;
    this.currentWaypointIndex = 0;
    this.isMoving = true;

    console.log(`[CarSprite] Starting movement along ${route.length} waypoints`);
  }

  /**
   * Обновление каждый кадр (движение)
   */
  public update(deltaTime: number): void {
    if (!this.isMoving || this.route.length === 0) return;

    const targetWaypoint = this.route[this.currentWaypointIndex];
    if (!targetWaypoint) return;

    // Вычисляем направление только по X и Z (игнорируем Y)
    const targetFlat = new THREE.Vector3(targetWaypoint.x, this.position.y, targetWaypoint.z);
    const direction = new THREE.Vector3()
      .subVectors(targetFlat, this.position)
      .normalize();

    // Расстояние по горизонтали (игнорируем Y)
    const dx = targetWaypoint.x - this.position.x;
    const dz = targetWaypoint.z - this.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    const step = this.speed * deltaTime;

    if (distance <= step) {
      // Достигли точки
      this.position.x = targetWaypoint.x;
      this.position.z = targetWaypoint.z;
      this.currentWaypointIndex++;

      if (this.currentWaypointIndex >= this.route.length) {
        // Достигли конца маршрута
        this.isMoving = false;
        console.log('[CarSprite] ✅ Route completed');
        if (this.onArrival) {
          this.onArrival();
        }
      }
    } else {
      // Движемся к точке (только по X и Z)
      this.position.x += direction.x * step;
      this.position.z += direction.z * step;
    }

    // Фиксируем высоту и обновляем mesh
    this.position.y = 0.6; // Фиксированная высота над дорогой
    this.mesh.position.copy(this.position);

    // Поворачиваем машину в направлении движения
    if (this.isMoving && direction.length() > 0.01) {
      // lookAt смотрит "назад", поэтому инвертируем direction
      const lookAtPoint = this.position.clone().add(direction.negate());
      this.mesh.lookAt(lookAtPoint);
    }
  }
}

