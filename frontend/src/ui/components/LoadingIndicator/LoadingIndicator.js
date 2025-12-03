import "./LoadingIndicator.css";

/**
 * Loading indicator global y sutil
 * Barra en la parte superior de la pantalla con animación smooth
 */
export class LoadingIndicator {
  constructor() {
    this.element = null;
    this.progressBar = null;
    this.loadingQueue = 0;
    this.init();
  }

  init() {
    // Crear elemento del loading indicator
    this.element = document.createElement("div");
    this.element.className = "loading-indicator";
    this.element.innerHTML = `
      <div class="loading-indicator__bar"></div>
    `;
    document.body.appendChild(this.element);

    this.progressBar = this.element.querySelector(".loading-indicator__bar");
  }

  /**
   * Mostrar loading indicator
   */
  show() {
    this.loadingQueue++;

    if (this.loadingQueue === 1) {
      // Primera petición, mostrar el loading
      this.element.classList.add("loading-indicator--visible");
      this.progressBar.style.width = "0%";

      // Animación de progreso indeterminado
      setTimeout(() => {
        this.progressBar.style.width = "99%";
      }, 100);
    }
  }

  /**
   * Ocultar loading indicator
   */
  hide() {
    this.loadingQueue = Math.max(0, this.loadingQueue - 1);

    if (this.loadingQueue === 0) {
      // Ya no hay peticiones pendientes, ocultar inmediatamente
      this.element.classList.remove("loading-indicator--visible");

      // Reset después del fade out
      setTimeout(() => {
        this.progressBar.style.width = "0%";
      }, 200); // Espera el tiempo de la transición de opacity
    }
  }

  /**
   * Wrapper para ejecutar operaciones async con loading automático
   */
  async wrap(asyncFn) {
    this.show();
    try {
      return await asyncFn();
    } finally {
      this.hide();
    }
  }
}

// Singleton
export const loadingIndicator = new LoadingIndicator();
