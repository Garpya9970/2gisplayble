/**
 * Platform Bridge - универсальная обертка для работы с разными платформами
 * Поддерживает: Mintegral, Bigo Ads, Unity Ads
 */

declare global {
  interface Window {
    // Mintegral
    gameReady?: () => void;
    gameStart?: () => void;
    gameEnd?: () => void;
    gameRetry?: () => void;
    install?: () => void;
    
    // Unity Ads
    unityPlayableReady?: () => void;
    unityPlayableStart?: () => void;
    unityPlayableClick?: () => void;
    
    // MRAID (Unity Ads, Mintegral)
    mraid?: {
      addEventListener: (event: string, listener: (data?: any) => void) => void;
      removeEventListener: (event: string, listener: (data?: any) => void) => void;
      getState: () => string;
      isViewable: () => boolean;
      open: (url: string) => void;
      close: () => void;
      [key: string]: any;
    };
    
    // Store URLs (Unity Ads)
    GOOGLE_PLAY_URL?: string;
    APP_STORE_URL?: string;
  }
}

class PlatformBridge {
  private mraidReady = false;
  private viewable = false;
  private onViewableCallbacks: Array<() => void> = [];

  constructor() {
    this.setupMRAID();
  }

  /**
   * Настройка MRAID для Unity Ads
   */
  private setupMRAID(): void {
    if (typeof window.mraid !== 'undefined') {
      console.log('[Platform] MRAID detected');
      
      // Ждем ready
      window.mraid.addEventListener('ready', () => {
        console.log('[MRAID] Ready');
        this.mraidReady = true;
        
        // Проверяем viewable
        if (window.mraid && window.mraid.isViewable()) {
          this.handleViewableChange(true);
        }
      });
      
      // Ждем viewableChange для Unity Ads
      window.mraid.addEventListener('viewableChange', (isViewable: boolean) => {
        console.log('[MRAID] ViewableChange:', isViewable);
        this.handleViewableChange(isViewable);
      });
      
      // Если уже ready, сразу обрабатываем
      if (window.mraid.getState && window.mraid.getState() !== 'loading') {
        this.mraidReady = true;
        if (window.mraid.isViewable && window.mraid.isViewable()) {
          this.handleViewableChange(true);
        }
      }
    } else {
      // Нет MRAID - локальное тестирование или Bigo
      console.log('[Platform] No MRAID detected (local or Bigo)');
      // Сразу считаем viewable для локального тестирования
      setTimeout(() => {
        this.handleViewableChange(true);
      }, 100);
    }
  }

  /**
   * Обработка изменения viewable
   */
  private handleViewableChange(isViewable: boolean): void {
    this.viewable = isViewable;
    
    if (isViewable) {
      console.log('[Platform] Ad is viewable, calling callbacks');
      // Вызываем все callbacks, ожидающие viewable
      this.onViewableCallbacks.forEach(cb => cb());
      this.onViewableCallbacks = [];
    }
  }

  /**
   * Ожидание viewable для Unity Ads
   * @param callback Вызывается когда реклама становится видимой
   */
  public waitForViewable(callback: () => void): void {
    if (this.viewable) {
      // Уже viewable
      callback();
    } else {
      // Ждем viewableChange
      console.log('[Platform] Waiting for viewableChange...');
      this.onViewableCallbacks.push(callback);
    }
  }

  /**
   * Уведомление платформы что playable готов
   */
  public notifyReady(): void {
    console.log('[Platform] Notify ready');
    
    // Mintegral
    if (typeof window.gameReady === 'function') {
      window.gameReady();
      console.log('[Platform] gameReady() called');
    }
    
    // Unity Ads
    if (typeof window.unityPlayableReady === 'function') {
      window.unityPlayableReady();
      console.log('[Platform] unityPlayableReady() called');
    }
  }

  /**
   * Уведомление платформы о старте playable
   */
  public notifyStart(): void {
    console.log('[Platform] Notify start');
    
    // Mintegral
    if (typeof window.gameStart === 'function') {
      window.gameStart();
      console.log('[Platform] gameStart() called');
    }
    
    // Unity Ads
    if (typeof window.unityPlayableStart === 'function') {
      window.unityPlayableStart();
      console.log('[Platform] unityPlayableStart() called');
    }
  }

  /**
   * Уведомление платформы о завершении playable
   */
  public notifyEnd(): void {
    console.log('[Platform] Notify end');
    
    // Mintegral
    if (typeof window.gameEnd === 'function') {
      window.gameEnd();
      console.log('[Platform] gameEnd() called');
    }
  }

  /**
   * Уведомление платформы о retry
   */
  public notifyRetry(): void {
    console.log('[Platform] Notify retry');
    
    // Mintegral
    if (typeof window.gameRetry === 'function') {
      window.gameRetry();
      console.log('[Platform] gameRetry() called');
    }
  }

  /**
   * Клик по CTA - переход в стор
   */
  public clickCTA(): void {
    console.log('[Platform] CTA clicked');
    
    // Unity Ads
    if (typeof window.unityPlayableClick === 'function') {
      window.unityPlayableClick();
      console.log('[Platform] unityPlayableClick() called');
      return;
    }
    
    // Mintegral
    if (typeof window.install === 'function') {
      window.install();
      console.log('[Platform] install() called');
      return;
    }
    
    // Fallback для локального тестирования
    console.warn('[Platform] No CTA handler found, opening store URL');
    const url = /iPhone|iPad|iPod/i.test(navigator.userAgent) 
      ? (window.APP_STORE_URL || 'https://apps.apple.com/ru/app/2gis-karty-navigator-druzya/id481627348')
      : (window.GOOGLE_PLAY_URL || 'https://play.google.com/store/apps/details?id=ru.dublgis.dgismobile');
    window.open(url, '_blank');
  }

  /**
   * Проверка готовности MRAID
   */
  public get isMRAIDReady(): boolean {
    return this.mraidReady;
  }

  /**
   * Проверка видимости рекламы
   */
  public get isViewable(): boolean {
    return this.viewable;
  }
}

// Экспорт singleton
export const platformBridge = new PlatformBridge();
export default platformBridge;

