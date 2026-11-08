/**
 * Particle & Confetti Engine for "DON'T BLINK"
 * High-performance Canvas-based particle rendering.
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'square' | 'spark' | 'ring';
}

class ParticleManager {
  private particles: Particle[] = [];
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;

  public init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', this.handleResize);
    this.startLoop();
  }

  public destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    window.removeEventListener('resize', this.handleResize);
    this.particles = [];
  }

  private handleResize = () => {
    this.resize();
  };

  private resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }
  }

  private startLoop() {
    const loop = () => {
      this.updateAndRender();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  public emitTargetBurst(x: number, y: number, type: 'green' | 'gold' | 'red' | 'bomb') {
    const count = type === 'bomb' ? 60 : type === 'gold' ? 36 : 24;
    const colors = {
      green: ['#00ff88', '#10b981', '#6ee7b7', '#ffffff'],
      gold: ['#ffd700', '#f59e0b', '#fef08a', '#ffffff'],
      red: ['#ff0055', '#ef4444', '#f87171', '#ff8888'],
      bomb: ['#ff0033', '#ff5500', '#ffcc00', '#222222', '#ffffff'],
    }[type];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = type === 'bomb' ? 3 + Math.random() * 8 : 2 + Math.random() * 5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const maxLife = type === 'bomb' ? 45 : 30;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: type === 'gold' ? 3 + Math.random() * 4 : 2 + Math.random() * 4,
        alpha: 1,
        life: 0,
        maxLife,
        shape: type === 'gold' ? 'spark' : Math.random() > 0.5 ? 'circle' : 'square',
      });
    }

    // Shockwave ring for bomb and gold
    if (type === 'bomb' || type === 'gold') {
      this.particles.push({
        x,
        y,
        vx: 0,
        vy: 0,
        color: type === 'bomb' ? '#ff2200' : '#ffd700',
        size: 10,
        alpha: 0.9,
        life: 0,
        maxLife: 25,
        shape: 'ring',
      });
    }
  }

  // Celebratory confetti shower for result screen
  public triggerConfetti() {
    if (!this.canvas) return;
    const width = this.canvas.getBoundingClientRect().width;
    const colors = ['#00ff88', '#00f0ff', '#b026ff', '#ffd700', '#ff0055', '#ffffff'];

    for (let i = 0; i < 90; i++) {
      this.particles.push({
        x: Math.random() * width,
        y: -10,
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 5,
        alpha: 1,
        life: 0,
        maxLife: 120 + Math.random() * 60,
        shape: 'square',
      });
    }
  }

  private updateAndRender() {
    if (!this.ctx || !this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, rect.width, rect.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Friction & gravity
      if (p.shape === 'ring') {
        p.size += 5; // ring expands
      } else {
        p.vx *= 0.96;
        p.vy *= 0.96;
        if (p.maxLife > 60) {
          // confetti falls down
          p.vy += 0.08;
        }
      }

      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.life >= p.maxLife || p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      // Render
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.strokeStyle = p.color;

      if (p.shape === 'ring') {
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.stroke();
      } else if (p.shape === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.shape === 'spark') {
        // Cross / star sparkle
        this.ctx.beginPath();
        this.ctx.moveTo(p.x - p.size * 1.5, p.y);
        this.ctx.lineTo(p.x + p.size * 1.5, p.y);
        this.ctx.moveTo(p.x, p.y - p.size * 1.5);
        this.ctx.lineTo(p.x, p.y + p.size * 1.5);
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      } else {
        // Square
        this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }

      this.ctx.restore();
    }
  }
}

export const particleEngine = new ParticleManager();
