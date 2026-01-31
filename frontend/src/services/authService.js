import { store } from "../core/Store.js";
import { app } from "../main.js";
import { eggService } from "./eggService.js";
import { candyService } from "./candyService.js";
import { stoneService } from "./stoneService.js";
import { chigoService } from "./chigoService.js";

const API_BASE = "/auth";
const STORAGE_KEY = "tsukuyomi_auth";

/**
 * Carga todo el inventario del usuario
 */
async function loadFullInventory() {
  await Promise.all([
    eggService.getUserEggs(),
    candyService.getUserCandies(),
    stoneService.getUserStones(),
    chigoService.getUserChigos(),
  ]);
}

/**
 * Servicio de autenticación
 * Maneja login, registro, logout y persistencia de sesión
 */
export const authService = {
  /**
   * Login con email y password
   * @returns {{ success: boolean, error?: string }}
   */
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "Error al iniciar sesión",
        };
      }

      this._saveSession(data.token, data.user);

      // Cargar inventario después de login
      await loadFullInventory();

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Error de conexión" };
    }
  },

  /**
   * Registro de nuevo usuario
   * @returns {{ success: boolean, error?: string }}
   */
  async register(email, password) {
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Error al registrarse" };
      }

      this._saveSession(data.token, data.user);

      // Cargar inventario después de registro
      await loadFullInventory();

      return { success: true };
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: "Error de conexión" };
    }
  },

  /**
   * Cerrar sesión
   */
  logout() {
    store.token = null;
    store.user = null;
    store.gold = 0;
    store.eggs = [];
    store.candies = [];
    store.stones = [];
    store.chigos = [];
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Restaurar sesión desde localStorage
   * Llamar al iniciar la app
   */
  restoreSession() {
    // Modo maquetación: auto-login sin backend
    if (import.meta.env.MODE === "mock") {
      store.user = {
        id: 1,
        username: "dev_user",
        email: "dev@mock.local",
        gold: 1000,
        current_quest_code: "set_username",
        next_quest_available_at: null,
      };
      store.token = "mock-token";
      console.log("[Mock] Modo maquetación activo");
      return;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const { token, user } = JSON.parse(saved);
      if (token && user) {
        store.token = token;
        store.user = user;

        // Cargar inventario al restaurar sesión
        loadFullInventory();
      }
    } catch (error) {
      console.error("Error restoring session:", error);
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  /**
   * Verificar si hay sesión activa
   */
  isAuthenticated() {
    return !!store.token && !!store.user;
  },

  /**
   * Actualiza los datos del usuario en localStorage
   * Llamar después de modificar store.user
   */
  updateSession() {
    if (store.token && store.user) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ token: store.token, user: store.user }),
      );
    }
  },

  /**
   * Obtener el token actual
   */
  getToken() {
    return store.token;
  },

  /**
   * Guardar sesión en store y localStorage
   */
  _saveSession(token, user) {
    store.token = token;
    store.user = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));

    // Actualizar badge del profesor después de guardar sesión
    if (app) {
      app.updateProfessorBadge();
    }
  },
};

/**
 * Helper para obtener headers de autorización
 * Usar en otros servicios para requests autenticadas
 */
export function getAuthHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (store.token) {
    headers["Authorization"] = `Bearer ${store.token}`;
  }
  return headers;
}
