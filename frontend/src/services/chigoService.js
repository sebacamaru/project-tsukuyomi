import { store } from "../core/Store.js";
import { getAuthHeaders } from "./authService.js";

const API_BASE = "/api";

/**
 * Servicio de chigos
 */
export const chigoService = {
  /**
   * Carga las especies de chigos (catálogo)
   */
  async getChigoSpecies() {
    try {
      const response = await fetch(`${API_BASE}/chigo-species`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch chigo species");

      const data = await response.json();
      store.chigoSpecies = data;
      return data;
    } catch (error) {
      console.error("Error loading chigo species:", error);
      return store.chigoSpecies || [];
    }
  },

  /**
   * Carga los chigos del usuario
   */
  async getUserChigos() {
    if (!store.user?.id) return [];

    try {
      const response = await fetch(
        `${API_BASE}/users/${store.user.id}/chigos`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) throw new Error("Failed to fetch user chigos");

      const data = await response.json();
      store.chigos = data;
      return data;
    } catch (error) {
      console.error("Error loading user chigos:", error);
      return store.chigos || [];
    }
  },

  /**
   * Obtiene un chigo por UUID
   */
  async getChigo(uuid) {
    try {
      const response = await fetch(
        `${API_BASE}/users/${store.user.id}/chigos/${uuid}`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) throw new Error("Failed to fetch chigo");

      return await response.json();
    } catch (error) {
      console.error("Error fetching chigo:", error);
      return null;
    }
  },

  /**
   * Cambia el nickname de un chigo
   */
  async setNickname(uuid, nickname) {
    try {
      const response = await fetch(
        `${API_BASE}/users/${store.user.id}/chigos/${uuid}/nickname`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ nickname }),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        await this.getUserChigos();
        return { success: true };
      }

      return { success: false, error: data.error };
    } catch (error) {
      console.error("Error setting nickname:", error);
      return { success: false, error: "Error de conexión" };
    }
  },

  /**
   * Libera un chigo
   */
  async releaseChigo(uuid) {
    try {
      const response = await fetch(
        `${API_BASE}/users/${store.user.id}/chigos/${uuid}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        await this.getUserChigos();
        return { success: true };
      }

      return { success: false, error: data.error };
    } catch (error) {
      console.error("Error releasing chigo:", error);
      return { success: false, error: "Error de conexión" };
    }
  },

  /**
   * Obtiene las piedras equipadas de un chigo
   */
  async getChigoStones(chigoId) {
    try {
      const response = await fetch(
        `${API_BASE}/users/${store.user.id}/chigos/${chigoId}/stones`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) throw new Error("Failed to fetch chigo stones");

      return await response.json();
    } catch (error) {
      console.error("Error fetching chigo stones:", error);
      return [];
    }
  },

  /**
   * Cuenta los chigos del usuario
   */
  getChigoCount() {
    return (store.chigos || []).length;
  },

  /**
   * Obtiene un chigo local por UUID
   */
  getLocalChigo(uuid) {
    return (store.chigos || []).find((c) => c.uuid === uuid);
  },
};
