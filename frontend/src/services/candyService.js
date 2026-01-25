import { store } from "../core/Store.js";
import { getAuthHeaders } from "./authService.js";

const API_BASE = "/api";

/**
 * Servicio de caramelos
 */
export const candyService = {
  /**
   * Carga los tipos de caramelos (catálogo)
   */
  async getCandyTypes() {
    try {
      const response = await fetch(`${API_BASE}/candy-types`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch candy types");

      const data = await response.json();
      store.candyTypes = data;
      return data;
    } catch (error) {
      console.error("Error loading candy types:", error);
      return store.candyTypes || [];
    }
  },

  /**
   * Carga los caramelos comprables
   */
  async getBuyableCandyTypes() {
    try {
      const response = await fetch(`${API_BASE}/candy-types/buyable`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch buyable candy types");

      return await response.json();
    } catch (error) {
      console.error("Error loading buyable candy types:", error);
      return [];
    }
  },

  /**
   * Carga los caramelos del usuario
   */
  async getUserCandies() {
    if (!store.user?.id) return [];

    try {
      const response = await fetch(
        `${API_BASE}/users/${store.user.id}/candies`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) throw new Error("Failed to fetch user candies");

      const data = await response.json();
      store.candies = data;
      return data;
    } catch (error) {
      console.error("Error loading user candies:", error);
      return store.candies || [];
    }
  },

  /**
   * Compra caramelos
   */
  async buyCandy(candyTypeId, quantity = 1) {
    try {
      const response = await fetch(`${API_BASE}/marketplace/buy-candy`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          userId: store.user.id,
          candyTypeId,
          quantity,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        store.gold = data.newGold;
        await this.getUserCandies();
        return { success: true, ...data };
      }

      return { success: false, error: data.error };
    } catch (error) {
      console.error("Error buying candy:", error);
      return { success: false, error: "Error de conexión" };
    }
  },

  /**
   * Usa un caramelo en un chigo
   */
  async useCandy(candyTypeId, chigoId) {
    try {
      const response = await fetch(
        `${API_BASE}/users/${store.user.id}/candies/use`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ candyTypeId, chigoId }),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        await this.getUserCandies();
        return { success: true, ...data };
      }

      return { success: false, error: data.error };
    } catch (error) {
      console.error("Error using candy:", error);
      return { success: false, error: "Error de conexión" };
    }
  },

  /**
   * Obtiene la cantidad de un caramelo específico
   */
  getCandyQuantity(candyTypeId) {
    const candy = (store.candies || []).find(
      (c) => c.candy_type_id === candyTypeId,
    );
    return candy ? candy.quantity : 0;
  },

  /**
   * Verifica si tiene caramelos de un tipo
   */
  hasCandy(candyTypeId) {
    return this.getCandyQuantity(candyTypeId) > 0;
  },
};
