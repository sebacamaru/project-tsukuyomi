import { asyncHandler } from "../utils/errorHandler.js";
import { cache } from "../services/cache.js";
import {
  getAllCandyTypes,
  getCandyTypeById,
  getCandyTypeByName,
  getBuyableCandyTypes,
  getUserCandies,
  getUserCandyQuantity,
  addCandyToUser,
  removeCandyFromUser,
  hasCandy,
} from "../db/schema/candies.js";
import { modifyChigoStats, getChigoById } from "../db/schema/chigos.js";
import { getUserGold, modifyUserGold } from "../db/schema/users.js";

export function registerCandies(router) {
  // ============================================
  // CANDY TYPES (Catálogo)
  // ============================================

  // GET /api/candy-types - Obtener todos los tipos de caramelos
  router.get(
    "/api/candy-types",
    asyncHandler(async () => {
      const cacheKey = "candy-types:all";
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const candyTypes = getAllCandyTypes();
      await cache.set(cacheKey, candyTypes, 300); // Cache 5 min
      return candyTypes;
    }),
  );

  // GET /api/candy-types/buyable - Obtener caramelos comprables
  router.get(
    "/api/candy-types/buyable",
    asyncHandler(async () => {
      const cacheKey = "candy-types:buyable";
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const candyTypes = getBuyableCandyTypes();
      await cache.set(cacheKey, candyTypes, 300);
      return candyTypes;
    }),
  );

  // GET /api/candy-types/:id - Obtener tipo de caramelo por ID
  router.get(
    "/api/candy-types/:id",
    asyncHandler(async (ctx) => {
      const id = parseInt(ctx.params.id);
      const candyType = getCandyTypeById(id);

      if (!candyType) {
        ctx.set.status = 404;
        return { error: "Candy type not found" };
      }

      return candyType;
    }),
  );

  // ============================================
  // USER CANDIES (Inventario del usuario)
  // ============================================

  // GET /api/users/:userId/candies - Obtener caramelos del usuario
  router.get(
    "/api/users/:userId/candies",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);

      const cacheKey = `user-candies:${userId}`;
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const candies = getUserCandies(userId);
      await cache.set(cacheKey, candies, 60);
      return candies;
    }),
  );

  // POST /api/users/:userId/candies - Dar caramelos a usuario (interno/recompensas)
  router.post(
    "/api/users/:userId/candies",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);
      const { candyTypeId, candyTypeName, quantity = 1 } = ctx.body;

      let candyType;
      if (candyTypeId) {
        candyType = getCandyTypeById(candyTypeId);
      } else if (candyTypeName) {
        candyType = getCandyTypeByName(candyTypeName);
      }

      if (!candyType) {
        ctx.set.status = 404;
        return { error: "Candy type not found" };
      }

      const result = addCandyToUser(userId, candyType.id, quantity);

      await cache.delete(`user-candies:${userId}`);

      return {
        success: true,
        candyType,
        newQuantity: result.newQuantity,
      };
    }),
  );

  // POST /api/marketplace/buy-candy - Comprar caramelo
  router.post(
    "/api/marketplace/buy-candy",
    asyncHandler(async (ctx) => {
      const { userId, candyTypeId, quantity = 1 } = ctx.body;

      if (!userId || !candyTypeId) {
        ctx.set.status = 400;
        return { error: "userId and candyTypeId are required" };
      }

      const candyType = getCandyTypeById(candyTypeId);
      if (!candyType) {
        ctx.set.status = 404;
        return { error: "Candy type not found" };
      }

      if (candyType.price <= 0) {
        ctx.set.status = 400;
        return { error: "This candy is not for sale" };
      }

      const totalCost = candyType.price * quantity;
      const userGold = getUserGold(userId);

      if (userGold < totalCost) {
        ctx.set.status = 400;
        return { error: "Not enough gold", required: totalCost, current: userGold };
      }

      // Descontar oro
      modifyUserGold(userId, -totalCost);

      // Agregar caramelos
      const result = addCandyToUser(userId, candyTypeId, quantity);

      // Invalidar caches
      await cache.delete(`user-candies:${userId}`);
      await cache.delete(`inventory:${userId}`);

      return {
        success: true,
        candyType,
        quantity,
        totalCost,
        newGold: userGold - totalCost,
        newQuantity: result.newQuantity,
      };
    }),
  );

  // POST /api/users/:userId/candies/use - Usar caramelo en un chigo
  router.post(
    "/api/users/:userId/candies/use",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);
      const { candyTypeId, chigoId } = ctx.body;

      if (!candyTypeId || !chigoId) {
        ctx.set.status = 400;
        return { error: "candyTypeId and chigoId are required" };
      }

      // Verificar que tiene el caramelo
      if (!hasCandy(userId, candyTypeId)) {
        ctx.set.status = 400;
        return { error: "You don't have this candy" };
      }

      // Verificar que el chigo pertenece al usuario
      const chigo = getChigoById(chigoId);
      if (!chigo || chigo.user_id !== userId) {
        ctx.set.status = 404;
        return { error: "Chigo not found or doesn't belong to you" };
      }

      const candyType = getCandyTypeById(candyTypeId);

      // Remover caramelo
      removeCandyFromUser(userId, candyTypeId, 1);

      // Aplicar stat boost
      const statChange = { [candyType.stat_affected]: candyType.stat_amount };
      const updatedChigo = modifyChigoStats(chigoId, statChange);

      // Invalidar caches
      await cache.delete(`user-candies:${userId}`);
      await cache.delete(`user-chigos:${userId}`);

      return {
        success: true,
        candyUsed: candyType,
        statChange,
        chigo: updatedChigo,
      };
    }),
  );
}
