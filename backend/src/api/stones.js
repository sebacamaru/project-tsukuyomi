import { asyncHandler } from "../utils/errorHandler.js";
import { cache } from "../services/cache.js";
import {
  getAllStoneTypes,
  getStoneTypeById,
  getStoneTypeByName,
  getBuyableStoneTypes,
  getUserStones,
  addStoneToUser,
  removeStoneFromUser,
  hasStone,
} from "../db/schema/stones.js";
import {
  getChigoById,
  equipStone,
  countChigoStones,
  getChigoStones,
} from "../db/schema/chigos.js";
import { getUserGold, modifyUserGold } from "../db/schema/users.js";

const MAX_STONES_PER_CHIGO = 4; // Límite de piedras por chigo

export function registerStones(router) {
  // ============================================
  // STONE TYPES (Catálogo)
  // ============================================

  // GET /api/stone-types - Obtener todos los tipos de piedras
  router.get(
    "/api/stone-types",
    asyncHandler(async () => {
      const cacheKey = "stone-types:all";
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const stoneTypes = getAllStoneTypes();
      await cache.set(cacheKey, stoneTypes, 300);
      return stoneTypes;
    }),
  );

  // GET /api/stone-types/buyable - Obtener piedras comprables
  router.get(
    "/api/stone-types/buyable",
    asyncHandler(async () => {
      const cacheKey = "stone-types:buyable";
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const stoneTypes = getBuyableStoneTypes();
      await cache.set(cacheKey, stoneTypes, 300);
      return stoneTypes;
    }),
  );

  // GET /api/stone-types/:id - Obtener tipo de piedra por ID
  router.get(
    "/api/stone-types/:id",
    asyncHandler(async (ctx) => {
      const id = parseInt(ctx.params.id);
      const stoneType = getStoneTypeById(id);

      if (!stoneType) {
        ctx.set.status = 404;
        return { error: "Stone type not found" };
      }

      return stoneType;
    }),
  );

  // ============================================
  // USER STONES (Inventario del usuario)
  // ============================================

  // GET /api/users/:userId/stones - Obtener piedras del usuario
  router.get(
    "/api/users/:userId/stones",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);

      const cacheKey = `user-stones:${userId}`;
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const stones = getUserStones(userId);
      await cache.set(cacheKey, stones, 60);
      return stones;
    }),
  );

  // POST /api/users/:userId/stones - Dar piedras a usuario (interno/recompensas)
  router.post(
    "/api/users/:userId/stones",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);
      const { stoneTypeId, stoneTypeName, quantity = 1 } = ctx.body;

      let stoneType;
      if (stoneTypeId) {
        stoneType = getStoneTypeById(stoneTypeId);
      } else if (stoneTypeName) {
        stoneType = getStoneTypeByName(stoneTypeName);
      }

      if (!stoneType) {
        ctx.set.status = 404;
        return { error: "Stone type not found" };
      }

      const result = addStoneToUser(userId, stoneType.id, quantity);

      await cache.delete(`user-stones:${userId}`);

      return {
        success: true,
        stoneType,
        newQuantity: result.newQuantity,
      };
    }),
  );

  // POST /api/marketplace/buy-stone - Comprar piedra
  router.post(
    "/api/marketplace/buy-stone",
    asyncHandler(async (ctx) => {
      const { userId, stoneTypeId, quantity = 1 } = ctx.body;

      if (!userId || !stoneTypeId) {
        ctx.set.status = 400;
        return { error: "userId and stoneTypeId are required" };
      }

      const stoneType = getStoneTypeById(stoneTypeId);
      if (!stoneType) {
        ctx.set.status = 404;
        return { error: "Stone type not found" };
      }

      if (stoneType.price <= 0) {
        ctx.set.status = 400;
        return { error: "This stone is not for sale" };
      }

      const totalCost = stoneType.price * quantity;
      const userGold = getUserGold(userId);

      if (userGold < totalCost) {
        ctx.set.status = 400;
        return { error: "Not enough gold", required: totalCost, current: userGold };
      }

      // Descontar oro
      modifyUserGold(userId, -totalCost);

      // Agregar piedras
      const result = addStoneToUser(userId, stoneTypeId, quantity);

      // Invalidar caches
      await cache.delete(`user-stones:${userId}`);
      await cache.delete(`inventory:${userId}`);

      return {
        success: true,
        stoneType,
        quantity,
        totalCost,
        newGold: userGold - totalCost,
        newQuantity: result.newQuantity,
      };
    }),
  );

  // POST /api/users/:userId/stones/equip - Equipar piedra a un chigo (permanente)
  router.post(
    "/api/users/:userId/stones/equip",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);
      const { stoneTypeId, chigoId } = ctx.body;

      if (!stoneTypeId || !chigoId) {
        ctx.set.status = 400;
        return { error: "stoneTypeId and chigoId are required" };
      }

      // Verificar que tiene la piedra
      if (!hasStone(userId, stoneTypeId)) {
        ctx.set.status = 400;
        return { error: "You don't have this stone" };
      }

      // Verificar que el chigo pertenece al usuario
      const chigo = getChigoById(chigoId);
      if (!chigo || chigo.user_id !== userId) {
        ctx.set.status = 404;
        return { error: "Chigo not found or doesn't belong to you" };
      }

      // Verificar límite de piedras
      const currentStones = countChigoStones(chigoId);
      if (currentStones >= MAX_STONES_PER_CHIGO) {
        ctx.set.status = 400;
        return {
          error: `Chigo already has ${MAX_STONES_PER_CHIGO} stones equipped (maximum)`,
        };
      }

      const stoneType = getStoneTypeById(stoneTypeId);

      // Remover piedra del inventario (consumida)
      removeStoneFromUser(userId, stoneTypeId, 1);

      // Equipar piedra al chigo (permanente)
      equipStone(chigoId, stoneTypeId);

      // Invalidar caches
      await cache.delete(`user-stones:${userId}`);
      await cache.delete(`user-chigos:${userId}`);

      return {
        success: true,
        message: "Stone equipped permanently",
        stoneEquipped: stoneType,
        chigoId,
        totalStonesEquipped: currentStones + 1,
      };
    }),
  );

  // GET /api/users/:userId/chigos/:chigoId/stones - Obtener piedras equipadas de un chigo
  router.get(
    "/api/users/:userId/chigos/:chigoId/stones",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);
      const chigoId = parseInt(ctx.params.chigoId);

      const chigo = getChigoById(chigoId);
      if (!chigo || chigo.user_id !== userId) {
        ctx.set.status = 404;
        return { error: "Chigo not found or doesn't belong to you" };
      }

      const stones = getChigoStones(chigoId);
      return stones;
    }),
  );
}
