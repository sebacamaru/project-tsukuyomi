import { initLazyImages } from "../utils/lazyLoader.js";
import { loadingIndicator } from "../ui/components/LoadingIndicator/LoadingIndicator.js";

/**
 * Clase base para todas las escenas
 * Maneja lógica común: event delegation, lazy loading, cleanup
 */
export class Scene {
  constructor() {
    this.root = null;
    this.eventHandlers = new Map();
  }

  /**
   * Lifecycle: llamado cuando la escena entra
   * Las subclases deben implementar getHTML() y pueden sobrescribir initUI()
   */
  async onEnter(root) {
    this.root = root;

    // Renderizar HTML de la escena
    const html = await this.getHTML();
    root.innerHTML = html;

    // Inicializar lazy loading automáticamente
    initLazyImages(root);

    // Inicializar UI específica de la escena
    await this.initUI(root);
  }

  /**
   * Lifecycle: llamado cuando la escena sale
   * Limpia automáticamente todos los event listeners registrados
   */
  onExit() {
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
    this.eventHandlers.set(`${event}-${Math.random()}`, { element, event, handler });
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
   * Helper: ejecutar operación async con loading indicator
   * Útil para operaciones dentro de la escena (ej: cargar más items)
   */
  async withLoading(asyncFn) {
    return loadingIndicator.wrap(asyncFn);
  }
}
