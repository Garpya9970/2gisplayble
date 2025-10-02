/**
 * Three.js Renderer для 3D-карты 2ГИС
 * 
 * Обоснование выбора Three.js (Task 08):
 * - Изометрический вид карты (камера сверху под углом 30-45°)
 * - Объёмные 3D-модели машинок/препятствий
 * - Тени и глубина для реалистичности
 * - ~150-200 KB (укладывается в бюджет 5 MB)
 * - 60 FPS на mid-tier устройствах
 * 
 * Reference: https://threejs.org/docs/
 */

import * as THREE from 'three';

export class ThreeRenderer {
  private scene!: THREE.Scene;
  private camera!: THREE.OrthographicCamera; // Изменено на Orthographic для изометрии
  private renderer!: THREE.WebGLRenderer;
  private canvas!: HTMLCanvasElement;
  private animationId: number | null = null;
  private isInitialized = false;

  // Базовый размер сцены (для масштабирования)
  private readonly BASE_VIEW_SIZE = 10; // Уменьшен для zoom-in эффекта

  // Callbacks
  private onRenderCallback?: () => void;

  /**
   * Инициализация рендерера
   * @param canvas Canvas-элемент для рендеринга
   * @param width Ширина контейнера
   * @param height Высота контейнера
   */
  public init(canvas: HTMLCanvasElement, width: number, height: number): void {
    if (this.isInitialized) {
      console.warn('[ThreeRenderer] Already initialized');
      return;
    }

    this.canvas = canvas;

    try {
      // Создание сцены
      this.scene = new THREE.Scene();
      // Фон сцены под цвет земли (яркая зелёная трава), чтобы не было «чёрных полос» на краях
      this.scene.background = new THREE.Color(0x7bc74d);

      // Создание ортографической камеры для изометрического вида
      // Это обеспечивает максимальную адаптивность — сцена всегда помещается полностью
      const aspect = width / height;
      
      // Вычисление размеров viewport с учётом aspect ratio
      const { left, right, top, bottom } = this.calculateCameraBounds(aspect);
      
      this.camera = new THREE.OrthographicCamera(
        left,    // left
        right,   // right
        top,     // top
        bottom,  // bottom
        0.1,     // near
        1000     // far
      );

      // Позиция камеры: сверху под углом для изометрического вида
      this.camera.position.set(0, 15, 15);
      this.camera.lookAt(0, 0, 0);
      
      console.log(`[ThreeRenderer] OrthographicCamera initialized`);
      console.log(`[ThreeRenderer] Viewport: L=${left.toFixed(1)}, R=${right.toFixed(1)}, T=${top.toFixed(1)}, B=${bottom.toFixed(1)}`);
      console.log(`[ThreeRenderer] Aspect: ${aspect.toFixed(2)} (${aspect > 1 ? 'landscape' : 'portrait'})`);

      // Создание рендерера
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true, // Сглаживание для качества
        alpha: false, // Без прозрачности (производительность)
      });
      this.renderer.setSize(width, height);
      // Фикс: принудительно устанавливаем pixelRatio = 1 для точного соответствия CSS размерам
      this.renderer.setPixelRatio(1);

      // Включение теней для реалистичности
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      // Настройка освещения
      this.setupLights();

      // Без тестовых объектов: сцену строит игровая логика (MapScene)

      this.isInitialized = true;
      console.log('[ThreeRenderer] Initialized successfully');
      console.log(`[ThreeRenderer] Size: ${width}x${height}`);
      console.log(`[ThreeRenderer] Camera position:`, this.camera.position);

    } catch (error) {
      console.error('[ThreeRenderer] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Вычисление границ камеры с учётом aspect ratio
   * Обеспечивает адаптивность: сцена всегда помещается полностью
   */
  private calculateCameraBounds(aspect: number): { left: number; right: number; top: number; bottom: number } {
    const viewSize = this.BASE_VIEW_SIZE;
    
    if (aspect > 1) {
      // Landscape: расширяем по горизонтали
      return {
        left: -viewSize * aspect,
        right: viewSize * aspect,
        top: viewSize,
        bottom: -viewSize,
      };
    } else {
      // Portrait: расширяем по вертикали
      return {
        left: -viewSize,
        right: viewSize,
        top: viewSize / aspect,
        bottom: -viewSize / aspect,
      };
    }
  }

  /**
   * Настройка освещения сцены
   */
  private setupLights(): void {
    // Hemisphere Light — естественное освещение (небо + земля)
    const hemisphereLight = new THREE.HemisphereLight(
      0xffffff, // цвет неба (белый)
      0x444444, // цвет земли (тёмно-серый)
      1.2        // интенсивность (усиленная)
    );
    this.scene.add(hemisphereLight);

    // Ambient Light — общее яркое освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // увеличено с 0.6 до 1.0
    this.scene.add(ambientLight);

    // Directional Light — направленный свет для теней (усиленный)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // увеличено с 0.8 до 1.5
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;

    // Настройка теней
    directionalLight.shadow.mapSize.width = 2048; // увеличено для качества
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -25;
    directionalLight.shadow.camera.right = 25;
    directionalLight.shadow.camera.top = 25;
    directionalLight.shadow.camera.bottom = -25;

    this.scene.add(directionalLight);

    console.log('[ThreeRenderer] Enhanced lights configured (HemisphereLight + stronger AmbientLight + DirectionalLight)');
  }

  /**
   * Добавление тестового куба для проверки рендеринга
   */
  // Тестовый объект удалён — сцену строит игровая логика (MapScene)

  /**
   * Добавление объекта на сцену
   * @param object THREE.Object3D (Mesh, Group, и т.д.)
   */
  public add(object: THREE.Object3D): void {
    if (!this.isInitialized) {
      console.warn('[ThreeRenderer] Not initialized. Call init() first.');
      return;
    }

    this.scene.add(object);
  }

  /**
   * Удаление объекта со сцены
   * @param object THREE.Object3D
   */
  public remove(object: THREE.Object3D): void {
    if (!this.isInitialized) return;
    this.scene.remove(object);
  }

  /**
   * Начать цикл рендеринга
   * @param callback Опциональный callback, вызываемый каждый кадр
   */
  public startRenderLoop(callback?: () => void): void {
    if (!this.isInitialized) {
      console.warn('[ThreeRenderer] Not initialized. Call init() first.');
      return;
    }

    this.onRenderCallback = callback;

    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      
      // Пользовательский callback (для обновления игровой логики)
      if (this.onRenderCallback) {
        this.onRenderCallback();
      }

      // Рендеринг сцены
      this.render();
    };

    animate();
    console.log('[ThreeRenderer] Render loop started');
  }

  /**
   * Остановить цикл рендеринга
   */
  public stopRenderLoop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
      console.log('[ThreeRenderer] Render loop stopped');
    }
  }

  /**
   * Рендеринг одного кадра
   */
  public render(): void {
    if (!this.isInitialized) return;
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Обработка изменения размеров
   * @param width Новая ширина
   * @param height Новая высота
   */
  public resize(width: number, height: number): void {
    if (!this.isInitialized) return;

    const aspect = width / height;
    
    // Пересчёт границ ортографической камеры
    const { left, right, top, bottom } = this.calculateCameraBounds(aspect);
    
    this.camera.left = left;
    this.camera.right = right;
    this.camera.top = top;
    this.camera.bottom = bottom;
    this.camera.updateProjectionMatrix();

    // Обновление размера рендерера
    this.renderer.setSize(width, height);

    console.log(`[ThreeRenderer] Resized to ${width}x${height}, aspect: ${aspect.toFixed(2)}`);
    console.log(`[ThreeRenderer] Viewport: L=${left.toFixed(1)}, R=${right.toFixed(1)}, T=${top.toFixed(1)}, B=${bottom.toFixed(1)}`);
  }

  /**
   * Очистка ресурсов
   */
  public dispose(): void {
    this.stopRenderLoop();

    if (this.renderer) {
      this.renderer.dispose();
    }

    // Очистка сцены
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    console.log('[ThreeRenderer] Disposed');
  }

  /**
   * Геттеры для доступа к Three.js объектам
   */
  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getCamera(): THREE.OrthographicCamera {
    return this.camera;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  public get initialized(): boolean {
    return this.isInitialized;
  }
}

export default ThreeRenderer;
