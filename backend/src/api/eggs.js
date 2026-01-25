import { asyncHandler } from "../utils/errorHandler.js";
import { cache } from "../services/cache.js";
import {
  getAllEggTypes,
  getEggTypeById,
  getEggTypeByName,
  getUserEggs,
  getEggByUuid,
  createUserEgg,
  startIncubation,
  updateCareParams,
  markAsHatched,
  deleteUserEgg,
} from "../db/schema/eggs.js";

export function registerEggs(router) {
  // ============================================
  // EGG TYPES (Catálogo)
  // ============================================

  // GET /api/egg-types - Obtener todos los tipos de huevos
  router.get(
    "/api/egg-types",
    asyncHandler(async () => {
      const cacheKey = "egg-types:all";
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const eggTypes = getAllEggTypes();
      await cache.set(cacheKey, eggTypes, 300); // Cache 5 min
      return eggTypes;
    }),
  );

  // GET /api/egg-types/:id - Obtener tipo de huevo por ID
  router.get(
    "/api/egg-types/:id",
    asyncHandler(async (ctx) => {
      const id = parseInt(ctx.params.id);
      const eggType = getEggTypeById(id);

      if (!eggType) {
        ctx.set.status = 404;
        return { error: "Egg type not found" };
      }

      return eggType;
    }),
  );

  // ============================================
  // USER EGGS (Inventario del usuario)
  // ============================================

  // GET /api/users/:userId/eggs - Obtener huevos del usuario
  router.get(
    "/api/users/:userId/eggs",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);
      const status = ctx.query.status || null; // Filtro opcional

      const cacheKey = `user-eggs:${userId}:${status || "all"}`;
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const eggs = getUserEggs(userId, status);
      await cache.set(cacheKey, eggs, 60); // Cache 1 min
      return eggs;
    }),
  );

  // GET /api/users/:userId/eggs/:uuid - Obtener huevo específico
  router.get(
    "/api/users/:userId/eggs/:uuid",
    asyncHandler(async (ctx) => {
      const uuid = ctx.params.uuid;
      const egg = getEggByUuid(uuid);

      if (!egg) {
        ctx.set.status = 404;
        return { error: "Egg not found" };
      }

      // Verificar que pertenece al usuario
      const userId = parseInt(ctx.params.userId);
      if (egg.user_id !== userId) {
        ctx.set.status = 403;
        return { error: "Egg does not belong to this user" };
      }

      return egg;
    }),
  );

  // POST /api/users/:userId/eggs - Dar huevo a usuario (interno/recompensas)
  router.post(
    "/api/users/:userId/eggs",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);
      const { eggTypeId, eggTypeName } = ctx.body;

      let eggType;
      if (eggTypeId) {
        eggType = getEggTypeById(eggTypeId);
      } else if (eggTypeName) {
        eggType = getEggTypeByName(eggTypeName);
      }

      if (!eggType) {
        ctx.set.status = 404;
        return { error: "Egg type not found" };
      }

      const result = createUserEgg(userId, eggType.id);

      // Invalidar cache
      await cache.delete(`user-eggs:${userId}:all`);
      await cache.delete(`user-eggs:${userId}:inventory`);

      return {
        success: true,
        egg: { ...result, eggType },
      };
    }),
  );

  // POST /api/users/:userId/eggs/:uuid/incubate - Iniciar incubación
  router.post(
    "/api/users/:userId/eggs/:uuid/incubate",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);
      const uuid = ctx.params.uuid;
      const { careParams = {} } = ctx.body;

      const egg = getEggByUuid(uuid);

      if (!egg) {
        ctx.set.status = 404;
        return { error: "Egg not found" };
      }

      if (egg.user_id !== userId) {
        ctx.set.status = 403;
        return { error: "Egg does not belong to this user" };
      }

      if (egg.status !== "inventory") {
        ctx.set.status = 400;
        return { error: "Egg is not in inventory" };
      }

      const updatedEgg = startIncubation(egg.id, careParams);

      // Invalidar caches
      await cache.delete(`user-eggs:${userId}:all`);
      await cache.delete(`user-eggs:${userId}:inventory`);
      await cache.delete(`user-eggs:${userId}:incubating`);

      return { success: true, egg: updatedEgg };
    }),
  );

  // PUT /api/users/:userId/eggs/:uuid/care - Actualizar parámetros de cuidado
  router.put(
    "/api/users/:userId/eggs/:uuid/care",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);
      const uuid = ctx.params.uuid;
      const { careParams } = ctx.body;

      if (!careParams) {
        ctx.set.status = 400;
        return { error: "careParams is required" };
      }

      const egg = getEggByUuid(uuid);

      if (!egg) {
        ctx.set.status = 404;
        return { error: "Egg not found" };
      }

      if (egg.user_id !== userId) {
        ctx.set.status = 403;
        return { error: "Egg does not belong to this user" };
      }

      if (egg.status !== "incubating") {
        ctx.set.status = 400;
        return { error: "Egg is not incubating" };
      }

      const updatedEgg = updateCareParams(egg.id, careParams);

      return { success: true, egg: updatedEgg };
    }),
  );

  // POST /api/users/:userId/eggs/:uuid/hatch - Eclosionar huevo
  router.post(
    "/api/users/:userId/eggs/:uuid/hatch",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);
      const uuid = ctx.params.uuid;

      const egg = getEggByUuid(uuid);

      if (!egg) {
        ctx.set.status = 404;
        return { error: "Egg not found" };
      }

      if (egg.user_id !== userId) {
        ctx.set.status = 403;
        return { error: "Egg does not belong to this user" };
      }

      if (egg.status !== "incubating") {
        ctx.set.status = 400;
        return { error: "Egg must be incubating to hatch" };
      }

      // Marcar como eclosionado
      const hatchedEgg = markAsHatched(egg.id);

      // TODO: Crear chigo basado en care_params y possible_species
      // Por ahora solo marcamos el huevo como eclosionado

      // Invalidar caches
      await cache.delete(`user-eggs:${userId}:all`);
      await cache.delete(`user-eggs:${userId}:incubating`);
      await cache.delete(`user-eggs:${userId}:hatched`);

      return {
        success: true,
        egg: hatchedEgg,
        // chigo: createdChigo // TODO
      };
    }),
  );

  // DELETE /api/users/:userId/eggs/:uuid - Eliminar huevo
  router.delete(
    "/api/users/:userId/eggs/:uuid",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);
      const uuid = ctx.params.uuid;

      const egg = getEggByUuid(uuid);

      if (!egg) {
        ctx.set.status = 404;
        return { error: "Egg not found" };
      }

      if (egg.user_id !== userId) {
        ctx.set.status = 403;
        return { error: "Egg does not belong to this user" };
      }

      deleteUserEgg(egg.id);

      // Invalidar caches
      await cache.delete(`user-eggs:${userId}:all`);
      await cache.delete(`user-eggs:${userId}:${egg.status}`);

      return { success: true };
    }),
  );
}
