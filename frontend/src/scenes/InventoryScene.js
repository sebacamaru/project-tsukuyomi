import inventoryHTML from "../ui/scenes/inventory/inventory.html?raw";
import "../ui/scenes/inventory/inventory.css";
import { Scene } from "../core/Scene.js";
import { store } from "../core/Store.js";
import { inventoryService } from "../services/inventoryService.js";
import { ItemGrid } from "../ui/components/ItemGrid/ItemGrid.js";

export class InventoryScene extends Scene {
  constructor() {
    super();
    this.itemGrid = null;
  }

  async getHTML() {
    return inventoryHTML;
  }

  async initUI() {
    await inventoryService.loadInventory();
    this.updateGold();

    // Crear ItemGrid
    this.itemGrid = new ItemGrid({
      container: this.$("#inventoryItems"),
      items: store.inventory,
      showQuantity: true,
      emptyElement: this.$("#emptyMessage"),
      lazyLoadRoot: this.root,
    });

    this.itemGrid.render();

    // Tabs de filtro
    this.onClick(".tab", (e, tab) => {
      this.$$(".tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      this.itemGrid.filter(tab.dataset.type);
    });
  }

  updateGold() {
    const goldEl = this.$("#goldAmount");
    if (goldEl) {
      goldEl.textContent = store.gold.toLocaleString();
    }
  }

  onExit() {
    // Cleanup ItemGrid
    if (this.itemGrid) {
      this.itemGrid.destroy();
      this.itemGrid = null;
    }

    super.onExit();
  }
}
