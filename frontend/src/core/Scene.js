import { initLazyImages } from "../utils/lazyLoader.js";
import { loadingIndicator } from "../ui/components/LoadingIndicator/LoadingIndicator.js";
import { SceneManager } from "./SceneManager.js";

/**
 * Wrapper para elementos DOM interactuables/animables
 * Registrados automáticamente via data-entity="name" en HTML
 */
class Entity {
  constructor(el, scene) {
    this.el = el;
    this._stopFn = null;
    this._scene = scene;
  }

  /** Animación one-shot (await). Auto-stop de loop activo */
  async play(animClass) {
    if (this._stopFn) this.stop();
    return this._scene.playAnim(this.el, animClass);
  }

  /** Animación loop. Retorna this para chaining */
  start(animClass) {
    if (this._stopFn) this.stop();
    this._stopFn = this._scene.startAnim(this.el, animClass);
    return this;
  }

  /** Detener animación loop activa */
  stop() {
    if (this._stopFn) {
      this._stopFn();
      this._stopFn = null;
    }
    return this;
  }

  show() { this.el.hidden = false; return this; }
  hide() { this.el.hidden = true; return this; }
  addClass(cls) { this.el.classList.add(cls); return this; }
  removeClass(cls) { this.el.classList.remove(cls); return this; }
  toggle(cls) { this.el.classList.toggle(cls); return this; }

  onClick(callback) { this._scene.on(this.el, "click", callback); return this; }
  on(event, callback) { this._scene.on(this.el, event, callback); return this; }

  get disabled() { return this.el.disabled; }
  set disabled(v) { this.el.disabled = v; }
}

/**
 * Wrapper para grupos de entities (data-group="name")
 */
class EntityGroup {
  constructor(entities) {
    this.items = entities;
  }

  /** Animación one-shot en todos en paralelo */
  async playAll(animClass) {
    return Promise.all(this.items.map((e) => e.play(animClass)));
  }

  /** Animación one-shot secuencial con delay entre cada uno */
  async playSequential(animClass, delayMs = 200) {
    for (let i = 0; i < this.items.length; i++) {
      await this.items[i].play(animClass);
      if (i < this.items.length - 1 && delayMs > 0) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }

  /** Aplicar función a cada entity */
  each(fn) {
    this.items.forEach(fn);
    return this;
  }

  /** Ejecutar función async secuencialmente con delay */
  async eachSequential(fn, delayMs = 200) {
    for (let i = 0; i < this.items.length; i++) {
      await fn(this.items[i], i);
      if (i < this.items.length - 1 && delayMs > 0) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }

  startAll(animClass) { this.items.forEach((e) => e.start(animClass)); return this; }
  stopAll() { this.items.forEach((e) => e.stop()); return this; }
}

/**
 * Clase base para todas las escenas
 * Maneja lógica común: event delegation, lazy loading, cleanup
 */
export class Scene {
  constructor() {
    this.root = null;
    this.entity = {};
    this.entities = {};
    this.eventHandlers = new Map();
    this.background = null; // Propiedad opcional para background personalizado (inline style)
    this.backgroundClass = null; // Propiedad opcional para clase CSS de background
    this._originalBackground = null; // Guardar el background original
    this._cutsceneModeActive = false; // Track si esta escena activó cutscene mode
    this.useSpriteRenderer = false; // Opt-in: estructura dual sprite-renderer + ui-renderer
    this.spriteRoot = null; // Ref al div de sprites (90x135 escalado)
    this.uiRoot = null; // Ref al div de UI overlay (no escalado)
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

    if (this.useSpriteRenderer) {
      // Estructura dual: sprite-renderer (escalado) + ui-renderer (overlay)
      root.innerHTML = `
        <div id="sprite-renderer"></div>
        <div id="ui-renderer"></div>
      `;
      this.spriteRoot = root.querySelector("#sprite-renderer");
      this.uiRoot = root.querySelector("#ui-renderer");

      const spriteHTML = await this.getSpriteHTML();
      if (spriteHTML) this.spriteRoot.innerHTML = spriteHTML;

      const uiHTML = await this.getHTML();
      if (uiHTML) this.uiRoot.innerHTML = uiHTML;

      this._updateSpriteScale();
      this._resizeHandler = () => this._updateSpriteScale();
      window.addEventListener("resize", this._resizeHandler);
    } else {
      // Comportamiento estándar (sin cambios)
      const html = await this.getHTML();
      root.innerHTML = html;
    }

    // Auto-registrar entities y grupos desde data attributes
    this._registerEntities();

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
    // Cancelar secuencias de animación en curso
    this._sequenceCancelled = true;

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

    // Cleanup automático de entities (stop animaciones activas)
    for (const e of Object.values(this.entity)) {
      e.stop();
    }
    this.entity = {};
    this.entities = {};

    // Cleanup resize listener del sprite-renderer
    if (this._resizeHandler) {
      window.removeEventListener("resize", this._resizeHandler);
      this._resizeHandler = null;
    }
    this.spriteRoot = null;
    this.uiRoot = null;

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
   * DEBE ser implementado por subclases (UI-only scenes)
   * En escenas con useSpriteRenderer=true, retorna HTML para el ui-renderer (overlay)
   * Retorna el HTML de la escena (string o Promise<string>)
   */
  async getHTML() {
    if (this.useSpriteRenderer) return "";
    throw new Error("getHTML() must be implemented by subclass");
  }

  /**
   * PUEDE ser sobrescrito por subclases con useSpriteRenderer=true
   * Retorna HTML para el sprite-renderer (90x135px escalado)
   */
  async getSpriteHTML() {
    return "";
  }

  /**
   * Calcula y aplica la escala del sprite-renderer relativo al #app-wrapper
   */
  _updateSpriteScale() {
    if (!this.spriteRoot) return;
    const wrapper = document.querySelector("#app-wrapper");
    if (!wrapper) return;
    const s = Math.min(wrapper.clientWidth / 90, wrapper.clientHeight / 135);
    this.spriteRoot.style.transform = `translate(-50%, -50%) scale(${s})`;
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
   * Ejecuta una animación CSS one-shot y espera a que termine
   * Agrega la clase, espera animationend, la remueve
   * Ejemplo: await this.playAnim(egg, 'anim-shake')
   */
  playAnim(el, animClass) {
    el.classList.remove(animClass);
    void el.offsetWidth;
    return new Promise((resolve) => {
      el.addEventListener(
        "animationend",
        () => {
          el.classList.remove(animClass);
          resolve();
        },
        { once: true },
      );
      el.classList.add(animClass);
    });
  }

  /**
   * Inicia una animación CSS en loop, retorna función para detenerla
   * Ejemplo: const stop = this.startAnim(egg, 'anim-wobble')
   *          stop() // para la animación
   */
  startAnim(el, animClass) {
    el.classList.add(animClass);
    return () => el.classList.remove(animClass);
  }

  /**
   * Ejecuta una lista de pasos async en secuencia con cancelación automática
   * Se cancela si la escena sale (onExit). Cada paso es una función que retorna Promise.
   * Ejemplo:
   *   await this.runSequence([
   *     () => this.playAnim(btn, 'anim-press'),
   *     () => this.turnLightsOn(),
   *     () => this.shakeEgg(3),
   *   ]);
   */
  async runSequence(steps) {
    this._sequenceCancelled = false;
    for (const step of steps) {
      if (this._sequenceCancelled) return;
      await step();
    }
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

  /**
   * Helper: mostrar mensaje al jugador via MessageBox
   * Ejemplo: await this.showMessage("Hatching...", "Professor")
   */
  async showMessage(text, speaker = null) {
    const { MessageBox } = await import(
      "../ui/components/MessageBox/MessageBox.js"
    );
    return MessageBox.alert(text, speaker);
  }

  /**
   * Helper: animación one-shot en el root de la escena
   * Útil para flashes, fades, screen-shakes
   * Ejemplo: await this.playSceneAnim("anim-shake")
   */
  async playSceneAnim(animClass) {
    return this.playAnim(this.root, animClass);
  }

  /**
   * Auto-registra entities (data-entity) y grupos (data-group) del HTML
   */
  _registerEntities() {
    this.entity = {};
    this.entities = {};

    for (const el of this.root.querySelectorAll("[data-entity]")) {
      const name = el.dataset.entity;
      if (!this.entity[name]) {
        this.entity[name] = new Entity(el, this);
      }
    }

    const groupArrays = {};
    for (const el of this.root.querySelectorAll("[data-group]")) {
      const group = el.dataset.group;
      if (!groupArrays[group]) {
        groupArrays[group] = [];
      }
      groupArrays[group].push(new Entity(el, this));
    }

    for (const [name, items] of Object.entries(groupArrays)) {
      this.entities[name] = new EntityGroup(items);
    }
  }
}
