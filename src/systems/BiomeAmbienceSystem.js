const STYLES = {
  fireflies: { color: "rgba(255,240,120,", max: 28, size: [1.5, 3], drift: 18, vyBias: -4 },
  pollen: { color: "rgba(255,230,160,", max: 24, size: [1, 2.5], drift: 12, vyBias: -3 },
  mist: { color: "rgba(200,220,255,", max: 20, size: [8, 18], drift: 6, vyBias: -2 },
  dust: { color: "rgba(220,200,160,", max: 18, size: [1, 2], drift: 10, vyBias: -5 },
  ash: { color: "rgba(180,120,100,", max: 22, size: [1.5, 3], drift: 14, vyBias: -6 },
  embers: { color: "rgba(255,180,90,", max: 16, size: [1, 2.5], drift: 16, vyBias: -8 },
  moonlitFog: { color: "rgba(100,160,180,", max: 26, size: [2, 5], drift: 10, vyBias: -5 },
  graveAtmosphere: { color: "rgba(180,190,210,", max: 22, size: [2, 14], drift: 5, vyBias: -3, dualTone: true },
  archiveDust: { color: "rgba(255,200,140,", max: 20, size: [1, 2.5], drift: 8, vyBias: -6 },
  frostSnow: { color: "rgba(220,240,255,", max: 24, size: [1.5, 4], drift: 8, vyBias: 10 },
};

export class BiomeAmbienceSystem {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.particles = [];
    this.style = null;
    this.styleKey = null;
  }

  setWorld(world) {
    const nextStyle = world?.ambience ?? null;

    if (this.styleKey === nextStyle) {
      return;
    }

    this.styleKey = nextStyle;
    this.style = STYLES[nextStyle] ?? null;
    this.particles = [];
  }

  update(deltaTime, camera, world) {
    this.setWorld(world);

    if (!this.style) {
      return;
    }

    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const particle = this.particles[i];
      particle.life -= deltaTime;
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;

      if (particle.life <= 0) {
        const lastIndex = this.particles.length - 1;

        if (i !== lastIndex) {
          this.particles[i] = this.particles[lastIndex];
        }

        this.particles.pop();
      }
    }

    while (this.particles.length < this.style.max) {
      if (Math.random() > deltaTime * 8) {
        break;
      }

      this.particles.push(this.createParticle(camera));
    }
  }

  createParticle(camera) {
    const style = this.style;
    const size = style.size[0] + Math.random() * (style.size[1] - style.size[0]);
    const vyBias = style.vyBias ?? -4;
    const isMist = style.dualTone && Math.random() < 0.55;

    return {
      x: camera.position.x + Math.random() * this.width,
      y: camera.position.y + Math.random() * this.height,
      vx: (Math.random() - 0.5) * style.drift,
      vy: (Math.random() - 0.5) * style.drift + vyBias,
      size: isMist ? size * 1.6 : size,
      alpha: isMist ? 0.12 + Math.random() * 0.18 : 0.25 + Math.random() * 0.45,
      life: 1.8 + Math.random() * 2.4,
      tone: isMist ? "mist" : "mote",
    };
  }

  draw(ctx, camera) {
    if (!this.style || this.particles.length === 0) {
      return;
    }

    ctx.save();

    for (const particle of this.particles) {
      const screenX = particle.x - camera.position.x;
      const screenY = particle.y - camera.position.y;

      if (screenX < -40 || screenY < -40 || screenX > this.width + 40 || screenY > this.height + 40) {
        continue;
      }

      let color = this.style.color;

      if (this.style.dualTone && particle.tone === "mist") {
        color = "rgba(80,90,110,";
      } else if (this.style.dualTone) {
        color = "rgba(210,220,235,";
      }

      ctx.fillStyle = `${color}${particle.alpha})`;
      ctx.beginPath();
      ctx.arc(screenX, screenY, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
