/**
 * Router simple con History API
 * Sincroniza rutas con escenas
 */
export class Router {
  constructor() {
    this.routes = new Map();
    this.sceneToPath = new Map();
    this.sceneManager = null;
  }

  /**
   * Inicializar router
   */
  init(sceneManager) {
    this.sceneManager = sceneManager;

    // Escuchar cambios en el historial (botón back/forward)
    window.addEventListener("popstate", () => {
      this.handleRoute(window.location.pathname);
    });

    // Interceptar clicks en links para evitar recargas
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a[href^='/']");
      if (link) {
        e.preventDefault();
        this.navigate(link.getAttribute("href"));
      }
    });

    // Manejar ruta inicial
    this.handleRoute(window.location.pathname);
  }

  /**
   * Registrar una ruta
   * @param {string} path - Ruta (ej: "/marketplace")
   * @param {string} sceneName - Nombre de la escena registrada
   */
  register(path, sceneName) {
    this.routes.set(path, sceneName);
    this.sceneToPath.set(sceneName, path);
  }

  /**
   * Navegar a una ruta
   * @param {string} path - Ruta destino
   */
  navigate(path) {
    // Actualizar URL sin recargar
    window.history.pushState({}, "", path);
    this.handleRoute(path);
  }

  /**
   * Manejar cambio de ruta (sin updatear URL, ya viene de popstate o navigate)
   */
  handleRoute(path) {
    const sceneName = this.routes.get(path);

    if (sceneName) {
      // false para NO actualizar URL (ya está actualizada)
      this.sceneManager.goTo(sceneName, false);
    } else {
      // Ruta no encontrada, redirigir a home
      console.warn(`Route not found: ${path}, redirecting to /`);
      this.navigate("/");
    }
  }

  /**
   * Obtener path por nombre de escena
   */
  getPathByScene(sceneName) {
    return this.sceneToPath.get(sceneName);
  }

  /**
   * Helper: obtener ruta actual
   */
  get currentPath() {
    return window.location.pathname;
  }
}

// Singleton
export const router = new Router();
