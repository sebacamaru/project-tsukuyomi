import { getAuthHeaders } from "./authService.js";

const API_BASE = "/api/admin";

export const adminService = {
  // ==================== USUARIOS ====================

  async getUsers() {
    const response = await fetch(`${API_BASE}/users`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // ==================== QUESTS ====================

  async getQuests() {
    const response = await fetch(`${API_BASE}/quests`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

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

  // ==================== EGG TYPES ====================

  async getEggTypes() {
    const response = await fetch(`${API_BASE}/egg-types`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  async createEggType(data) {
    const response = await fetch(`${API_BASE}/egg-types`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return { success: true, ...(await response.json()) };
    }

    const error = await response.json();
    return { success: false, error: error.error };
  },

  async updateEggType(id, data) {
    const response = await fetch(`${API_BASE}/egg-types/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return { success: true, ...(await response.json()) };
    }

    const error = await response.json();
    return { success: false, error: error.error };
  },

  async deleteEggType(id) {
    const response = await fetch(`${API_BASE}/egg-types/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      return { success: true, ...(await response.json()) };
    }

    const error = await response.json();
    return { success: false, error: error.error };
  },

  async giveEggToUser(userId, eggTypeId) {
    const response = await fetch(`${API_BASE}/users/${userId}/give-egg`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ eggTypeId }),
    });

    if (response.ok) {
      return { success: true, ...(await response.json()) };
    }

    const error = await response.json();
    return { success: false, error: error.error };
  },

  // ==================== CANDY TYPES ====================

  async getCandyTypes() {
    const response = await fetch(`${API_BASE}/candy-types`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  async createCandyType(data) {
    const response = await fetch(`${API_BASE}/candy-types`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return { success: true, ...(await response.json()) };
    }

    const error = await response.json();
    return { success: false, error: error.error };
  },

  async updateCandyType(id, data) {
    const response = await fetch(`${API_BASE}/candy-types/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return { success: true, ...(await response.json()) };
    }

    const error = await response.json();
    return { success: false, error: error.error };
  },

  async deleteCandyType(id) {
    const response = await fetch(`${API_BASE}/candy-types/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      return { success: true, ...(await response.json()) };
    }

    const error = await response.json();
    return { success: false, error: error.error };
  },

  async giveCandyToUser(userId, candyTypeId, quantity = 1) {
    const response = await fetch(`${API_BASE}/users/${userId}/give-candy`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ candyTypeId, quantity }),
    });

    if (response.ok) {
      return { success: true, ...(await response.json()) };
    }

    const error = await response.json();
    return { success: false, error: error.error };
  },

  // ==================== STONE TYPES ====================

  async getStoneTypes() {
    const response = await fetch(`${API_BASE}/stone-types`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  async createStoneType(data) {
    const response = await fetch(`${API_BASE}/stone-types`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return { success: true, ...(await response.json()) };
    }

    const error = await response.json();
    return { success: false, error: error.error };
  },

  async updateStoneType(id, data) {
    const response = await fetch(`${API_BASE}/stone-types/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return { success: true, ...(await response.json()) };
    }

    const error = await response.json();
    return { success: false, error: error.error };
  },

  async deleteStoneType(id) {
    const response = await fetch(`${API_BASE}/stone-types/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      return { success: true, ...(await response.json()) };
    }

    const error = await response.json();
    return { success: false, error: error.error };
  },

  async giveStoneToUser(userId, stoneTypeId, quantity = 1) {
    const response = await fetch(`${API_BASE}/users/${userId}/give-stone`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ stoneTypeId, quantity }),
    });

    if (response.ok) {
      return { success: true, ...(await response.json()) };
    }

    const error = await response.json();
    return { success: false, error: error.error };
  },

  // ==================== CHIGO SPECIES ====================

  async getChigoSpecies() {
    const response = await fetch(`${API_BASE}/chigo-species`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  async createSpecies(data) {
    const response = await fetch(`${API_BASE}/chigo-species`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return { success: true, ...(await response.json()) };
    }

    const error = await response.json();
    return { success: false, error: error.error };
  },

  async updateSpecies(id, data) {
    const response = await fetch(`${API_BASE}/chigo-species/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return { success: true, ...(await response.json()) };
    }

    const error = await response.json();
    return { success: false, error: error.error };
  },

  async deleteSpecies(id) {
    const response = await fetch(`${API_BASE}/chigo-species/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      return { success: true, ...(await response.json()) };
    }

    const error = await response.json();
    return { success: false, error: error.error };
  },
};
