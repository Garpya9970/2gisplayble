import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import ThreeRenderer from '@/renderer/ThreeRenderer';
import playableSDK from '@/sdk-wrapper';
import CarSprite from './CarSprite';
import { createWaypointMarkers, getWaypointPosition } from './MapWaypoints';
import { getGameConfig, getCurrentOrientation, type Orientation } from './GameConfig';

// Импорты КРАСИВЫХ зданий (обычные, с цветами)
// @ts-ignore
import buildingAUrl from '@/assets/city/Models/GLB format/building-a.glb?url';
// @ts-ignore
import buildingBUrl from '@/assets/city/Models/GLB format/building-b.glb?url';
// @ts-ignore
import buildingCUrl from '@/assets/city/Models/GLB format/building-c.glb?url';
// @ts-ignore
import buildingDUrl from '@/assets/city/Models/GLB format/building-d.glb?url';
// @ts-ignore
import buildingEUrl from '@/assets/city/Models/GLB format/building-e.glb?url';
// @ts-ignore
import buildingFUrl from '@/assets/city/Models/GLB format/building-f.glb?url';
// @ts-ignore
import buildingGUrl from '@/assets/city/Models/GLB format/building-g.glb?url';
// @ts-ignore
import buildingHUrl from '@/assets/city/Models/GLB format/building-h.glb?url';
// @ts-ignore
import cityTextureUrl from '@/assets/city/Models/GLB format/Textures/colormap.png?url';

// Импорты фонарей из roads kit
// @ts-ignore
import lightSquareUrl from '@/assets/roads/Models/GLB format/light-square.glb?url';
// @ts-ignore
import roadsTextureUrl from '@/assets/roads/Models/GLB format/Textures/colormap.png?url';

type RouteId = 'left' | 'straight' | 'right';

export interface MapSceneOptions { }

export default class MapScene {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private raycaster: THREE.Raycaster;
  private pointer: THREE.Vector2;
  private interactiveMeshes: Array<{ id: RouteId; mesh: THREE.Mesh }>; 
  private firstInteractFired = false;
  private onRouteSelected?: (route: RouteId) => void;
  private ground?: THREE.Mesh;
  private mainRoad?: THREE.Mesh;
  private crossRoad?: THREE.Mesh;
  private zLine?: THREE.Mesh;
  private xLine?: THREE.Mesh;
  private canvas!: HTMLCanvasElement;
  private car?: CarSprite;
  private deltaTime = 0;
  private lastTime = performance.now();
  private currentOrientation: Orientation = 'portrait';
  private isCarMoving = false;

  constructor(
    private renderer: ThreeRenderer
  ) {
    this.scene = this.renderer.getScene();
    this.camera = this.renderer.getCamera();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.interactiveMeshes = [];
  }

  public async init(container: HTMLElement): Promise<void> {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.buildGround();
    
    // Ждём загрузки дорог (критически важно)
    await this.buildCrossRoads();
    
    this.buildRoutes();
    
    // Ждём загрузки машины (критически важно)
    await this.buildCar();
    
    // Визуализация waypoints для отладки (розовые сферы)
    createWaypointMarkers(this.scene, 0xff00ff);
    
    this.attachPointerHandlers(container);
    
    // Визуализируем сетку координат для ручного размещения
    this.buildCoordinateGrid();
    
    // Загружаем модели зданий и добавляем первое здание
    await this.loadBuildingModels().catch(err => {
      console.warn('[MapScene] Building models loading failed:', err);
    });
    
    // Создаём сплошные бетонные полосы вдоль дороги
    this.buildConcreteSidewalk();
    
    // Расставляем деревья (1 ель)
    this.populateTrees();
    
    // Добавляем дополнительные деревья в указанных точках
    this.addExtraTrees();
    
    // Добавляем фонари на углах перекрестка
    await this.addStreetLights();
    
    // ===== НИЖНЯЯ ЧАСТЬ ВЕРТИКАЛЬНОЙ ДОРОГИ (до перекрёстка) =====
    // Расстояние между рядами = 4 единицы, здания ближе к дороге (X = ±3.5)
    
    this.addBuilding("d", 3.5, 5, 2.5, 90);   // справа, Z=5
    this.addBuilding("a", -3.5, 5, 2.5, 270); // слева, Z=5
    
    this.addBuilding("b", 3.5, 9, 2.5, 90);   // справа, Z=9
    this.addBuilding("b", -3.5, 9, 2.5, 270); // слева, Z=9
    
    this.addBuilding("f", 3.5, 13, 2.5, 90);   // справа, Z=13
    this.addBuilding("g", -3.5, 13, 2.5, 270); // слева, Z=13
    
    // Дополнительные здания для портретной ориентации
    this.addBuilding("h", 3.5, 17, 2.5, 90);   // справа, Z=17
    this.addBuilding("e", -3.5, 17, 2.5, 270); // слева, Z=17
    
    this.addBuilding("c", 3.5, 21, 2.5, 90);   // справа, Z=21
    this.addBuilding("f", -3.5, 21, 2.5, 270); // слева, Z=21
    
    this.addBuilding("a", 3.5, 25, 2.5, 90);   // справа, Z=25
    this.addBuilding("d", -3.5, 25, 2.5, 270); // слева, Z=25
    
    // ===== ВЕРХНЯЯ ЧАСТЬ ВЕРТИКАЛЬНОЙ ДОРОГИ (после перекрёстка) =====
    // Такие же отступы, другие модели
    
    this.addBuilding("e", 3.5, -5, 2.5, 90);   // справа, Z=-5
    this.addBuilding("h", -3.5, -5, 2.5, 270); // слева, Z=-5
    
    this.addBuilding("c", 3.5, -9, 2.5, 90);   // справа, Z=-9
    this.addBuilding("c", -3.5, -9, 2.5, 270); // слева, Z=-9
    
    this.addBuilding("a", 3.5, -13, 2.5, 90);   // справа, Z=-13
    this.addBuilding("d", -3.5, -13, 2.5, 270); // слева, Z=-13
    
    // Дополнительные здания для портретной ориентации
    this.addBuilding("g", 3.5, -17, 2.5, 90);   // справа, Z=-17
    this.addBuilding("b", -3.5, -17, 2.5, 270); // слева, Z=-17
    
    this.addBuilding("f", 3.5, -21, 2.5, 90);   // справа, Z=-21
    this.addBuilding("h", -3.5, -21, 2.5, 270); // слева, Z=-21
    
    this.addBuilding("d", 3.5, -25, 2.5, 90);   // справа, Z=-25
    this.addBuilding("a", -3.5, -25, 2.5, 270); // слева, Z=-25
    
    // ===== ПРАВАЯ ГОРИЗОНТАЛЬНАЯ ДОРОГА =====
    // Здания вдоль правой горизонтальной дороги (начинаем с X=9, пропускаем X=5 чтобы не пересекаться)
    // Отступ от дороги Z = ±3.5, между зданиями 4 единицы
    
    this.addBuilding("h", 9, 3.5, 2.5, 0);      // сверху, X=9 (окнами вниз к дороге)
    this.addBuilding("e", 9, -3.5, 2.5, 180);   // снизу, X=9 (окнами вверх к дороге)
    
    this.addBuilding("c", 13, 3.5, 2.5, 0);     // сверху, X=13
    this.addBuilding("g", 13, -3.5, 2.5, 180);  // снизу, X=13
    
    this.addBuilding("b", 17, 3.5, 2.5, 0);     // сверху, X=17
    this.addBuilding("f", 17, -3.5, 2.5, 180);  // снизу, X=17
    
    this.addBuilding("a", 21, 3.5, 2.5, 0);     // сверху, X=21
    this.addBuilding("d", 21, -3.5, 2.5, 180);  // снизу, X=21
    
    this.addBuilding("h", 25, 3.5, 2.5, 0);     // сверху, X=25
    this.addBuilding("c", 25, -3.5, 2.5, 180);  // снизу, X=25
    
    // ===== ЛЕВАЯ ГОРИЗОНТАЛЬНАЯ ДОРОГА =====
    // Здания вдоль левой горизонтальной дороги (начинаем с X=-9, пропускаем X=-5 чтобы не пересекаться)
    // Отступ от дороги Z = ±3.5, между зданиями 4 единицы
    
    this.addBuilding("f", -9, 3.5, 2.5, 0);     // сверху, X=-9 (окнами вниз к дороге)
    this.addBuilding("g", -9, -3.5, 2.5, 180);  // снизу, X=-9 (окнами вверх к дороге)
    
    this.addBuilding("d", -13, 3.5, 2.5, 0);    // сверху, X=-13
    this.addBuilding("a", -13, -3.5, 2.5, 180); // снизу, X=-13
    
    this.addBuilding("h", -17, 3.5, 2.5, 0);    // сверху, X=-17
    this.addBuilding("e", -17, -3.5, 2.5, 180); // снизу, X=-17
    
    this.addBuilding("c", -21, 3.5, 2.5, 0);    // сверху, X=-21
    this.addBuilding("b", -21, -3.5, 2.5, 180); // снизу, X=-21
    
    this.addBuilding("g", -25, 3.5, 2.5, 0);    // сверху, X=-25
    this.addBuilding("f", -25, -3.5, 2.5, 180); // снизу, X=-25
  }

  public onSelect(handler: (route: RouteId) => void): void {
    this.onRouteSelected = handler;
  }

  public update(): void {
    // Обновление deltaTime
    const now = performance.now();
    this.deltaTime = (now - this.lastTime) / 1000; // в секундах
    this.lastTime = now;

    // Обновление машинки
    if (this.car) {
      this.car.update(this.deltaTime);
    }
  }

  public dispose(container: HTMLElement): void {
    container.removeEventListener('pointerdown', this.handlePointerDown);
  }

  private buildGround(): void {
    // Адаптивная земля: рассчитывается от границ камеры
    const width = this.camera.right - this.camera.left;
    const height = this.camera.top - this.camera.bottom;
    
    // Коэффициент запаса: земля больше видимой области в 2 раза
    const scale = 2;
    const planeGeo = new THREE.PlaneGeometry(width * scale, height * scale);
    const planeMat = new THREE.MeshStandardMaterial({ 
      color: 0x7bc74d, // яркий травяной цвет
      roughness: 0.85,
      metalness: 0.0
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    this.scene.add(plane);
    this.ground = plane;
  }

  private async buildCrossRoads(): Promise<void> {
    // Создаём простые дороги из примитивов (без 3D моделей)
    this.buildPrimitiveRoads();
  }

  /**
   * Создаёт простые дороги из примитивов (идеально ровные, без швов)
   */
  private buildPrimitiveRoads(): void {
    const width = this.camera.right - this.camera.left;
    const height = this.camera.top - this.camera.bottom;
    const extendFactor = 3;

    // Материал дороги (тёмно-серый асфальт)
    const roadMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d4451, // тёмно-серый асфальт
      roughness: 0.85,
      metalness: 0.05,
    });

    // Материал бордюра (светло-серый)
    const curbMaterial = new THREE.MeshStandardMaterial({
      color: 0xa0a0a0, // светло-серый бордюр
      roughness: 0.8,
      metalness: 0.05,
    });

    // Материал разметки (белый)
    const lineMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff, // белая разметка
      roughness: 0.7,
      metalness: 0.1,
    });

    // Вертикальная дорога (ось Z) - уменьшена до 3.5
    this.mainRoad = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 0.1, height * extendFactor),
      roadMaterial
    );
    this.mainRoad.position.set(0, 0.05, 0);
    this.mainRoad.receiveShadow = true;
    this.scene.add(this.mainRoad);

    // Горизонтальная дорога (ось X) - уменьшена до 3.5
    this.crossRoad = new THREE.Mesh(
      new THREE.BoxGeometry(width * extendFactor, 0.1, 3.5),
      roadMaterial
    );
    this.crossRoad.position.set(0, 0.05, 0);
    this.crossRoad.receiveShadow = true;
    this.scene.add(this.crossRoad);

    // ===== БОРДЮРЫ ВДОЛЬ ВЕРТИКАЛЬНОЙ ДОРОГИ =====
    // Правый бордюр (вертикальная дорога) - под дорогой
    const rightCurbV = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.1, height * extendFactor),
      curbMaterial
    );
    rightCurbV.position.set(2, 0.04, 0); // справа от дороги, под уровнем дороги
    rightCurbV.receiveShadow = true;
    this.scene.add(rightCurbV);

    // Левый бордюр (вертикальная дорога) - под дорогой
    const leftCurbV = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.1, height * extendFactor),
      curbMaterial
    );
    leftCurbV.position.set(-2, 0.04, 0); // слева от дороги, под уровнем дороги
    leftCurbV.receiveShadow = true;
    this.scene.add(leftCurbV);

    // ===== БОРДЮРЫ ВДОЛЬ ГОРИЗОНТАЛЬНОЙ ДОРОГИ =====
    // Верхний бордюр (горизонтальная дорога) - под дорогой
    const topCurbH = new THREE.Mesh(
      new THREE.BoxGeometry(width * extendFactor, 0.1, 0.5),
      curbMaterial
    );
    topCurbH.position.set(0, 0.04, 2); // сверху от дороги, под уровнем дороги
    topCurbH.receiveShadow = true;
    this.scene.add(topCurbH);

    // Нижний бордюр (горизонтальная дорога) - под дорогой
    const bottomCurbH = new THREE.Mesh(
      new THREE.BoxGeometry(width * extendFactor, 0.1, 0.5),
      curbMaterial
    );
    bottomCurbH.position.set(0, 0.04, -2); // снизу от дороги, под уровнем дороги
    bottomCurbH.receiveShadow = true;
    this.scene.add(bottomCurbH);

    // Белая разметка по центру вертикальной дороги
    this.zLine = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.11, height * extendFactor),
      lineMaterial
    );
    this.zLine.position.set(0, 0.06, 0); // чуть выше дороги
    this.scene.add(this.zLine);

    // Белая разметка по центру горизонтальной дороги
    this.xLine = new THREE.Mesh(
      new THREE.BoxGeometry(width * extendFactor, 0.11, 0.2),
      lineMaterial
    );
    this.xLine.position.set(0, 0.06, 0); // чуть выше дороги
    this.scene.add(this.xLine);

    console.log('[MapScene] ✅ Simple roads created (no 3D models, no seams)');
  }

  private routePoints: Record<RouteId, THREE.Vector3[]> = {
    straight: [],
    left: [],
    right: []
  };

  private buildRoutes(): void {
    // Для удобства кликов используем TubeGeometry (толстая линия)
    const tubeRadius = 0.5;
    const tubeRadialSegments = 8;

    // Стартовая позиция внизу экрана (нижняя дорога, Z+)
    const start = new THREE.Vector3(0, 0.2, 20);

    // Маршрут «прямо» (зеленый): с низу вверх через перекрёсток
    this.routePoints.straight = [
      start,
      new THREE.Vector3(0, 0.2, 10),
      new THREE.Vector3(0, 0.2, 0),
      new THREE.Vector3(0, 0.2, -10),
      new THREE.Vector3(0, 0.2, -20)
    ];
    const straightCurve = new THREE.CatmullRomCurve3(this.routePoints.straight);
    const straightMesh = this.createRouteMesh(straightCurve, 0x2ecc71, tubeRadius, tubeRadialSegments);
    this.scene.add(straightMesh);
    this.interactiveMeshes.push({ id: 'straight', mesh: straightMesh });

    // Маршрут «налево» (желтый): с низу до перекрёстка, затем по X- (налево)
    this.routePoints.left = [
      start,
      new THREE.Vector3(0, 0.2, 10),
      new THREE.Vector3(0, 0.2, 0),
      new THREE.Vector3(-5, 0.2, 0),
      new THREE.Vector3(-20, 0.2, 0)
    ];
    const leftCurve = new THREE.CatmullRomCurve3(this.routePoints.left);
    const leftMesh = this.createRouteMesh(leftCurve, 0xf1c40f, tubeRadius, tubeRadialSegments);
    this.scene.add(leftMesh);
    this.interactiveMeshes.push({ id: 'left', mesh: leftMesh });

    // Маршрут «направо» (красный): с низу до перекрёстка, затем по X+ (направо)
    this.routePoints.right = [
      start,
      new THREE.Vector3(0, 0.2, 10),
      new THREE.Vector3(0, 0.2, 0),
      new THREE.Vector3(5, 0.2, 0),
      new THREE.Vector3(20, 0.2, 0)
    ];
    const rightCurve = new THREE.CatmullRomCurve3(this.routePoints.right);
    const rightMesh = this.createRouteMesh(rightCurve, 0xe74c3c, tubeRadius, tubeRadialSegments);
    this.scene.add(rightMesh);
    this.interactiveMeshes.push({ id: 'right', mesh: rightMesh });
  }

  private async buildCar(): Promise<void> {
    // Определяем начальную ориентацию
    const width = this.camera.right - this.camera.left;
    const height = this.camera.top - this.camera.bottom;
    this.currentOrientation = getCurrentOrientation(width, height);
    
    const config = getGameConfig(width, height);
    
    this.car = new CarSprite({
      onArrival: () => {
        console.log('[MapScene] Car arrived at destination');
        this.isCarMoving = false;
        // TODO: показать end-card или перезапустить игру (Task 13, 15)
      }
    });
    
    // Устанавливаем стартовую позицию в зависимости от ориентации
    this.car.setPosition(config.carStartPosition);
    
    this.scene.add(this.car.getMesh());
    console.log(`[MapScene] Car added to scene at ${this.currentOrientation} start position`);
    
    // Ждём загрузки 3D-модели машины
    await this.car.waitForModelLoad();
  }

  private createRouteMesh(curve: THREE.Curve<THREE.Vector3>, color: number, radius: number, radialSegments: number): THREE.Mesh {
    const tube = new THREE.TubeGeometry(curve as THREE.CatmullRomCurve3, 100, radius, radialSegments, false);
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.1 });
    const mesh = new THREE.Mesh(tube, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  private attachPointerHandlers(container: HTMLElement): void {
    container.addEventListener('pointerdown', this.handlePointerDown);
  }

  private startCarMovement(routeId: RouteId): void {
    if (!this.car || this.isCarMoving) return;
    
    // Получаем конфигурацию для текущей ориентации
    const width = this.camera.right - this.camera.left;
    const height = this.camera.top - this.camera.bottom;
    const config = getGameConfig(width, height);
    
    // Строим маршрут с учётом точек остановки для препятствий
    let route: THREE.Vector3[] = [];
    
    if (routeId === 'straight') {
      // Прямой маршрут: от текущей позиции до конца (победа)
      route = [
        this.car.getPosition(),
        getWaypointPosition('road-bottom-2'),
        getWaypointPosition('intersection-center'),
        getWaypointPosition('road-top-1'),
        getWaypointPosition('road-top-3'),
        getWaypointPosition('road-top-5'),
      ];
    } else if (routeId === 'left') {
      // Левый маршрут: остановка перед пробкой
      route = [
        this.car.getPosition(),
        getWaypointPosition('road-bottom-2'),
        getWaypointPosition('intersection-center'),
        config.stopLeftPosition, // Остановка перед препятствием
      ];
    } else if (routeId === 'right') {
      // Правый маршрут: остановка перед знаком STOP
      route = [
        this.car.getPosition(),
        getWaypointPosition('road-bottom-2'),
        getWaypointPosition('intersection-center'),
        config.stopRightPosition, // Остановка перед препятствием
      ];
    }
    
    if (route.length === 0) {
      console.warn(`[MapScene] Route not found: ${routeId}`);
      return;
    }
    
    this.isCarMoving = true;
    console.log(`[MapScene] Starting car movement on route: ${routeId} (${this.currentOrientation})`);
    this.car.moveTo(route);
  }

  private handlePointerDown = (event: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.pointer.set(x, y);

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const meshes = this.interactiveMeshes.map((m) => m.mesh);
    const intersects = this.raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const picked = intersects[0]!.object as THREE.Mesh;
      const item = this.interactiveMeshes.find((i) => i.mesh === picked);
      if (item) {
        if (!this.firstInteractFired) {
          playableSDK.trackCustomEvent('first_interact');
          this.firstInteractFired = true;
        }
        
        // Запустить машинку по выбранному маршруту
        this.startCarMovement(item.id);
        
        if (this.onRouteSelected) this.onRouteSelected(item.id);
      }
    }
  };

  /**
   * Загружает модели зданий (для ручного размещения)
   */
  private buildingModels: Map<string, THREE.Group> = new Map();
  private cityTexture?: THREE.Texture;

  /**
   * Создаёт бетонные полосы под зданиями
   */
  private buildConcreteSidewalk(): void {
    const width = this.camera.right - this.camera.left;
    const height = this.camera.top - this.camera.bottom;
    
    // Материал бетона (чуть светлее дороги)
    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x6a7580, // светло-серый бетон (отличается от дороги)
      roughness: 0.9,
      metalness: 0.1,
    });
    
    // ===== ВЕРТИКАЛЬНАЯ ДОРОГА =====
    // Правая бетонная полоса (под зданиями)
    const rightConcreteGeo = new THREE.PlaneGeometry(5, height * 3);
    const rightConcrete = new THREE.Mesh(rightConcreteGeo, concreteMat);
    rightConcrete.rotation.x = -Math.PI / 2;
    rightConcrete.position.set(3.5, 0.01, 0);
    rightConcrete.receiveShadow = true;
    this.scene.add(rightConcrete);
    
    // Левая бетонная полоса (под зданиями)
    const leftConcreteGeo = new THREE.PlaneGeometry(5, height * 3);
    const leftConcrete = new THREE.Mesh(leftConcreteGeo, concreteMat);
    leftConcrete.rotation.x = -Math.PI / 2;
    leftConcrete.position.set(-3.5, 0.01, 0);
    leftConcrete.receiveShadow = true;
    this.scene.add(leftConcrete);
    
    // ===== ГОРИЗОНТАЛЬНАЯ ДОРОГА =====
    // Верхняя бетонная полоса (под зданиями)
    const topConcreteGeo = new THREE.PlaneGeometry(width * 3, 5);
    const topConcrete = new THREE.Mesh(topConcreteGeo, concreteMat);
    topConcrete.rotation.x = -Math.PI / 2;
    topConcrete.position.set(0, 0.01, 3.5);
    topConcrete.receiveShadow = true;
    this.scene.add(topConcrete);
    
    // Нижняя бетонная полоса (под зданиями)
    const bottomConcreteGeo = new THREE.PlaneGeometry(width * 3, 5);
    const bottomConcrete = new THREE.Mesh(bottomConcreteGeo, concreteMat);
    bottomConcrete.rotation.x = -Math.PI / 2;
    bottomConcrete.position.set(0, 0.01, -3.5);
    bottomConcrete.receiveShadow = true;
    this.scene.add(bottomConcrete);
    
    console.log('[MapScene] 🛣️ Concrete sidewalks created (lighter shade)');
  }

  /**
   * Создаёт одно дерево (ствол + крона)
   * @param type - тип дерева (1: сферическое, 2: коническое, 3: двухуровневое)
   * @param scale - масштаб дерева (по умолчанию 1)
   * @returns THREE.Group с деревом
   */
  private createTree(type: number, scale = 1): THREE.Group {
    const tree = new THREE.Group();
    
    // Ствол (коричневый цилиндр)
    const trunkGeometry = new THREE.CylinderGeometry(0.15 * scale, 0.2 * scale, 1.2 * scale, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x5d4037, // тёмно-коричневый
      roughness: 0.9,
      metalness: 0.1,
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 0.6 * scale;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);
    
    // Материал кроны (разные оттенки зелёного)
    const greenShades = [0x2d5016, 0x1b5e20, 0x33691e];
    const crownMaterial = new THREE.MeshStandardMaterial({
      color: greenShades[Math.floor(Math.random() * greenShades.length)],
      roughness: 0.85,
      metalness: 0.0,
    });
    
    if (type === 1) {
      // Тип 1: Сферическая крона (лиственное дерево)
      const crownGeometry = new THREE.SphereGeometry(0.8 * scale, 8, 6);
      const crown = new THREE.Mesh(crownGeometry, crownMaterial);
      crown.position.y = 1.4 * scale;
      crown.castShadow = true;
      crown.receiveShadow = true;
      tree.add(crown);
      
    } else if (type === 2) {
      // Тип 2: Коническая крона (ель/сосна)
      const crownGeometry = new THREE.ConeGeometry(0.7 * scale, 1.5 * scale, 8);
      const crown = new THREE.Mesh(crownGeometry, crownMaterial);
      crown.position.y = 1.8 * scale;
      crown.castShadow = true;
      crown.receiveShadow = true;
      tree.add(crown);
      
    } else {
      // Тип 3: Двухуровневая крона (смешанное)
      const crown1Geometry = new THREE.ConeGeometry(0.6 * scale, 1.0 * scale, 8);
      const crown1 = new THREE.Mesh(crown1Geometry, crownMaterial);
      crown1.position.y = 1.3 * scale;
      crown1.castShadow = true;
      crown1.receiveShadow = true;
      tree.add(crown1);
      
      const crown2Geometry = new THREE.ConeGeometry(0.5 * scale, 0.8 * scale, 8);
      const crown2 = new THREE.Mesh(crown2Geometry, crownMaterial);
      crown2.position.y = 2.0 * scale;
      crown2.castShadow = true;
      crown2.receiveShadow = true;
      tree.add(crown2);
    }
    
    return tree;
  }

  /**
   * Расставляет деревья: 1 ель
   */
  private populateTrees(): void {
    console.log('[MapScene] 🌳 Populating trees...');
    
    // Одна ель (коническая крона) в центре диапазона
    const x = 13;
    const z = 10;
    const scale = 1.2;
    
    const pine = this.createTree(2, scale); // тип 2 = коническая крона (ель)
    pine.position.set(x, 0, z);
    pine.rotation.y = Math.random() * Math.PI * 2;
    
    this.scene.add(pine);
    
    console.log(`[MapScene] ✅ 1 pine tree created at (${x}, ${z})`);
  }
  
  /**
   * Добавляет дополнительные деревья в указанных точках
   */
  private addExtraTrees(): void {
    console.log('[MapScene] 🌳 Adding extra trees...');
    
    // Деревья в указанных красных точках (разные типы для разнообразия)
    const treePositions = [
      // Верхний левый угол
      { x: -17, z: 10, type: 1 },
      { x: -13, z: 10, type: 3 },
      
      // Верхний правый угол
      { x: 17, z: 10, type: 1 },
      
      // Нижняя левая зона
      { x: -17, z: -10, type: 3 },
      { x: -14, z: -10, type: 1 },
      { x: -10, z: -10, type: 3 },
      
      // Нижний центр/правая зона
      { x: 7, z: -10, type: 1 },
      { x: -14, z: -7, type: 1 },  // дополнительное у прудика
    ];
    
    treePositions.forEach((pos) => {
      const scale = 0.9 + Math.random() * 0.4;
      
      const tree = this.createTree(pos.type, scale);
      tree.position.set(pos.x, 0, pos.z);
      tree.rotation.y = Math.random() * Math.PI * 2;
      
      this.scene.add(tree);
    });
    
    console.log(`[MapScene] ✅ ${treePositions.length} extra trees added`);
  }

  /**
   * Добавляет фонари на углах перекрестка
   */
  private async addStreetLights(): Promise<void> {
    console.log('[MapScene] 💡 Adding street lights...');
    
    try {
      const gltfLoader = new GLTFLoader();
      const textureLoader = new THREE.TextureLoader();
      
      // Параллельная загрузка модели фонаря и текстуры
      const [gltf, roadsTexture] = await Promise.all([
        gltfLoader.loadAsync(lightSquareUrl),
        textureLoader.loadAsync(roadsTextureUrl),
      ]);
      
      // Настройка текстуры
      roadsTexture.colorSpace = THREE.SRGBColorSpace;
      roadsTexture.flipY = false;
      
      console.log('[MapScene] 💡 Light model and texture loaded');
      
      // Центральная точка перекрестка (между -2.0 и 3.0)
      const centerX = (-2.0 + 3.0) / 2; // = 0.5
      const centerZ = (-2.0 + 3.0) / 2; // = 0.5
      
      // Позиции фонарей на углах перекрестка (где бордюры встречаются)
      const lightPositions = [
        { x: 2.5, z: 2.5 },   // правый верхний
        { x: -2.5, z: 2.5 },  // левый верхний
        { x: 2.5, z: -2.5 },  // правый нижний
        { x: -2.5, z: -2.5 }, // левый нижний
      ];
      
      lightPositions.forEach((pos) => {
        const light = gltf.scene.clone();
        
        // Вычисляем угол поворота к центру
        const dx = centerX - pos.x;
        const dz = centerZ - pos.z;
        const rotation = Math.atan2(dx, dz);
        
        // Применяем текстуру ко всем материалам
        light.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const mat = child.material as THREE.MeshStandardMaterial;
            if (mat) {
              // Удаляем вершинные цвета
              if (child.geometry.attributes.color) {
                child.geometry.deleteAttribute('color');
              }
              
              mat.map = roadsTexture;
              mat.needsUpdate = true;
            }
            
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        // Вычисляем размер модели для масштабирования
        const box = new THREE.Box3().setFromObject(light);
        const size = new THREE.Vector3();
        box.getSize(size);
        
        // Масштабируем до размера ~1.5 единицы (высота фонаря)
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 1.5;
        const scale = targetSize / maxDim;
        light.scale.setScalar(scale);
        
        // Позиционируем
        light.position.set(pos.x, 0, pos.z);
        light.rotation.y = rotation;
        
        this.scene.add(light);
      });
      
      console.log(`[MapScene] ✅ ${lightPositions.length} street lights added at intersection corners`);
      
    } catch (error) {
      console.error('[MapScene] ❌ Failed to load street lights:', error);
    }
  }

  private async loadBuildingModels(): Promise<void> {
    try {
      console.log('[MapScene] 🏗️ Loading building models...');
      
      const gltfLoader = new GLTFLoader();
      const textureLoader = new THREE.TextureLoader();
      
      // Загружаем 8 красивых зданий + текстуру
      const [buildingA, buildingB, buildingC, buildingD, buildingE, buildingF, buildingG, buildingH, cityTexture] = await Promise.all([
        gltfLoader.loadAsync(buildingAUrl),
        gltfLoader.loadAsync(buildingBUrl),
        gltfLoader.loadAsync(buildingCUrl),
        gltfLoader.loadAsync(buildingDUrl),
        gltfLoader.loadAsync(buildingEUrl),
        gltfLoader.loadAsync(buildingFUrl),
        gltfLoader.loadAsync(buildingGUrl),
        gltfLoader.loadAsync(buildingHUrl),
        textureLoader.loadAsync(cityTextureUrl)
      ]);
      
      cityTexture.colorSpace = THREE.SRGBColorSpace;
      cityTexture.flipY = false;
      this.cityTexture = cityTexture;
      
      // Сохраняем модели с короткими ID
      this.buildingModels.set('a', buildingA.scene);
      this.buildingModels.set('b', buildingB.scene);
      this.buildingModels.set('c', buildingC.scene);
      this.buildingModels.set('d', buildingD.scene);
      this.buildingModels.set('e', buildingE.scene);
      this.buildingModels.set('f', buildingF.scene);
      this.buildingModels.set('g', buildingG.scene);
      this.buildingModels.set('h', buildingH.scene);
      
      console.log('[MapScene] ✅ Building models loaded!');
      console.log('[MapScene] 📋 Available buildings: a, b, c, d, e, f, g, h');
      console.log('[MapScene] 📍 Use: addBuilding("a", x, z, scale, rotation)');
    } catch (error) {
      console.error('[MapScene] ❌ Failed to load building models:', error);
    }
  }

  /**
   * Добавляет здание вручную по координатам
   * @param buildingId - ID здания (a, b, c, d, e, f, g, h)
   * @param x - координата X
   * @param z - координата Z
   * @param scale - размер (по умолчанию 2)
   * @param rotation - поворот в градусах (по умолчанию 0)
   */
  public addBuilding(buildingId: string, x: number, z: number, scale: number = 2, rotation: number = 0): void {
    const model = this.buildingModels.get(buildingId);
    if (!model) {
      console.error(`[MapScene] Building "${buildingId}" not found! Available: a, b, c, d, e, f, g, h`);
      return;
    }
    
    const building = model.clone();
    
    // Применяем текстуру
    if (this.cityTexture) {
      building.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          if (mesh.material) {
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            materials.forEach((mat: any) => {
              if (mat.isMeshStandardMaterial || mat.isMeshBasicMaterial) {
                mat.map = this.cityTexture;
                mat.needsUpdate = true;
              }
            });
          }
        }
      });
    }
    
    // Бетонные полосы уже созданы в buildConcreteSidewalk()
    building.position.set(x, 0, z);
    building.scale.set(scale, scale, scale);
    building.rotation.y = (rotation * Math.PI) / 180; // градусы в радианы
    this.scene.add(building);
    
    console.log(`[MapScene] 🏢 Added ${buildingId} at (${x}, ${z}), scale=${scale}, rotation=${rotation}°`);
  }

  /**
   * Создаёт визуальную сетку координат
   */
  private buildCoordinateGrid(): void {
    const width = this.camera.right - this.camera.left;
    const height = this.camera.top - this.camera.bottom;
    
    const gridHelper = new THREE.GridHelper(Math.max(width, height) * 2, 20, 0x888888, 0x444444);
    gridHelper.rotation.x = 0;
    gridHelper.position.y = 0.05;
    this.scene.add(gridHelper);
    
    // Добавляем метки координат каждые 5 единиц
    const labelStep = 5;
    for (let x = -width / 2; x <= width / 2; x += labelStep) {
      for (let z = -height / 2; z <= height / 2; z += labelStep) {
        this.createCoordinateLabel(x, z);
      }
    }
    
    console.log('[MapScene] 📐 Coordinate grid created');
    console.log(`[MapScene] 📏 Grid range: X(${-width/2} to ${width/2}), Z(${-height/2} to ${height/2})`);
  }

  private createCoordinateLabel(x: number, z: number): void {
    // Создаём маленькую сферу как метку координаты
    const markerGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.set(x, 0.3, z);
    this.scene.add(marker);
    
    // Добавляем текстовую метку с округлёнными координатами (короткий формат)
    const shortLabel = `${Math.round(x)},${Math.round(z)}`;
    const textSprite = this.createTextSprite(shortLabel);
    textSprite.position.set(x, 1.5, z); // выше над меткой
    this.scene.add(textSprite);
  }

  /**
   * Создаёт текстовый sprite с координатами
   */
  private createTextSprite(text: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      return new THREE.Sprite();
    }
    
    canvas.width = 256;
    canvas.height = 64;
    
    // Фон (полупрозрачный чёрный)
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Текст (белый)
    context.fillStyle = 'white';
    context.font = 'bold 32px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // Создаём текстуру из canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    // Создаём sprite
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(2, 0.5, 1); // размер sprite
    
    return sprite;
  }

  public resize(): void {
    const width = this.camera.right - this.camera.left;
    const height = this.camera.top - this.camera.bottom;
    
    // Проверяем смену ориентации
    const newOrientation = getCurrentOrientation(width, height);
    const orientationChanged = newOrientation !== this.currentOrientation;
    
    if (orientationChanged) {
      console.log(`[MapScene] Orientation changed: ${this.currentOrientation} → ${newOrientation}`);
      this.currentOrientation = newOrientation;
      
      // Адаптация позиции машинки, если она не движется
      if (this.car && !this.isCarMoving) {
        const config = getGameConfig(width, height);
        this.car.setPosition(config.carStartPosition);
        console.log(`[MapScene] Car position adapted to ${newOrientation}`);
      }
    }

    // Обновляем землю под новый viewport камеры
    if (this.ground) {
      const scale = 2;
      const newGeo = new THREE.PlaneGeometry(width * scale, height * scale);
      this.ground.geometry.dispose();
      this.ground.geometry = newGeo;
    }

    // Обновляем дороги и разметку под новый вьюпорт (только примитивы)
    const extendFactor = 3;
    
    if (this.mainRoad && (this.mainRoad as THREE.Mesh).geometry) {
      const newMainGeo = new THREE.BoxGeometry(3.5, 0.1, height * extendFactor);
      (this.mainRoad as THREE.Mesh).geometry.dispose();
      (this.mainRoad as THREE.Mesh).geometry = newMainGeo;
    }
    
    if (this.crossRoad && (this.crossRoad as THREE.Mesh).geometry) {
      const newCrossGeo = new THREE.BoxGeometry(width * extendFactor, 0.1, 3.5);
      (this.crossRoad as THREE.Mesh).geometry.dispose();
      (this.crossRoad as THREE.Mesh).geometry = newCrossGeo;
    }
    
    if (this.zLine) {
      const newZGeo = new THREE.BoxGeometry(0.2, 0.11, height * extendFactor);
      this.zLine.geometry.dispose();
      this.zLine.geometry = newZGeo;
    }
    
    if (this.xLine) {
      const newXGeo = new THREE.BoxGeometry(width * extendFactor, 0.11, 0.2);
      this.xLine.geometry.dispose();
      this.xLine.geometry = newXGeo;
    }
  }
}


