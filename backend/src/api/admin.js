import { getUsers, getUserById, modifyUserGold } from "../db/schema/users.js";
import { getQuests } from "../db/schema/quests.js";
import { db } from "../db/index.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { cache } from "../services/cache.js";

// Imports para las nuevas entidades
import {
  createSpecies,
  updateSpecies,
  deleteSpecies,
  getAllSpecies,
  getSpeciesById,
} from "../db/schema/chigos.js";
import {
  createEggType,
  updateEggType,
  deleteEggType,
  getAllEggTypes,
  getEggTypeById,
  createUserEgg,
} from "../db/schema/eggs.js";
import {
  createCandyType,
  updateCandyType,
  deleteCandyType,
  getAllCandyTypes,
  getCandyTypeById,
  addCandyToUser,
} from "../db/schema/candies.js";
import {
  createStoneType,
  updateStoneType,
  deleteStoneType,
  getAllStoneTypes,
  getStoneTypeById,
  addStoneToUser,
} from "../db/schema/stones.js";

export function registerAdmin(router) {
  // Solo habilitar en desarrollo
  if (process.env.NODE_ENV === "production") {
    return;
  }

  // ============================================
  // USUARIOS Y QUESTS
  // ============================================

  // GET todos los usuarios
  router.get(
    "/api/admin/users",
    asyncHandler(async () => {
      return getUsers();
    }),
  );

  // GET todas las quests
  router.get(
    "/api/admin/quests",
    asyncHandler(async () => {
      return getQuests();
    }),
  );

  // POST resetear quest de un usuario
  router.post(
    "/api/admin/reset-quest",
    asyncHandler(async (ctx) => {
      const { userId, questCode } = ctx.body;

      if (!userId) {
        ctx.set.status = 400;
        return { error: "userId is required" };
      }

      const user = getUserById(userId);
      if (!user) {
        ctx.set.status = 404;
        return { error: "User not found" };
      }

      db.run(
        "UPDATE users SET current_quest_code = ?, next_quest_available_at = NULL WHERE id = ?",
        questCode || null,
        userId,
      );

      const updatedUser = getUserById(userId);

      return {
        success: true,
        user: updatedUser,
      };
    }),
  );

  // POST dar oro a usuario
  router.post(
    "/api/admin/users/:userId/give-gold",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);
      const { amount } = ctx.body;

      if (!amount || amount <= 0) {
        ctx.set.status = 400;
        return { error: "amount must be positive" };
      }

      const user = getUserById(userId);
      if (!user) {
        ctx.set.status = 404;
        return { error: "User not found" };
      }

      const result = modifyUserGold(userId, amount);
      await cache.delete(`inventory:${userId}`);

      return { success: true, newGold: result.newGold };
    }),
  );

  // ============================================
  // CHIGO SPECIES (Catálogo)
  // ============================================

  router.get(
    "/api/admin/chigo-species",
    asyncHandler(async () => {
      return getAllSpecies();
    }),
  );

  router.post(
    "/api/admin/chigo-species",
    asyncHandler(async (ctx) => {
      const species = createSpecies(ctx.body);
      await cache.delete("chigo-species:all");
      return { success: true, species };
    }),
  );

  router.put(
    "/api/admin/chigo-species/:id",
    asyncHandler(async (ctx) => {
      const id = parseInt(ctx.params.id);
      const species = updateSpecies(id, ctx.body);
      if (!species) {
        ctx.set.status = 404;
        return { error: "Species not found" };
      }
      await cache.delete("chigo-species:all");
      return { success: true, species };
    }),
  );

  router.delete(
    "/api/admin/chigo-species/:id",
    asyncHandler(async (ctx) => {
      const id = parseInt(ctx.params.id);
      deleteSpecies(id);
      await cache.delete("chigo-species:all");
      return { success: true };
    }),
  );

  // ============================================
  // EGG TYPES (Catálogo)
  // ============================================

  router.get(
    "/api/admin/egg-types",
    asyncHandler(async () => {
      return getAllEggTypes();
    }),
  );

  router.post(
    "/api/admin/egg-types",
    asyncHandler(async (ctx) => {
      const eggType = createEggType(ctx.body);
      await cache.delete("egg-types:all");
      return { success: true, eggType };
    }),
  );

  router.put(
    "/api/admin/egg-types/:id",
    asyncHandler(async (ctx) => {
      const id = parseInt(ctx.params.id);
      const eggType = updateEggType(id, ctx.body);
      if (!eggType) {
        ctx.set.status = 404;
        return { error: "Egg type not found" };
      }
      await cache.delete("egg-types:all");
      return { success: true, eggType };
    }),
  );

  router.delete(
    "/api/admin/egg-types/:id",
    asyncHandler(async (ctx) => {
      const id = parseInt(ctx.params.id);
      deleteEggType(id);
      await cache.delete("egg-types:all");
      return { success: true };
    }),
  );

  // POST dar huevo a usuario
  router.post(
    "/api/admin/users/:userId/give-egg",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);
      const { eggTypeId } = ctx.body;

      const user = getUserById(userId);
      if (!user) {
        ctx.set.status = 404;
        return { error: "User not found" };
      }

      const eggType = getEggTypeById(eggTypeId);
      if (!eggType) {
        ctx.set.status = 404;
        return { error: "Egg type not found" };
      }

      const result = createUserEgg(userId, eggTypeId);
      await cache.delete(`user-eggs:${userId}:all`);

      return { success: true, egg: result, eggType };
    }),
  );

  // ============================================
  // CANDY TYPES (Catálogo)
  // ============================================

  router.get(
    "/api/admin/candy-types",
    asyncHandler(async () => {
      return getAllCandyTypes();
    }),
  );

  router.post(
    "/api/admin/candy-types",
    asyncHandler(async (ctx) => {
      const candyType = createCandyType(ctx.body);
      await cache.delete("candy-types:all");
      await cache.delete("candy-types:buyable");
      return { success: true, candyType };
    }),
  );

  router.put(
    "/api/admin/candy-types/:id",
    asyncHandler(async (ctx) => {
      const id = parseInt(ctx.params.id);
      const candyType = updateCandyType(id, ctx.body);
      if (!candyType) {
        ctx.set.status = 404;
        return { error: "Candy type not found" };
      }
      await cache.delete("candy-types:all");
      await cache.delete("candy-types:buyable");
      return { success: true, candyType };
    }),
  );

  router.delete(
    "/api/admin/candy-types/:id",
    asyncHandler(async (ctx) => {
      const id = parseInt(ctx.params.id);
      deleteCandyType(id);
      await cache.delete("candy-types:all");
      await cache.delete("candy-types:buyable");
      return { success: true };
    }),
  );

  // POST dar caramelos a usuario
  router.post(
    "/api/admin/users/:userId/give-candy",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);
      const { candyTypeId, quantity = 1 } = ctx.body;

      const user = getUserById(userId);
      if (!user) {
        ctx.set.status = 404;
        return { error: "User not found" };
      }

      const candyType = getCandyTypeById(candyTypeId);
      if (!candyType) {
        ctx.set.status = 404;
        return { error: "Candy type not found" };
      }

      const result = addCandyToUser(userId, candyTypeId, quantity);
      await cache.delete(`user-candies:${userId}`);

      return {
        success: true,
        candyType,
        quantity,
        newQuantity: result.newQuantity,
      };
    }),
  );

  // ============================================
  // STONE TYPES (Catálogo)
  // ============================================

  router.get(
    "/api/admin/stone-types",
    asyncHandler(async () => {
      return getAllStoneTypes();
    }),
  );

  router.post(
    "/api/admin/stone-types",
    asyncHandler(async (ctx) => {
      const stoneType = createStoneType(ctx.body);
      await cache.delete("stone-types:all");
      await cache.delete("stone-types:buyable");
      return { success: true, stoneType };
    }),
  );

  router.put(
    "/api/admin/stone-types/:id",
    asyncHandler(async (ctx) => {
      const id = parseInt(ctx.params.id);
      const stoneType = updateStoneType(id, ctx.body);
      if (!stoneType) {
        ctx.set.status = 404;
        return { error: "Stone type not found" };
      }
      await cache.delete("stone-types:all");
      await cache.delete("stone-types:buyable");
      return { success: true, stoneType };
    }),
  );

  router.delete(
    "/api/admin/stone-types/:id",
    asyncHandler(async (ctx) => {
      const id = parseInt(ctx.params.id);
      deleteStoneType(id);
      await cache.delete("stone-types:all");
      await cache.delete("stone-types:buyable");
      return { success: true };
    }),
  );

  // POST dar piedras a usuario
  router.post(
    "/api/admin/users/:userId/give-stone",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);
      const { stoneTypeId, quantity = 1 } = ctx.body;

      const user = getUserById(userId);
      if (!user) {
        ctx.set.status = 404;
        return { error: "User not found" };
      }

      const stoneType = getStoneTypeById(stoneTypeId);
      if (!stoneType) {
        ctx.set.status = 404;
        return { error: "Stone type not found" };
      }

      const result = addStoneToUser(userId, stoneTypeId, quantity);
      await cache.delete(`user-stones:${userId}`);

      return {
        success: true,
        stoneType,
        quantity,
        newQuantity: result.newQuantity,
      };
    }),
  );
}
