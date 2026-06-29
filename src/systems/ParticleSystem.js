export class ParticleSystem {
  constructor(maxParticles = 180) {
    this.particles = [];
    this.maxParticles = maxParticles;
  }

  clear() {
    this.particles.length = 0;
  }

  emitBurst(x, y, color, count = 8, options = {}) {
    const speed = options.speed ?? 140;
    const size = options.size ?? 5;
    const life = options.life ?? 0.45;

    for (let i = 0; i < count; i += 1) {
      if (this.particles.length >= this.maxParticles) {
        this.trimOldest(count);
      }

      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const velocity = speed * (0.55 + Math.random() * 0.65);

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life,
        maxLife: life,
        size: size * (0.7 + Math.random() * 0.6),
        color,
        gravity: options.gravity ?? 220,
        drag: options.drag ?? 0.92,
      });
    }
  }

  emitSparkles(x, y, color, count = 6) {
    for (let i = 0; i < count; i += 1) {
      if (this.particles.length >= this.maxParticles) {
        this.trimOldest(count);
      }

      const angle = Math.random() * Math.PI * 2;
      const velocity = 60 + Math.random() * 90;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 40,
        life: 0.35 + Math.random() * 0.2,
        maxLife: 0.55,
        size: 3 + Math.random() * 3,
        color,
        gravity: 120,
        drag: 0.9,
      });
    }
  }

  trimOldest(count) {
    this.particles.splice(0, Math.min(count, this.particles.length));
  }

  update(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const particle = this.particles[i];
      particle.life -= deltaTime;

      if (particle.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      particle.vx *= particle.drag;
      particle.vy *= particle.drag;
      particle.vy += particle.gravity * deltaTime;
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
    }
  }

  draw(ctx, camera) {
    for (const particle of this.particles) {
      const alpha = Math.max(0, particle.life / particle.maxLife);
      const screen = camera.worldToScreen({ x: particle.x, y: particle.y });

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, particle.size * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
