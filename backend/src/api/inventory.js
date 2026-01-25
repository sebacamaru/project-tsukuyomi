import { asyncHandler } from "../utils/errorHandler.js";
import { cache } from "../services/cache.js";
import { getUserGold } from "../db/schema/users.js";
import { getUserEggs } from "../db/schema/eggs.js";
import { getUserCandies } from "../db/schema/candies.js";
import { getUserStones } from "../db/schema/stones.js";
import { getUserChigos, getChigoStones } from "../db/schema/chigos.js";

export function registerInventory(router) {
  // GET /api/users/:userId/inventory - Obtener inventario completo del usuario
  // Retorna: { eggs, candies, stones, chigos, gold }
  router.get(
    "/api/users/:userId/inventory",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);

      // Cache key por usuario
      const cacheKey = `inventory:${userId}`;
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      // Obtener todos los datos del usuario
      const gold = getUserGold(userId);
      const eggs = getUserEggs(userId);
      const candies = getUserCandies(userId);
      const stones = getUserStones(userId);
      const chigos = getUserChigos(userId).map((chigo) => ({
        ...chigo,
        stones: getChigoStones(chigo.id),
      }));

      const result = {
        gold,
        eggs,
        candies,
        stones,
        chigos,
      };

      await cache.set(cacheKey, result, 60); // Cache 1 minuto

      return result;
    }),
  );
}
