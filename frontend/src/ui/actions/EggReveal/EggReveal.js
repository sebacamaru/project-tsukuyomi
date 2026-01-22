import "./EggReveal.css";
import { getAssetUrl } from "../../../utils/assetRegistry.js";

/**
 * EggReveal - Accion visual para mostrar el huevo del starter
 * Se usa durante el onboarding cuando el profesor entrega el huevo
 */
export class EggReveal {
  constructor(context, actionData) {
    this.context = context;
    this.data = actionData || {};
    this.element = null;
    this._keyHandler = null;
  }

  render() {
    const container = document.createElement("div");
    container.className = "egg-reveal";
    container.innerHTML = `
      <div class="egg-reveal__content">
        <div class="egg-reveal__egg-container">
          <img class="egg-reveal__egg" src="${getAssetUrl("sprite-egg.png")}" alt="Huevo misterioso" />
          <div class="egg-reveal__glow"></div>
        </div>
        ${this.data.text ? `<p class="egg-reveal__text">${this.data.text}</p>` : ""}
      </div>
      <span class="egg-reveal__hint">Tap o [Enter] para continuar</span>
    `;
    this.element = container;
    return container;
  }

  async show() {
    return new Promise((resolve) => {
      document.body.appendChild(this.render());

      // Trigger animation after append
      requestAnimationFrame(() => {
        this.element.classList.add("active");
      });

      const close = () => {
        // Limpiar event listener de teclado
        if (this._keyHandler) {
          document.removeEventListener("keydown", this._keyHandler);
        }

        this.element.classList.remove("active");
        setTimeout(() => {
          if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
          }
          resolve(true);
        }, 300);
      };

      // Click para cerrar
      this.element.addEventListener("click", close);

      // Enter o Space para cerrar
      this._keyHandler = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          close();
        }
      };
      document.addEventListener("keydown", this._keyHandler);
    });
  }
}
