export class Renderer {
  constructor() {
    this.app = null;
    this.particles = [];
    this.PIXI = null;
  }

  async init(wrapper) {
    if (this.app) return this.app;

    // Cargar PIXI dinámicamente
    if (!this.PIXI) {
      this.PIXI = await import("pixi.js");
    }

    // Crear aplicación PIXI v8 según la documentación oficial
    this.app = new this.PIXI.Application();

    await this.app.init({
      background: 0x0a0e27,
      resizeTo: wrapper,
      antialias: true,
    });

    // Insertar canvas como fondo dentro del wrapper
    this.app.canvas.style.position = "absolute";
    this.app.canvas.style.top = "0";
    this.app.canvas.style.left = "0";
    this.app.canvas.style.zIndex = "-1";
    wrapper.prepend(this.app.canvas);

    // Crear efecto de partículas
    this.createParticles();

    // Animar
    this.app.ticker.add(() => this.animate());

    return this.app;
  }

  createParticles() {
    const particleCount = 25;

    for (let i = 0; i < particleCount; i++) {
      const graphics = new this.PIXI.Graphics();

      // Círculo con gradiente (simulado con opacity)
      const size = Math.random() * 64 + 1;
      const color = [0x3498db, 0x2ecc71, 0x9b59b6, 0xf39c12][
        Math.floor(Math.random() * 4)
      ];

      graphics.circle(0, 0, size);
      graphics.fill({ color, alpha: 0.6 });

      const particle = {
        graphics,
        x: Math.random() * this.app.screen.width,
        y: Math.random() * this.app.screen.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size,
      };

      graphics.x = particle.x;
      graphics.y = particle.y;

      this.app.stage.addChild(graphics);
      this.particles.push(particle);
    }
  }

  animate() {
    const width = this.app.screen.width;
    const height = this.app.screen.height;

    this.particles.forEach((particle) => {
      // Mover partícula
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Wrap around screen
      if (particle.x < 0) particle.x = width;
      if (particle.x > width) particle.x = 0;
      if (particle.y < 0) particle.y = height;
      if (particle.y > height) particle.y = 0;

      // Actualizar posición del gráfico
      particle.graphics.x = particle.x;
      particle.graphics.y = particle.y;
    });
  }

  destroy() {
    if (this.app) {
      this.app.destroy(true);
      this.app = null;
    }
  }
}
