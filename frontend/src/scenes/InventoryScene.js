import inventoryHTML from "../ui/scenes/inventory/inventory.html?raw";
import "../ui/scenes/inventory/inventory.css";
import { Scene } from "../core/Scene.js";
import { store } from "../core/Store.js";
import { inventoryService } from "../services/inventoryService.js";
import { getAssetUrl } from "../utils/assetRegistry.js";
import { initLazyImages } from "../utils/lazyLoader.js";

export class InventoryScene extends Scene {
  async getHTML() {
    return inventoryHTML;
  }

  async initUI() {
    await inventoryService.loadInventory();
    this.updateGold();
    this.renderItems("all");

    // Tabs de filtro
    this.onClick(".tab", (e, tab) => {
      this.$$(".tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      this.renderItems(tab.dataset.type);
    });

    // Click en item
    this.onClick(".inventory-item", (e, card) => {
      const itemId = card.dataset.itemId;
      const item = store.inventory.find((i) => i.item_id === Number(itemId));
      if (item) {
        console.log("Item seleccionado:", item);
      }
    });
  }

  updateGold() {
    const goldEl = this.$("#goldAmount");
    if (goldEl) {
      goldEl.textContent = store.gold.toLocaleString();
    }
  }

  renderItems(type) {
    const container = this.$("#inventoryItems");
    const emptyMessage = this.$("#emptyMessage");

    if (!container) return;

    let items = store.inventory || [];

    // Filtrar por tipo si no es "all"
    if (type !== "all") {
      items = items.filter((item) => item.type === type);
    }

    if (items.length === 0) {
      container.innerHTML = "";
      emptyMessage?.classList.remove("hidden");
      return;
    }

    emptyMessage?.classList.add("hidden");

    container.innerHTML = items.map((item) => this.renderItem(item)).join("");

    // Re-inicializar lazy loading para las nuevas imágenes
    initLazyImages(this.root);
  }

  renderItem(item) {
    const displayName = item.label || item.name;
    const iconUrl = getAssetUrl(item.icon) || item.icon;
    return `
      <div class="item-card inventory-item" data-item-id="${item.item_id}">
        <span class="inventory-item__quantity">${item.quantity}</span>
        <img
          class="item-card__image lazy"
          data-src="${iconUrl}"
          alt="${displayName}"
          width="64"
          height="64"
        />
        <div class="item-card__info">
          <h3 class="item-card__name">${displayName}</h3>
          ${item.description ? `<p class="inventory-item__description">${item.description}</p>` : ""}
        </div>
      </div>
    `;
  }
}
