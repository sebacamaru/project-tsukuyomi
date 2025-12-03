import { Renderer } from "./Renderer.js";
import { SceneManager } from "./SceneManager.js";
import { router } from "./Router.js";
import { loadingIndicator } from "../ui/components/LoadingIndicator/LoadingIndicator.js";
import "../ui/global.css";
import layoutHTML from "../ui/layout/layout.html?raw";
import "../ui/layout/layout.css";

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
  }
}
