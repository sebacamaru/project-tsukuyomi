import { store } from "../core/Store.js";
import { getAuthHeaders } from "./authService.js";

const API_BASE = "/api";

/**
 * Servicio de piedras (habilidades elementales)
 */
export const stoneService = {
  /**
   * Carga los tipos de piedras (catálogo)
   */
  async getStoneTypes() {
    try {
      const response = await fetch(`${API_BASE}/stone-types`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch stone types");

      const data = await response.json();
      store.stoneTypes = data;
      return data;
    } catch (error) {
      console.error("Error loading stone types:", error);
      return store.stoneTypes || [];
    }
  },

  /**
   * Carga las piedras comprables
   */
  async getBuyableStoneTypes() {
    try {
      const response = await fetch(`${API_BASE}/stone-types/buyable`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch buyable stone types");

      return await response.json();
    } catch (error) {
      console.error("Error loading buyable stone types:", error);
      return [];
    }
  },

  /**
   * Carga las piedras del usuario
   */
  async getUserStones() {
    if (!store.user?.id) return [];

    try {
      const response = await fetch(
        `${API_BASE}/users/${store.user.id}/stones`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) throw new Error("Failed to fetch user stones");

      const data = await response.json();
      store.stones = data;
      return data;
    } catch (error) {
      console.error("Error loading user stones:", error);
      return store.stones || [];
    }
  },

  /**
   * Compra piedras
   */
  async buyStone(stoneTypeId, quantity = 1) {
    try {
      const response = await fetch(`${API_BASE}/marketplace/buy-stone`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          userId: store.user.id,
          stoneTypeId,
          quantity,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        store.gold = data.newGold;
        await this.getUserStones();
        return { success: true, ...data };
      }

      return { success: false, error: data.error };
    } catch (error) {
      console.error("Error buying stone:", error);
      return { success: false, error: "Error de conexión" };
    }
  },

  /**
   * Equipa una piedra a un chigo (permanente)
   */
  async equipStone(stoneTypeId, chigoId) {
    try {
      const response = await fetch(
        `${API_BASE}/users/${store.user.id}/stones/equip`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ stoneTypeId, chigoId }),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        await this.getUserStones();
        return { success: true, ...data };
      }

      return { success: false, error: data.error };
    } catch (error) {
      console.error("Error equipping stone:", error);
      return { success: false, error: "Error de conexión" };
    }
  },

  /**
   * Obtiene la cantidad de una piedra específica
   */
  getStoneQuantity(stoneTypeId) {
    const stone = (store.stones || []).find(
      (s) => s.stone_type_id === stoneTypeId,
    );
    return stone ? stone.quantity : 0;
  },

  /**
   * Verifica si tiene piedras de un tipo
   */
  hasStone(stoneTypeId) {
    return this.getStoneQuantity(stoneTypeId) > 0;
  },
};
