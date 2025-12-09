import marketHTML from "../ui/scenes/marketplace/marketplace.html?raw";
import "../ui/scenes/marketplace/marketplace.css";
import { Scene } from "../core/Scene.js";
import { marketplaceService } from "../services/marketplaceService.js";
import { ItemCard } from "../ui/components/ItemCard/ItemCard.js";

export class MarketplaceScene extends Scene {
  async getHTML() {
    return marketHTML;
  }

  async initUI() {
    console.warn("initUI");
    // 🎬 SIMULACIÓN: Delay de 5 segundos para ver el loading indicator
    // await new Promise((resolve) => setTimeout(resolve, 500));

    // Cargar items del servicio
    const items = await marketplaceService.getItems();
    const container = document.getElementById("marketItems");

    // Renderizar usando el componente ItemCard
    container.innerHTML = items
      .map((item) => ItemCard.renderHTML(item))
      .join("");

    // Event delegation usando el helper onClick de la clase base
    this.onClick(".item-card", (e, card) => {
      const itemId = card.dataset.itemId;
      console.log("Item clicked:", itemId);
      // Aquí podrías abrir un modal, navegar a detalle, etc.
    });

    // Nota: initLazyImages se llama automáticamente en Scene.onEnter()
  }
}
