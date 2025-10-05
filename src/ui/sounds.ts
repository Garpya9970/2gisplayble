/**
 * Звуки для игры (генерируются через Web Audio API + файлы)
 */

// @ts-ignore
import carEngineUrl from '@/assets/zvuk-machine.mp3?url';

export class GameSounds {
  private audioContext?: AudioContext;
  private carEngineAudio?: HTMLAudioElement;
  private isInitialized = false;

  constructor() {
    // Создаем AudioContext только при первом взаимодействии
    // (из-за autoplay политики браузеров)
  }

  /**
   * Инициализация аудио при первом взаимодействии пользователя
   * (обход autoplay политики браузеров)
   */
  public initAudio(): void {
    if (this.isInitialized) return;
    
    try {
      // Инициализируем AudioContext
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Создаем аудио элемент для двигателя
      if (!this.carEngineAudio) {
        this.carEngineAudio = new Audio(carEngineUrl);
        this.carEngineAudio.loop = false;
        this.carEngineAudio.volume = 0.4;
        this.carEngineAudio.preload = 'auto';
        // Пробуем загрузить файл
        this.carEngineAudio.load();
      }
      
      this.isInitialized = true;
      console.log('[Sounds] Audio initialized');
    } catch (error) {
      console.warn('[Sounds] Could not initialize audio:', error);
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  /**
   * Проигрывает звук победы (праздничная мелодия)
   */
  public playVictory(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Более праздничная мелодия с арпеджио
      const notes = [
        { freq: 523.25, time: 0, duration: 0.12 },     // C5
        { freq: 659.25, time: 0.1, duration: 0.12 },   // E5
        { freq: 783.99, time: 0.2, duration: 0.12 },   // G5
        { freq: 1046.50, time: 0.3, duration: 0.25 },  // C6 (октава выше)
      ];

      notes.forEach(note => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'triangle';
        oscillator.frequency.value = note.freq;
        
        // Плавное нарастание и затухание
        gainNode.gain.setValueAtTime(0, now + note.time);
        gainNode.gain.linearRampToValueAtTime(0.25, now + note.time + 0.03);
        gainNode.gain.linearRampToValueAtTime(0, now + note.time + note.duration);
        
        oscillator.start(now + note.time);
        oscillator.stop(now + note.time + note.duration);
      });

      console.log('[Sounds] Victory sound played');
    } catch (error) {
      console.warn('[Sounds] Could not play victory sound:', error);
    }
  }

  /**
   * Проигрывает звук проигрыша (грустный звук)
   */
  public playDefeat(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Грустная мелодия (нисходящие ноты)
      const notes = [
        { freq: 523.25, time: 0, duration: 0.2 },    // C5
        { freq: 493.88, time: 0.2, duration: 0.2 },  // B4
        { freq: 440.00, time: 0.4, duration: 0.3 },  // A4
      ];

      notes.forEach(note => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = note.freq;
        
        gainNode.gain.setValueAtTime(0, now + note.time);
        gainNode.gain.linearRampToValueAtTime(0.2, now + note.time + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, now + note.time + note.duration);
        
        oscillator.start(now + note.time);
        oscillator.stop(now + note.time + note.duration);
      });

      console.log('[Sounds] Defeat sound played');
    } catch (error) {
      console.warn('[Sounds] Could not play defeat sound:', error);
    }
  }

  /**
   * Запускает звук двигателя машины (из файла)
   */
  public startCarEngine(): void {
    try {
      // Инициализируем аудио если еще не сделали
      this.initAudio();
      
      if (!this.carEngineAudio) {
        console.warn('[Sounds] Car engine audio not initialized');
        return;
      }
      
      // Перезапускаем с начала если уже играет
      this.carEngineAudio.currentTime = 0;
      
      // Играем звук
      const playPromise = this.carEngineAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('[Sounds] Could not play car engine:', err);
        });
      }

      console.log('[Sounds] Car engine started');
    } catch (error) {
      console.warn('[Sounds] Could not start car engine:', error);
    }
  }

  /**
   * Останавливает звук двигателя машины
   */
  public stopCarEngine(): void {
    try {
      if (this.carEngineAudio) {
        // Плавное затухание через volume
        const fadeOut = setInterval(() => {
          if (this.carEngineAudio && this.carEngineAudio.volume > 0.05) {
            this.carEngineAudio.volume -= 0.05;
          } else {
            if (this.carEngineAudio) {
              this.carEngineAudio.pause();
              this.carEngineAudio.volume = 0.4; // Восстанавливаем громкость
            }
            clearInterval(fadeOut);
          }
        }, 50);

        console.log('[Sounds] Car engine stopped');
      }
    } catch (error) {
      console.warn('[Sounds] Could not stop car engine:', error);
    }
  }

  /**
   * Проигрывает звук клика по кнопке
   */
  public playClick(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 800;
      
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      
      oscillator.start(now);
      oscillator.stop(now + 0.1);
    } catch (error) {
      console.warn('[Sounds] Could not play click sound:', error);
    }
  }
}

