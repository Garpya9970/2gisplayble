/**
 * SDK Wrapper for @smoud/playable-sdk
 * 
 * Provides a unified interface for playable SDK integration with type safety
 * and custom event tracking.
 * 
 * Reference: https://github.com/smoudjs/playable-sdk
 */

import sdk from '@smoud/playable-sdk';

// Типы для наших кастомных событий (из events-contract.md)
export type CustomEventName = 
  | 'game_start'           // После sdk.init() и готовности ассетов
  | 'first_interact'       // Первый пользовательский ввод (one-shot)
  | 'level_complete'       // Победа/поражение с { win, time_ms }
  | 'cta_click'            // Клик по CTA-кнопке
  | 'error';               // Runtime-ошибки

export interface LevelCompletePayload {
  win: boolean;
  time_ms: number;
}

export interface ErrorPayload {
  code: string;
  detail?: string;
}

export type CustomEventPayload = LevelCompletePayload | ErrorPayload | undefined;

/**
 * SDK Wrapper Class
 */
class PlayableSDKWrapper {
  private isInitialized = false;
  private customEventListeners: Map<CustomEventName, Array<(payload?: any) => void>> = new Map();

  /**
   * Инициализация SDK
   * @param callback Вызывается после готовности с размерами контейнера (width, height)
   */
  public init(callback?: (width: number, height: number) => void): void {
    if (this.isInitialized) {
      console.warn('[SDK] Already initialized');
      return;
    }

    try {
      sdk.init((width, height) => {
        console.log(`[SDK] Initialized: ${width}x${height}`);
        this.isInitialized = true;

        // Настройка стандартных обработчиков SDK
        this.setupSDKEventHandlers();

        // Вызов пользовательского callback
        if (callback) {
          callback(width, height);
        }
      });
    } catch (error) {
      console.error('[SDK] Initialization failed:', error);
      this.trackCustomEvent('error', { 
        code: 'sdk_init_error', 
        detail: String(error) 
      });
    }
  }

  /**
   * Настройка обработчиков стандартных событий SDK
   */
  private setupSDKEventHandlers(): void {
    // Обработка resize
    sdk.on('resize', (width: number, height: number) => {
      console.log(`[SDK] Resize: ${width}x${height}`);
      
      // Обновить Three.js рендерер (если доступен)
      const renderer = (window as any).__renderer;
      if (renderer && typeof renderer.resize === 'function') {
        renderer.resize(width, height);
      }
    });

    // Обработка pause
    sdk.on('pause', () => {
      console.log('[SDK] Paused');
      // TODO: Поставить игру на паузу (Tasks 12-15)
    });

    // Обработка resume
    sdk.on('resume', () => {
      console.log('[SDK] Resumed');
      // TODO: Возобновить игру (Tasks 12-15)
    });

    // Обработка volume
    sdk.on('volume', (level: number) => {
      console.log(`[SDK] Volume: ${level}`);
      // TODO: Обновить громкость звука (опционально)
    });

    // Обработка interaction
    sdk.on('interaction', (count: number) => {
      console.log(`[SDK] Interaction count: ${count}`);
      
      // Первое взаимодействие → first_interact (one-shot)
      if (count === 1) {
        this.trackCustomEvent('first_interact');
      }
    });

    // Обработка finish
    sdk.on('finish', () => {
      console.log('[SDK] Finished');
      // Playable завершён
    });
  }

  /**
   * Старт playable (вызывать после загрузки ассетов)
   */
  public start(): void {
    if (!this.isInitialized) {
      console.warn('[SDK] Not initialized. Call init() first.');
      return;
    }

    try {
      sdk.start();
      console.log('[SDK] Started');
      
      // game_start — после start() и готовности ассетов
      this.trackCustomEvent('game_start');
    } catch (error) {
      console.error('[SDK] Start failed:', error);
      this.trackCustomEvent('error', { 
        code: 'sdk_start_error', 
        detail: String(error) 
      });
    }
  }

  /**
   * Завершение playable
   */
  public finish(): void {
    if (!this.isInitialized) {
      console.warn('[SDK] Not initialized. Call init() first.');
      return;
    }

    try {
      sdk.finish();
      console.log('[SDK] Finish called');
    } catch (error) {
      console.error('[SDK] Finish failed:', error);
    }
  }

  /**
   * Переход в стор (единственный способ EXIT)
   * Запрещено использовать window.open()
   */
  public install(): void {
    if (!this.isInitialized) {
      console.warn('[SDK] Not initialized. Call init() first.');
      return;
    }

    try {
      sdk.install();
      console.log('[SDK] Install triggered');
      
      // Трек события install (если SDK не трекает автоматически)
      this.trackCustomEvent('cta_click');
    } catch (error) {
      console.error('[SDK] Install failed:', error);
      this.trackCustomEvent('error', { 
        code: 'sdk_install_error', 
        detail: String(error) 
      });
    }
  }

  /**
   * Трекинг кастомных событий
   * (level_complete, error, и другие специфичные для нашего playable)
   */
  public trackCustomEvent(eventName: CustomEventName, payload?: CustomEventPayload): void {
    console.log(`[SDK] Custom event: ${eventName}`, payload);

    // Вызов пользовательских обработчиков
    const listeners = this.customEventListeners.get(eventName);
    if (listeners) {
      listeners.forEach(listener => listener(payload));
    }

    // Можно добавить отправку в аналитику/трекинг-системы
    // Например, для level_complete можно отправить данные в backend
  }

  /**
   * Подписка на кастомные события
   */
  public onCustomEvent(eventName: CustomEventName, callback: (payload?: any) => void): void {
    if (!this.customEventListeners.has(eventName)) {
      this.customEventListeners.set(eventName, []);
    }
    this.customEventListeners.get(eventName)!.push(callback);
  }

  /**
   * Получить текущие размеры контейнера
   */
  public get width(): number {
    return sdk.maxWidth;
  }

  public get height(): number {
    return sdk.maxHeight;
  }

  /**
   * Проверка готовности SDK
   */
  public get ready(): boolean {
    return sdk.isReady;
  }

  /**
   * Проверка старта playable
   */
  public get started(): boolean {
    return sdk.isStarted;
  }

  /**
   * Проверка паузы
   */
  public get paused(): boolean {
    return sdk.isPaused;
  }

  /**
   * Проверка завершения
   */
  public get finished(): boolean {
    return sdk.isFinished;
  }

  /**
   * Текущая ориентация
   */
  public get isLandscape(): boolean {
    return sdk.isLandscape;
  }

  /**
   * Счётчик взаимодействий
   */
  public get interactions(): number {
    return sdk.interactions;
  }
}

// Экспорт singleton-инстанса
export const playableSDK = new PlayableSDKWrapper();

// Экспорт для удобства
export default playableSDK;
