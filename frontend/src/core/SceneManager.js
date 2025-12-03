import { loadingIndicator } from "../ui/components/LoadingIndicator/LoadingIndicator.js";

export const SceneManager = {
  scenes: new Map(),
  instances: new Map(),
  current: null,
  container: null,
  router: null,

  init(domContainer, router = null) {
    this.container = domContainer;
    this.router = router;
  },

  /**
   * Registrar una escena con su ruta automática
   * @param {string} name - Nombre de la escena (ej: "dashboard", "market")
   * @param {*} sceneClassOrImporter - Clase o función que retorna dynamic import
   * @param {string|null} customPath - Ruta personalizada (opcional)
   */
  register(name, sceneClassOrImporter, customPath = null) {
    this.scenes.set(name, sceneClassOrImporter);

    // Auto-registrar ruta en el router si está disponible
    if (this.router) {
      const path = customPath || this.generatePath(name);
      this.router.register(path, name);
    }
  },

  /**
   * Generar ruta automática basada en convención
   * dashboard -> /
   * market -> /marketplace
   * profile -> /profile
   */
  generatePath(name) {
    // Casos especiales
    if (name === "dashboard" || name === "home") {
      return "/";
    }

    // Convención: "market" -> "/marketplace"
    const pathMappings = {
      market: "/marketplace",
    };

    return pathMappings[name] || `/${name}`;
  },

  async goTo(name, updateUrl = true) {
    // Mostrar loading indicator automáticamente
    loadingIndicator.show();

    try {
      const sceneClassOrImporter = this.scenes.get(name);
      if (!sceneClassOrImporter) throw new Error("Scene not found: " + name);

      // Lazy load si es una función (dynamic import)
      let SceneClass = sceneClassOrImporter;
      if (typeof sceneClassOrImporter === "function" && !sceneClassOrImporter.prototype) {
        const module = await sceneClassOrImporter();
        SceneClass = module.default || Object.values(module)[0];
      }

      // Reusar instancia o crear nueva
      let next = this.instances.get(name);
      if (!next) {
        next = new SceneClass();
        this.instances.set(name, next);
      }

      if (this.current) {
        this.current.onExit();
      }

      this.container.innerHTML = "";

      this.current = next;
      await next.onEnter(this.container);

      // Actualizar URL si el router está disponible y updateUrl es true
      if (updateUrl && this.router) {
        const path = this.router.getPathByScene(name);
        if (path && path !== this.router.currentPath) {
          window.history.pushState({}, "", path);
        }
      }
    } finally {
      // Ocultar loading indicator cuando termine (éxito o error)
      loadingIndicator.hide();
    }
  },
};
