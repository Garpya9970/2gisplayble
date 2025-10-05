/**
 * GameUI - управление всем UI плейбла
 */

export type UIScreen = 'start' | 'playing' | 'modal-traffic' | 'modal-roadwork' | 'endcard' | 'fade';

export interface GameUICallbacks {
  onRouteSelect: (route: 'left' | 'straight' | 'right') => void;
  onRetry: () => void;
  onCTA: () => void;
}

export class GameUI {
  private container: HTMLElement;
  private callbacks: GameUICallbacks;
  private currentScreen: UIScreen = 'start';

  // UI элементы
  private startScreen?: HTMLElement;
  private routeButtons?: HTMLElement;
  private modalTraffic?: HTMLElement;
  private modalRoadwork?: HTMLElement;
  private endcard?: HTMLElement;
  private fadeOverlay?: HTMLElement;

  constructor(container: HTMLElement, callbacks: GameUICallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.init();
  }

  private init(): void {
    this.createStartScreen();
    this.createModals();
    this.createEndcard();
    this.createFadeOverlay();
  }

  /**
   * Стартовый экран с заголовком и 3 кнопками маршрутов
   */
  private createStartScreen(): void {
    // Контейнер стартового экрана
    this.startScreen = document.createElement('div');
    this.startScreen.className = 'ui-start-screen';
    this.startScreen.innerHTML = `
      <div class="ui-header">
        <h1 class="ui-title">Выбери маршрут без сюрпризов</h1>
      </div>
    `;

    // Контейнер для кнопок маршрутов
    this.routeButtons = document.createElement('div');
    this.routeButtons.className = 'ui-route-buttons';
    this.routeButtons.innerHTML = `
      <button class="ui-route-btn ui-route-btn-left" data-route="left">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 19L8 12L15 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Налево</span>
      </button>
      <button class="ui-route-btn ui-route-btn-straight" data-route="straight">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5L12 19M12 5L8 9M12 5L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Прямо</span>
      </button>
      <button class="ui-route-btn ui-route-btn-right" data-route="right">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 5L16 12L9 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Направо</span>
      </button>
    `;

    // Обработчики кликов
    const buttons = this.routeButtons.querySelectorAll('.ui-route-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const route = (e.currentTarget as HTMLElement).dataset.route as 'left' | 'straight' | 'right';
        this.onRouteButtonClick(route);
      });
    });

    this.container.appendChild(this.startScreen);
    this.container.appendChild(this.routeButtons);
  }

  /**
   * Модальные окна для неудачных маршрутов
   */
  private createModals(): void {
    // Модалка для пробки (левый маршрут)
    this.modalTraffic = document.createElement('div');
    this.modalTraffic.className = 'ui-modal ui-modal-hidden';
    this.modalTraffic.innerHTML = `
      <div class="ui-modal-content">
        <div class="ui-modal-icon">🚗</div>
        <h2 class="ui-modal-title">Впереди пробка!</h2>
        <p class="ui-modal-text">На этом маршруте образовалась пробка. 2ГИС предупредил бы вас заранее!</p>
      </div>
    `;

    // Модалка для ремонтных работ (прямой маршрут)
    this.modalRoadwork = document.createElement('div');
    this.modalRoadwork.className = 'ui-modal ui-modal-hidden';
    this.modalRoadwork.innerHTML = `
      <div class="ui-modal-content">
        <div class="ui-modal-icon">🚧</div>
        <h2 class="ui-modal-title">Ведутся ремонтные работы</h2>
        <p class="ui-modal-text">Дорога перекрыта. С 2ГИС вы знали бы об этом заранее и выбрали другой путь!</p>
      </div>
    `;

    this.container.appendChild(this.modalTraffic);
    this.container.appendChild(this.modalRoadwork);
  }

  /**
   * End-card с CTA для успешного прохождения
   */
  private createEndcard(): void {
    this.endcard = document.createElement('div');
    this.endcard.className = 'ui-endcard ui-endcard-hidden';
    this.endcard.innerHTML = `
      <div class="ui-endcard-content">
        <div class="ui-endcard-logo">
          <div class="ui-logo-placeholder">2ГИС</div>
        </div>
        <h2 class="ui-endcard-title">Отличный выбор!</h2>
        <p class="ui-endcard-text">В 2ГИС всегда найдёшь маршрут без лишних сложностей</p>
        <button class="ui-cta-button">
          Скачать 2ГИС
        </button>
      </div>
    `;

    // Обработчик CTA
    const ctaButton = this.endcard.querySelector('.ui-cta-button');
    ctaButton?.addEventListener('click', () => {
      this.callbacks.onCTA();
    });

    this.container.appendChild(this.endcard);
  }

  /**
   * Белый fade-эффект для перезапуска
   */
  private createFadeOverlay(): void {
    this.fadeOverlay = document.createElement('div');
    this.fadeOverlay.className = 'ui-fade-overlay';
    this.container.appendChild(this.fadeOverlay);
  }

  /**
   * Обработчик выбора маршрута
   */
  private onRouteButtonClick(route: 'left' | 'straight' | 'right'): void {
    this.hideStartScreen();
    this.callbacks.onRouteSelect(route);
  }

  /**
   * Показать стартовый экран
   */
  public showStartScreen(): void {
    this.currentScreen = 'start';
    this.startScreen?.classList.remove('ui-hidden');
    this.routeButtons?.classList.remove('ui-hidden');
    
    // Анимация появления
    requestAnimationFrame(() => {
      this.startScreen?.classList.add('ui-visible');
      this.routeButtons?.classList.add('ui-visible');
    });
  }

  /**
   * Скрыть стартовый экран
   */
  public hideStartScreen(): void {
    this.startScreen?.classList.remove('ui-visible');
    this.routeButtons?.classList.remove('ui-visible');
    
    setTimeout(() => {
      this.startScreen?.classList.add('ui-hidden');
      this.routeButtons?.classList.add('ui-hidden');
    }, 300);
  }

  /**
   * Показать модалку с пробкой
   */
  public showTrafficModal(): void {
    this.currentScreen = 'modal-traffic';
    this.modalTraffic?.classList.remove('ui-modal-hidden');
    requestAnimationFrame(() => {
      this.modalTraffic?.classList.add('ui-modal-visible');
    });

    // Автоматически скрыть через 2.5 секунды и перезапустить
    setTimeout(() => {
      this.hideModal(() => {
        this.playFadeAndRestart();
      });
    }, 2500);
  }

  /**
   * Показать модалку с ремонтными работами
   */
  public showRoadworkModal(): void {
    this.currentScreen = 'modal-roadwork';
    this.modalRoadwork?.classList.remove('ui-modal-hidden');
    requestAnimationFrame(() => {
      this.modalRoadwork?.classList.add('ui-modal-visible');
    });

    // Автоматически скрыть через 2.5 секунды и перезапустить
    setTimeout(() => {
      this.hideModal(() => {
        this.playFadeAndRestart();
      });
    }, 2500);
  }

  /**
   * Скрыть модалку
   */
  private hideModal(callback?: () => void): void {
    this.modalTraffic?.classList.remove('ui-modal-visible');
    this.modalRoadwork?.classList.remove('ui-modal-visible');
    
    setTimeout(() => {
      this.modalTraffic?.classList.add('ui-modal-hidden');
      this.modalRoadwork?.classList.add('ui-modal-hidden');
      if (callback) callback();
    }, 300);
  }

  /**
   * Показать end-card
   */
  public showEndcard(): void {
    this.currentScreen = 'endcard';
    this.endcard?.classList.remove('ui-endcard-hidden');
    requestAnimationFrame(() => {
      this.endcard?.classList.add('ui-endcard-visible');
    });
  }

  /**
   * Белый fade-эффект и перезапуск
   */
  private playFadeAndRestart(): void {
    this.currentScreen = 'fade';
    
    // Показываем белый экран
    this.fadeOverlay?.classList.add('ui-fade-active');
    
    // Через 1 секунду вызываем перезапуск и убираем fade
    setTimeout(() => {
      this.callbacks.onRetry();
      this.fadeOverlay?.classList.remove('ui-fade-active');
      this.showStartScreen();
    }, 1000);
  }

  /**
   * Сбросить UI
   */
  public reset(): void {
    this.hideStartScreen();
    this.hideModal();
    this.endcard?.classList.remove('ui-endcard-visible');
    this.endcard?.classList.add('ui-endcard-hidden');
    this.fadeOverlay?.classList.remove('ui-fade-active');
  }
}

