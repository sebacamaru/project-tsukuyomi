import { redis } from "../core/redis.js";
import { logCache, logError } from "../utils/logger.js";

/**
 * Cache service usando Redis
 */
export const cache = {
  /**
   * Obtener un valor del cache
   * @param {string} key - Clave
   * @returns {Promise<any|null>}
   */
  async get(key) {
    try {
      const value = await redis.get(key);
      const hit = value !== null;
      logCache("get", key, hit);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logError("Cache GET", error, { key });
      return null;
    }
  },

  /**
   * Guardar un valor en el cache
   * @param {string} key - Clave
   * @param {any} value - Valor
   * @param {number} ttl - Time to live en segundos (default: 300 = 5 min)
   */
  async set(key, value, ttl = 300) {
    try {
      await redis.setEx(key, ttl, JSON.stringify(value));
      logCache("set", key);
      return true;
    } catch (error) {
      logError("Cache SET", error, { key, ttl });
      return false;
    }
  },

  /**
   * Eliminar una clave del cache
   * @param {string} key - Clave
   */
  async delete(key) {
    try {
      await redis.del(key);
      logCache("delete", key);
      return true;
    } catch (error) {
      logError("Cache DELETE", error, { key });
      return false;
    }
  },

  /**
   * Eliminar múltiples claves que coincidan con un patrón
   * @param {string} pattern - Patrón (ej: "user:*")
   */
  async deletePattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
        logCache("delete_pattern", pattern);
      }
      return true;
    } catch (error) {
      logError("Cache DELETE_PATTERN", error, { pattern });
      return false;
    }
  },

  /**
   * Verificar si existe una clave
   * @param {string} key - Clave
   */
  async exists(key) {
    try {
      const result = await redis.exists(key);
      logCache("exists", key, result === 1);
      return result === 1;
    } catch (error) {
      logError("Cache EXISTS", error, { key });
      return false;
    }
  },
};
