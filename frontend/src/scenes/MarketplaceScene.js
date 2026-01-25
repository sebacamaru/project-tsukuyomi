import marketHTML from "../ui/scenes/marketplace/marketplace.html?raw";
import "../ui/scenes/marketplace/marketplace.css";
import { Scene } from "../core/Scene.js";
import { store } from "../core/Store.js";
import { marketplaceService } from "../services/marketplaceService.js";
import { getAssetUrl } from "../utils/assetRegistry.js";

export class MarketplaceScene extends Scene {
  constructor() {
    super();
    this.candies = [];
    this.stones = [];
  }

  async getHTML() {
    return marketHTML;
  }

  async initUI() {
    await this.loadItems();
    this.updateGold();
    this.setupEventListeners();
  }

  async loadItems() {
    const { candies, stones } = await marketplaceService.getAllBuyableItems();
    this.candies = candies || [];
    this.stones = stones || [];

    this.renderItems();
  }

  renderItems() {
    const container = this.$("#marketItems");

    let html = "";

    // Sección de caramelos
    if (this.candies.length > 0) {
      html += `
        <section class="marketplace__section">
          <h2 class="marketplace__section-title">Caramelos</h2>
          <div class="marketplace__grid">
            ${this.candies.map((item) => this.renderItem(item, "candy")).join("")}
          </div>
        </section>
      `;
    }

    // Sección de piedras
    if (this.stones.length > 0) {
      html += `
        <section class="marketplace__section">
          <h2 class="marketplace__section-title">Piedras Elementales</h2>
          <div class="marketplace__grid">
            ${this.stones.map((item) => this.renderItem(item, "stone")).join("")}
          </div>
        </section>
      `;
    }

    if (!html) {
      html = '<p class="marketplace__empty">No hay items disponibles</p>';
    }

    container.innerHTML = html;
    this.initLazyImages();
  }

  setupEventListeners() {
    this.onClick(".item-card__buy-btn", async (e, btn) => {
      const card = btn.closest(".item-card");
      const itemId = parseInt(card.dataset.itemId);
      const itemType = card.dataset.itemType;
      await this.handleBuy(itemId, itemType, btn);
    });
  }

  async handleBuy(itemId, itemType, btn) {
    btn.disabled = true;
    btn.textContent = "Comprando...";

    let result;
    if (itemType === "candy") {
      result = await marketplaceService.buyCandy(itemId, 1);
    } else if (itemType === "stone") {
      result = await marketplaceService.buyStone(itemId, 1);
    }

    if (result?.success) {
      this.updateGold();
      this.showMessage("Compra exitosa!", "success");
      btn.disabled = false;
      btn.textContent = "Comprar";
    } else {
      this.showMessage(result?.error || "Error al comprar", "error");
      btn.disabled = false;
      btn.textContent = "Comprar";
    }
  }

  updateGold() {
    const goldEl = this.$("#goldAmount");
    if (goldEl) {
      goldEl.textContent = store.gold.toLocaleString();
    }
  }

  initLazyImages() {
    const images = this.root.querySelectorAll(".item-card__image.lazy");
    images.forEach((img) => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.classList.remove("lazy");
      }
    });
  }

  renderItem(item, type) {
    const displayName = item.label || item.name;
    const iconUrl = getAssetUrl(item.icon) || item.icon;
    const description = item.description || "";

    return `
      <div class="item-card" data-item-id="${item.id}" data-item-type="${type}">
        <img
          class="item-card__image lazy"
          data-src="${iconUrl}"
          alt="${displayName}"
          width="64"
          height="64"
        />
        <div class="item-card__info">
          <h3 class="item-card__name">${displayName}</h3>
          ${description ? `<p class="item-card__description">${description}</p>` : ""}
          <p class="item-card__price">${item.price}g</p>
        </div>
        <button class="item-card__buy-btn button button--small">
          Comprar
        </button>
      </div>
    `;
  }

  showMessage(text, type) {
    console.log(`[${type}] ${text}`);
  }
}
