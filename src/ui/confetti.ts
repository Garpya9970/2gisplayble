/**
 * Конфетти эффект для победного экрана
 */

export class ConfettiEffect {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationFrame?: number;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'confetti-canvas';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '250';
    
    this.ctx = this.canvas.getContext('2d')!;
    this.resize();
    
    window.addEventListener('resize', () => this.resize());
  }

  private resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  public start(container: HTMLElement): void {
    container.appendChild(this.canvas);
    this.createParticles();
    this.animate();
  }

  public stop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.particles = [];
    this.canvas.remove();
  }

  private createParticles(): void {
    const colors = ['#00CA5D', '#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#FF0080'];
    const particleCount = 150;

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: -20,
        size: Math.random() * 8 + 4,
        speedX: Math.random() * 4 - 2,
        speedY: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)] || '#00CA5D',
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5,
        gravity: 0.2,
      });
    }
  }

  private animate = (): void => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (!p) continue;
      
      // Обновление позиции
      p.speedY += p.gravity;
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;

      // Удаление частиц, ушедших за экран
      if (p.y > this.canvas.height + 20) {
        this.particles.splice(i, 1);
        continue;
      }

      // Рисование частицы
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      this.ctx.restore();
    }

    // Продолжаем анимацию если есть частицы
    if (this.particles.length > 0) {
      this.animationFrame = requestAnimationFrame(this.animate);
    } else {
      // Все частицы упали - останавливаем
      this.stop();
    }
  };
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  gravity: number;
}

