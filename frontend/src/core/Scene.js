import { initLazyImages } from "../utils/lazyLoader.js";
import { loadingIndicator } from "../ui/components/LoadingIndicator/LoadingIndicator.js";
import { SceneManager } from "./SceneManager.js";

/**
 * Clase base para todas las escenas
 * Maneja lógica común: event delegation, lazy loading, cleanup
 */
export class Scene {
  constructor() {
    this.root = null;
    this.eventHandlers = new Map();
    this.background = null; // Propiedad opcional para background personalizado (inline style)
    this.backgroundClass = null; // Propiedad opcional para clase CSS de background
    this._originalBackground = null; // Guardar el background original
    this._cutsceneModeActive = false; // Track si esta escena activó cutscene mode
  }

  /**
   * Lifecycle: llamado cuando la escena entra
   * Las subclases deben implementar getHTML() y pueden sobrescribir initUI()
   */
  async onEnter(root) {
    this.root = root;

    // Aplicar clase CSS de background si está definida
    if (this.backgroundClass) {
      root.classList.add(this.backgroundClass);
    }

    // Aplicar background inline si está definido
    if (this.background) {
      this._originalBackground = root.style.background;
      root.style.background = this.background;
    }

    // Renderizar HTML de la escena
    const html = await this.getHTML();
    root.innerHTML = html;

    // Inicializar UI específica de la escena
    await this.initUI(root);

    // Inicializar lazy loading DESPUÉS de initUI (donde se renderizan items dinámicos)
    initLazyImages(root);

    // Llamar a onEnterComplete de forma no bloqueante
    // Esto permite que el loading indicator se oculte inmediatamente
    // mientras los diálogos se ejecutan en background
    this.onEnterComplete().catch((err) => {
      console.error("Error in onEnterComplete:", err);
    });
  }

  /**
   * Lifecycle: llamado cuando la escena sale
   * Limpia automáticamente todos los event listeners registrados
   */
  onExit() {
    // Auto-cleanup de cutscene mode si estaba activo
    if (this._cutsceneModeActive) {
      this.exitCutsceneMode();
    }

    // Remover clase CSS de background si se aplicó
    if (this.backgroundClass && this.root) {
      this.root.classList.remove(this.backgroundClass);
    }

    // Restaurar background inline original si se aplicó uno personalizado
    if (this.background && this.root) {
      this.root.style.background = this._originalBackground;
      this._originalBackground = null;
    }

    // Cleanup automático de todos los event handlers
    this.eventHandlers.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventHandlers.clear();
    this.root = null;
  }

  /**
   * Registrar event listener con cleanup automático
   * Usa esto en vez de addEventListener directamente
   */
  on(element, event, handler) {
    element.addEventListener(event, handler);
    this.eventHandlers.set(`${event}-${Math.random()}`, {
      element,
      event,
      handler,
    });
  }

  /**
   * Shortcut para querySelector dentro del root de la escena
   * Ejemplo: this.$("#email")
   */
  $(selector) {
    return this.root.querySelector(selector);
  }

  /**
   * Shortcut para querySelectorAll dentro del root de la escena
   * Ejemplo: this.$$(".item")
   */
  $$(selector) {
    return this.root.querySelectorAll(selector);
  }

  /**
   * Event delegation helper - registra un click handler en el root
   * Ejemplo: this.onClick('#btnSubmit', () => {...})
   */
  onClick(selector, callback) {
    const handler = (e) => {
      const target = e.target.closest(selector);
      if (target) {
        callback(e, target);
      }
    };
    this.on(this.root, "click", handler);
  }

  /**
   * DEBE ser implementado por subclases
   * Retorna el HTML de la escena (string o Promise<string>)
   */
  async getHTML() {
    throw new Error("getHTML() must be implemented by subclass");
  }

  /**
   * PUEDE ser sobrescrito por subclases
   * Lógica de inicialización específica de la escena
   */
  async initUI(root) {
    // Override en subclases si necesitan lógica adicional
  }

  /**
   * PUEDE ser sobrescrito por subclases
   * Se ejecuta automáticamente después de que la escena está completamente renderizada
   * Útil para diálogos automáticos, animaciones de entrada, etc.
   */
  async onEnterComplete() {
    // Override en subclases si necesitan lógica post-render
  }

  /**
   * Helper: delay/espera en milisegundos
   * Útil para secuencias de diálogos o animaciones temporales
   * Ejemplo: await this.delay(2000); // espera 2 segundos
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Activa el modo cutscene (oculta navbar)
   * Útil para diálogos cinemáticos o secuencias inmersivas
   */
  enterCutsceneMode() {
    if (typeof SceneManager === "undefined") {
      console.error("Scene: SceneManager no disponible");
      return;
    }

    SceneManager._applyCutsceneMode(true);
    this._cutsceneModeActive = true;
  }

  /**
   * Desactiva el modo cutscene (muestra navbar)
   */
  exitCutsceneMode() {
    if (typeof SceneManager === "undefined") {
      console.error("Scene: SceneManager no disponible");
      return;
    }

    SceneManager._applyCutsceneMode(false);
    this._cutsceneModeActive = false;
  }

  /**
   * Helper: ejecutar operación async con loading indicator
   * Útil para operaciones dentro de la escena (ej: cargar más items)
   */
  async withLoading(asyncFn) {
    return loadingIndicator.wrap(asyncFn);
  }
}
