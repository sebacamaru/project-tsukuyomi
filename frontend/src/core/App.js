import { Renderer } from "./Renderer.js";
import { SceneManager } from "./SceneManager.js";
import { router } from "./Router.js";
import { loadingIndicator } from "../ui/components/LoadingIndicator/LoadingIndicator.js";
import { Navbar } from "../ui/components/Navbar/Navbar.js";
import { store } from "./Store.js";
import layoutHTML from "../ui/layout/layout.html?raw";
import "../ui/layout/layout.css";
import "../styles/chigui.css";

export class App {
  constructor() {
    this.renderer = new Renderer();
  }

  async init() {
    // Inicializar renderer PIXI (canvas de fondo) con loading indicator
    await loadingIndicator.wrap(async () => {
      await this.renderer.init();
    });

    const uiRoot = document.createElement("div");
    uiRoot.id = "ui-root";
    uiRoot.innerHTML = layoutHTML;
    document.body.appendChild(uiRoot);

    // Inicializar SceneManager con el outlet y el router
    const outlet = uiRoot.querySelector("#scene-outlet");
    SceneManager.init(outlet, router);

    // Inicializar Navbar con items de navegación
    this.initNavbar(uiRoot);

    // Programar actualización del badge si hay delay pendiente
    this.scheduleBadgeUpdate();
  }

  /**
   * Calcula el badge del Profesor basado en quests disponibles
   */
  getProfessorBadge() {
    const user = store.user;
    if (!user || !user.current_quest_code) {
      return 0;
    }

    // Si hay delay activo, no mostrar badge
    if (user.next_quest_available_at) {
      const now = Math.floor(Date.now() / 1000);
      if (now < user.next_quest_available_at) {
        return 0;
      }
    }

    // Hay quest disponible
    return 1;
  }

  initNavbar(uiRoot) {
    const navItems = [
      {
        route: "/",
        label: "Inicio",
        icon: "🏠",
      },
      {
        route: "/battle",
        label: "Batalla",
        icon: "⚔️",
      },
      {
        route: "/professor",
        label: "Profesor Cacho",
        icon: "🎒",
        badge: this.getProfessorBadge(),
      },
      {
        route: "/marketplace",
        label: "Marketplace",
        icon: "🏪",
      },
      {
        route: "/profile",
        label: "Perfil",
        icon: "👤",
      },
    ];

    this.navbar = new Navbar(navItems);
    const navbarContainer = uiRoot.querySelector("#navbar-container");
    navbarContainer.appendChild(this.navbar.render());
  }

  /**
   * Actualiza el badge del Profesor (llamar después de cambios en quests)
   */
  updateProfessorBadge() {
    if (this.navbar) {
      this.navbar.updateBadge("/professor", this.getProfessorBadge());
    }
    // Reprogramar timer si hay delay pendiente
    this.scheduleBadgeUpdate();
  }

  /**
   * Programa la actualización automática del badge cuando termine el delay
   */
  scheduleBadgeUpdate() {
    // Cancelar timer anterior si existe
    if (this.badgeTimer) {
      clearTimeout(this.badgeTimer);
      this.badgeTimer = null;
    }

    const user = store.user;
    if (!user || !user.next_quest_available_at || !user.current_quest_code) {
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const delaySeconds = user.next_quest_available_at - now;

    if (delaySeconds > 0) {
      this.badgeTimer = setTimeout(() => {
        this.updateProfessorBadge();
      }, delaySeconds * 1000);
    }
  }
}
