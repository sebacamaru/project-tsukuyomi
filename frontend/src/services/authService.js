import { store } from "../core/Store.js";
import { app } from "../main.js";

const API_BASE = "/auth";
const STORAGE_KEY = "tsukuyomi_auth";

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
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Restaurar sesión desde localStorage
   * Llamar al iniciar la app
   */
  restoreSession() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const { token, user } = JSON.parse(saved);
      if (token && user) {
        store.token = token;
        store.user = user;
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
