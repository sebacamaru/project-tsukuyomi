import inventoryHTML from "../ui/scenes/inventory/inventory.html?raw";
import "../ui/scenes/inventory/inventory.css";
import { Scene } from "../core/Scene.js";
import { store } from "../core/Store.js";
import { eggService } from "../services/eggService.js";
import { candyService } from "../services/candyService.js";
import { stoneService } from "../services/stoneService.js";
import { chigoService } from "../services/chigoService.js";
import { ItemGrid } from "../ui/components/ItemGrid/ItemGrid.js";

export class InventoryScene extends Scene {
  constructor() {
    super();
    this.itemGrid = null;
    this.allItems = [];
  }

  async getHTML() {
    return inventoryHTML;
  }

  async initUI() {
    await this.loadInventory();
    this.updateGold();

    // Normalizar items para ItemGrid
    this.allItems = this.normalizeInventory();

    // Crear ItemGrid
    this.itemGrid = new ItemGrid({
      container: this.$("#inventoryItems"),
      items: this.allItems,
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

  async loadInventory() {
    await Promise.all([
      eggService.getUserEggs(),
      candyService.getUserCandies(),
      stoneService.getUserStones(),
      chigoService.getUserChigos(),
    ]);
  }

  normalizeInventory() {
    const items = [];

    // Huevos (solo los que están en inventario, no incubando)
    const eggs = (store.eggs || []).filter((e) => e.status === "inventory");
    eggs.forEach((egg) => {
      items.push({
        id: egg.id,
        uuid: egg.uuid,
        type: "egg",
        name: egg.type_name,
        label: egg.type_label || egg.type_name,
        description: egg.type_description || "Un huevo misterioso",
        icon: egg.icon,
        quantity: 1,
        price: 0,
        _original: egg,
      });
    });

    // Caramelos
    (store.candies || []).forEach((candy) => {
      if (candy.quantity > 0) {
        items.push({
          id: candy.candy_type_id,
          type: "candy",
          name: candy.name,
          label: candy.label || candy.name,
          description: candy.description || "Un caramelo para tu chigo",
          icon: candy.icon,
          quantity: candy.quantity,
          price: candy.price || 0,
          _original: candy,
        });
      }
    });

    // Piedras
    (store.stones || []).forEach((stone) => {
      if (stone.quantity > 0) {
        items.push({
          id: stone.stone_type_id,
          type: "stone",
          name: stone.name,
          label: stone.label || stone.name,
          description: stone.description || "Una piedra elemental",
          icon: stone.icon,
          quantity: stone.quantity,
          price: stone.price || 0,
          _original: stone,
        });
      }
    });

    // Chigos
    (store.chigos || []).forEach((chigo) => {
      items.push({
        id: chigo.id,
        uuid: chigo.uuid,
        type: "chigo",
        name: chigo.species_name,
        label: chigo.nickname || chigo.species_label || chigo.species_name,
        description: `Lv.${chigo.level || 1} - HP:${chigo.hp} ATK:${chigo.atk} DEF:${chigo.def} SPD:${chigo.spd}`,
        icon: chigo.icon,
        quantity: 1,
        price: 0,
        _original: chigo,
      });
    });

    return items;
  }

  updateGold() {
    const goldEl = this.$("#goldAmount");
    if (goldEl) {
      goldEl.textContent = store.gold.toLocaleString();
    }
  }

  onExit() {
    if (this.itemGrid) {
      this.itemGrid.destroy();
      this.itemGrid = null;
    }

    super.onExit();
  }
}
