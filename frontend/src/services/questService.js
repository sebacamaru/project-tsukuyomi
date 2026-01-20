import { getAuthHeaders } from "./authService.js";

const API_BASE = "/api";

export const questService = {
  /**
   * Obtiene todas las quests disponibles
   */
  async getQuests() {
    const response = await fetch(`${API_BASE}/quests`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Obtiene una quest por su código
   */
  async getQuest(code) {
    const response = await fetch(`${API_BASE}/quests/${code}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Verifica si un username está disponible
   * @param {string} username - Username a verificar
   * @param {number} excludeUserId - ID del usuario a excluir (para permitir su propio username)
   */
  async checkUsername(username, excludeUserId = null) {
    let url = `${API_BASE}/users/check-username/${encodeURIComponent(username)}`;
    if (excludeUserId) {
      url += `?excludeUserId=${excludeUserId}`;
    }
    const response = await fetch(url, { headers: getAuthHeaders() });
    const data = await response.json();
    return data.available;
  },

  /**
   * Establece el username de un usuario
   */
  async setUsername(userId, username) {
    const response = await fetch(`${API_BASE}/users/${userId}/username`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ username }),
    });

    if (response.ok) {
      return { success: true, user: await response.json() };
    }

    const error = await response.json();
    return { success: false, error: error.error };
  },

  /**
   * Completa la quest actual del usuario
   * @param {number} userId - ID del usuario
   * @param {number} delayMinutes - Minutos de delay para la siguiente quest (0 = sin delay)
   */
  async completeQuest(userId, delayMinutes = 0) {
    const response = await fetch(`${API_BASE}/users/${userId}/complete-quest`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ delayMinutes }),
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, ...data };
    }

    const error = await response.json();
    return { success: false, error: error.error };
  },

  /**
   * Obtiene los datos de un usuario
   */
  async getUser(userId) {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};
