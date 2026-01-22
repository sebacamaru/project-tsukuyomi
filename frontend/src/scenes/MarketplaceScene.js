import marketHTML from "../ui/scenes/marketplace/marketplace.html?raw";
import "../ui/scenes/marketplace/marketplace.css";
import { Scene } from "../core/Scene.js";
import { marketplaceService } from "../services/marketplaceService.js";
import { getAssetUrl } from "../utils/assetRegistry.js";

export class MarketplaceScene extends Scene {
  async getHTML() {
    return marketHTML;
  }

  async initUI() {
    // Cargar items del servicio
    const items = await marketplaceService.getItems();
    const container = document.getElementById("marketItems");

    // Renderizar items
    container.innerHTML = items.map((item) => this.renderItem(item)).join("");

    // Event delegation usando el helper onClick de la clase base
    this.onClick(".item-card", (e, card) => {
      const itemId = card.dataset.itemId;
      console.log("Item clicked:", itemId);
    });
  }

  renderItem(item) {
    const displayName = item.label || item.name;
    const iconUrl = getAssetUrl(item.icon) || item.icon;
    return `
      <div class="item-card" data-item-id="${item.id}">
        <img
          class="item-card__image lazy"
          data-src="${iconUrl}"
          alt="${displayName}"
          width="64"
          height="64"
        />
        <div class="item-card__info">
          <h3 class="item-card__name">${displayName}</h3>
          <p class="item-card__price">${item.price}g</p>
        </div>
      </div>
    `;
  }
}
