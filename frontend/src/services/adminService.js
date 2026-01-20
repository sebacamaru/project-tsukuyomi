import { getAuthHeaders } from "./authService.js";

const API_BASE = "/api/admin";

export const adminService = {
  /**
   * Obtiene todos los usuarios
   */
  async getUsers() {
    const response = await fetch(`${API_BASE}/users`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Obtiene todas las quests
   */
  async getQuests() {
    const response = await fetch(`${API_BASE}/quests`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Resetea la quest de un usuario
   * @param {number} userId - ID del usuario
   * @param {string|null} questCode - Código de la quest o null para completar todas
   */
  async resetQuest(userId, questCode) {
    const response = await fetch(`${API_BASE}/reset-quest`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, questCode }),
    });

    if (response.ok) {
      return { success: true, ...(await response.json()) };
    }

    const error = await response.json();
    return { success: false, error: error.error };
  },
};
