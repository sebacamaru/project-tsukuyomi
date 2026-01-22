import { store } from "../core/Store.js";
import { getAuthHeaders } from "./authService.js";

const API_BASE = "/api";

/**
 * Servicio de inventario
 * Maneja la sincronización del inventario con el servidor
 */
export const inventoryService = {
  /**
   * Carga el inventario del usuario desde el servidor
   */
  async loadInventory() {
    if (!store.user?.id) {
      return { inventory: [], gold: 0 };
    }

    try {
      const response = await fetch(
        `${API_BASE}/users/${store.user.id}/inventory`,
        { headers: getAuthHeaders() },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch inventory");
      }

      const data = await response.json();

      // Sincronizar con store
      store.inventory = data.inventory;
      store.gold = data.gold;

      return data;
    } catch (error) {
      console.error("Error loading inventory:", error);
      return { inventory: store.inventory, gold: store.gold };
    }
  },

  /**
   * Compra un item del marketplace
   */
  async buyItem(itemId, quantity = 1) {
    try {
      const response = await fetch(`${API_BASE}/marketplace/buy`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          userId: store.user.id,
          itemId,
          quantity,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Actualizar store local
        store.gold = data.newGold;
        await this.loadInventory(); // Recargar inventario completo
        return { success: true, ...data };
      }

      return { success: false, error: data.error };
    } catch (error) {
      console.error("Error buying item:", error);
      return { success: false, error: "Error de conexión" };
    }
  },

  /**
   * Obtiene items del inventario por tipo
   */
  getItemsByType(type) {
    return store.inventory.filter((item) => item.type === type);
  },

  /**
   * Verifica si el usuario tiene un item específico
   */
  hasItem(itemId) {
    return store.inventory.some(
      (item) => item.item_id === itemId && item.quantity > 0,
    );
  },

  /**
   * Obtiene la cantidad de un item en el inventario
   */
  getItemQuantity(itemId) {
    const item = store.inventory.find((item) => item.item_id === itemId);
    return item ? item.quantity : 0;
  },
};
