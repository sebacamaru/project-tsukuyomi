import { store } from "../core/Store.js";
import { getAuthHeaders } from "./authService.js";

const API_BASE = "/api";

/**
 * Servicio de huevos
 */
export const eggService = {
  /**
   * Carga los tipos de huevos (catálogo)
   */
  async getEggTypes() {
    try {
      const response = await fetch(`${API_BASE}/egg-types`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch egg types");

      const data = await response.json();
      store.eggTypes = data;
      return data;
    } catch (error) {
      console.error("Error loading egg types:", error);
      return store.eggTypes || [];
    }
  },

  /**
   * Carga los huevos del usuario
   */
  async getUserEggs(status = null) {
    if (!store.user?.id) return [];

    try {
      let url = `${API_BASE}/users/${store.user.id}/eggs`;
      if (status) url += `?status=${status}`;

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch user eggs");

      const data = await response.json();
      store.eggs = data;
      return data;
    } catch (error) {
      console.error("Error loading user eggs:", error);
      return store.eggs || [];
    }
  },

  /**
   * Inicia la incubación de un huevo
   */
  async startIncubation(eggUuid, careParams = {}) {
    try {
      const response = await fetch(
        `${API_BASE}/users/${store.user.id}/eggs/${eggUuid}/incubate`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ careParams }),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        await this.getUserEggs();
        return { success: true, egg: data.egg };
      }

      return { success: false, error: data.error };
    } catch (error) {
      console.error("Error starting incubation:", error);
      return { success: false, error: "Error de conexión" };
    }
  },

  /**
   * Actualiza parámetros de cuidado de un huevo
   */
  async updateCareParams(eggUuid, careParams) {
    try {
      const response = await fetch(
        `${API_BASE}/users/${store.user.id}/eggs/${eggUuid}/care`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ careParams }),
        },
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating care params:", error);
      return { success: false, error: "Error de conexión" };
    }
  },

  /**
   * Eclosiona un huevo
   */
  async hatchEgg(eggUuid) {
    try {
      const response = await fetch(
        `${API_BASE}/users/${store.user.id}/eggs/${eggUuid}/hatch`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        await this.getUserEggs();
        return { success: true, egg: data.egg, chigo: data.chigo };
      }

      return { success: false, error: data.error };
    } catch (error) {
      console.error("Error hatching egg:", error);
      return { success: false, error: "Error de conexión" };
    }
  },

  /**
   * Obtiene huevos en inventario
   */
  getInventoryEggs() {
    return (store.eggs || []).filter((egg) => egg.status === "inventory");
  },

  /**
   * Obtiene huevos incubando
   */
  getIncubatingEggs() {
    return (store.eggs || []).filter((egg) => egg.status === "incubating");
  },
};
