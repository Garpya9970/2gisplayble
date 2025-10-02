/**
 * 2GIS Playable Ad - Main Entry Point
 * 
 * Constitution: .specify/memory/constitution.md
 * Brief: .specify/memory/specs/playable-core/integrations/brief.md
 * 
 * Budgets:
 * - ZIP ≤ 5 MB
 * - 60 FPS on mid-tier Android/iOS
 * - TTFI ≤ 300 ms
 * - 0 external requests
 * - web-fonts = 0
 */

import playableSDK from './sdk-wrapper';
import ThreeRenderer from './renderer/ThreeRenderer';
import MapScene from './game/MapScene';

console.log('🚀 2GIS Playable Ad - Starting...');
console.log(`📱 Network: ${import.meta.env.VITE_AD_NETWORK}`);
console.log(`📐 Orientation: ${import.meta.env.VITE_ORIENTATION}`);

// Глобальный обработчик ошибок (Task 19)
window.addEventListener('error', (event) => {
  console.error('Runtime error:', event.message);
  playableSDK.trackCustomEvent('error', { 
    code: 'runtime_error', 
    detail: event.message 
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  playableSDK.trackCustomEvent('error', { 
    code: 'unhandled_promise', 
    detail: String(event.reason) 
  });
});

// Main initialization
async function init() {
  try {
    console.log('🎮 Initializing game...');
    
    // Task 02 - SDK Integration ✅
    playableSDK.init((width, height) => {
      console.log(`📐 Container size: ${width}x${height}`);
      console.log(`📱 Landscape: ${playableSDK.isLandscape}`);
      
      initRenderer(width, height);
    });
    
    // Fallback для локального запуска (если SDK не инициализируется)
    // В prod это не нужно, т.к. SDK всегда инициализируется в рекламных сетях
    setTimeout(() => {
      if (!playableSDK.ready) {
        console.warn('[Fallback] SDK not ready after 1s, initializing manually for local testing');
        // Используем document.documentElement для точного размера viewport
        const width = document.documentElement.clientWidth || window.innerWidth;
        const height = document.documentElement.clientHeight || window.innerHeight;
        initRenderer(width, height);
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    playableSDK.trackCustomEvent('error', { 
      code: 'init_error', 
      detail: String(error) 
    });
  }
}

/**
 * Инициализация Three.js рендерера
 */
async function initRenderer(width: number, height: number) {
  try {
    // Task 08 - Three.js Renderer ✅
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas element not found');
    }

      const renderer = new ThreeRenderer();
      renderer.init(canvas, width, height);

      // Принудительная установка правильного размера canvas
      const actualWidth = document.documentElement.clientWidth || window.innerWidth;
      const actualHeight = document.documentElement.clientHeight || window.innerHeight;
      if (actualWidth !== width || actualHeight !== height) {
        console.warn(`[Init] Size mismatch: requested ${width}x${height}, actual ${actualWidth}x${actualHeight}. Fixing...`);
        renderer.resize(actualWidth, actualHeight);
      }

      // Построение сцены карты (3 маршрута)
      const map = new MapScene(renderer);
      await map.init(document.getElementById('app') as HTMLElement);
      map.resize(); // Принудительное обновление фона под актуальный размер
      map.onSelect((route) => {
        console.log('[Map] Selected route:', route);
        // TODO: запустить движение машинки (Task 10), начать отсчёт времени, и по завершении — level_complete
      });

    // Обработка resize через SDK
    (window as any).__renderer = renderer; // Для доступа из SDK wrapper

    // Fallback для локального тестирования: отслеживаем window.resize
    // В prod SDK сам отправляет resize events, но для локального тестирования нужен fallback
    let resizeTimeout: number;
    window.addEventListener('resize', () => {
      // Debounce для производительности
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        const newWidth = document.documentElement.clientWidth || window.innerWidth;
        const newHeight = document.documentElement.clientHeight || window.innerHeight;
        console.log(`[Window] Resize detected: ${newWidth}x${newHeight}`);
        renderer.resize(newWidth, newHeight);
        map.resize(); // Обновляем фон сцены
      }, 100) as unknown as number;
    });
    
    console.log('[Resize] Window resize listener attached (fallback for local testing)');

    // Запуск render loop
    renderer.startRenderLoop(() => {
      // Обновление игровой логики (анимации препятствий и т. п.)
      map.update();
    });
    
    // Скрыть прелоадер после инициализации
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('hidden');
      console.log('[UI] Loader hidden');
    }
    
    // TODO: Task 05 - Show tutorial screen
    console.log('TODO: Show tutorial screen');
    
    // Имитация загрузки ассетов (замените на реальную загрузку)
    setTimeout(() => {
      // Task 16 - Event game_start ✅
      // start() автоматически вызовет trackCustomEvent('game_start')
      if (playableSDK.ready) {
        playableSDK.start();
      }
      console.log('✅ Game started');
    }, 500);
    
  } catch (error) {
    console.error('❌ Renderer initialization failed:', error);
    playableSDK.trackCustomEvent('error', { 
      code: 'renderer_init_error', 
      detail: String(error) 
    });
  }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Expose for debugging (only in dev)
if (import.meta.env.DEV) {
  (window as any).__PLAYABLE_DEBUG__ = {
    network: import.meta.env.VITE_AD_NETWORK,
    orientation: import.meta.env.VITE_ORIENTATION,
  };
}
    
