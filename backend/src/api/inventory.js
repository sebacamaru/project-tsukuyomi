import { asyncHandler } from "../utils/errorHandler.js";
import { cache } from "../services/cache.js";
import {
  getUserInventory,
  addItemToInventory,
  removeItemFromInventory,
  getUserGold,
  getItemById,
} from "../db/schema/inventory.js";

export function registerInventory(router) {
  // GET /api/users/:userId/inventory - Obtener inventario del usuario
  router.get(
    "/api/users/:userId/inventory",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);

      // Cache key por usuario
      const cacheKey = `inventory:${userId}`;
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const inventory = getUserInventory(userId);
      const gold = getUserGold(userId);

      const result = { inventory, gold };
      await cache.set(cacheKey, result, 60); // Cache 1 minuto

      return result;
    }),
  );

  // POST /api/users/:userId/inventory/add - Agregar item (interno/recompensas)
  router.post(
    "/api/users/:userId/inventory/add",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);
      const { itemId, quantity = 1 } = ctx.body;

      if (!itemId) {
        ctx.set.status = 400;
        return { error: "itemId is required" };
      }

      const item = getItemById(itemId);
      if (!item) {
        ctx.set.status = 404;
        return { error: "Item not found" };
      }

      const result = addItemToInventory(userId, itemId, quantity);

      // Invalidar cache
      await cache.delete(`inventory:${userId}`);

      return {
        success: true,
        item: { ...item, quantity: result.newQuantity },
      };
    }),
  );

  // POST /api/users/:userId/inventory/remove - Remover item
  router.post(
    "/api/users/:userId/inventory/remove",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);
      const { itemId, quantity = 1 } = ctx.body;

      if (!itemId) {
        ctx.set.status = 400;
        return { error: "itemId is required" };
      }

      const result = removeItemFromInventory(userId, itemId, quantity);

      if (!result.success) {
        ctx.set.status = 400;
        return { error: result.error };
      }

      await cache.delete(`inventory:${userId}`);
      return result;
    }),
  );
}
