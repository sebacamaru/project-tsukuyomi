import { Renderer } from "./Renderer.js";
import { SceneManager } from "./SceneManager.js";
import { router } from "./Router.js";
import { loadingIndicator } from "../ui/components/LoadingIndicator/LoadingIndicator.js";
import { Navbar } from "../ui/components/Navbar/Navbar.js";
import layoutHTML from "../ui/layout/layout.html?raw";
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
        route: "/inventory",
        label: "Inventario",
        icon: "🎒",
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

    const navbar = new Navbar(navItems);
    const navbarContainer = uiRoot.querySelector("#navbar-container");
    navbarContainer.appendChild(navbar.render());
  }
}
