import { asyncHandler } from "../utils/errorHandler.js";
import { cache } from "../services/cache.js";
import {
  getAllSpecies,
  getSpeciesById,
  getSpeciesByName,
  getUserChigos,
  getChigoByUuid,
  getChigoById,
  createUserChigo,
  updateChigoNickname,
  deleteUserChigo,
  countUserChigos,
  getChigoStones,
} from "../db/schema/chigos.js";

export function registerChigos(router) {
  // ============================================
  // CHIGO SPECIES (Catálogo)
  // ============================================

  // GET /api/chigo-species - Obtener todas las especies
  router.get(
    "/api/chigo-species",
    asyncHandler(async () => {
      const cacheKey = "chigo-species:all";
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const species = getAllSpecies();
      await cache.set(cacheKey, species, 300);
      return species;
    }),
  );

  // GET /api/chigo-species/:id - Obtener especie por ID
  router.get(
    "/api/chigo-species/:id",
    asyncHandler(async (ctx) => {
      const id = parseInt(ctx.params.id);
      const species = getSpeciesById(id);

      if (!species) {
        ctx.set.status = 404;
        return { error: "Species not found" };
      }

      return species;
    }),
  );

  // ============================================
  // USER CHIGOS (Chigos del usuario)
  // ============================================

  // GET /api/users/:userId/chigos - Obtener chigos del usuario
  router.get(
    "/api/users/:userId/chigos",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);

      const cacheKey = `user-chigos:${userId}`;
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const chigos = getUserChigos(userId);

      // Agregar piedras equipadas a cada chigo
      const chigosWithStones = chigos.map((chigo) => ({
        ...chigo,
        stones: getChigoStones(chigo.id),
      }));

      await cache.set(cacheKey, chigosWithStones, 60);
      return chigosWithStones;
    }),
  );

  // GET /api/users/:userId/chigos/count - Contar chigos del usuario
  // IMPORTANTE: Esta ruta debe ir ANTES de las rutas con :chigoId
  router.get(
    "/api/users/:userId/chigos/count",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);
      const count = countUserChigos(userId);
      return { count };
    }),
  );

  // GET /api/users/:userId/chigos/:chigoId - Obtener chigo específico
  router.get(
    "/api/users/:userId/chigos/:chigoId",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);
      const uuid = ctx.params.chigoId;

      const chigo = getChigoByUuid(uuid);

      if (!chigo) {
        ctx.set.status = 404;
        return { error: "Chigo not found" };
      }

      if (chigo.user_id !== userId) {
        ctx.set.status = 403;
        return { error: "Chigo does not belong to this user" };
      }

      // Agregar piedras equipadas
      chigo.stones = getChigoStones(chigo.id);

      return chigo;
    }),
  );

  // POST /api/users/:userId/chigos - Crear chigo (interno/desde huevo)
  router.post(
    "/api/users/:userId/chigos",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);
      const { speciesId, speciesName, stats, hatchedFromEggId } = ctx.body;

      let species;
      if (speciesId) {
        species = getSpeciesById(speciesId);
      } else if (speciesName) {
        species = getSpeciesByName(speciesName);
      }

      if (!species) {
        ctx.set.status = 404;
        return { error: "Species not found" };
      }

      // Si no se proveen stats, usar los base de la especie
      const finalStats = stats || {
        hp: species.base_hp,
        atk: species.base_atk,
        def: species.base_def,
        spd: species.base_spd,
      };

      const result = createUserChigo(
        userId,
        species.id,
        finalStats,
        hatchedFromEggId,
      );

      await cache.delete(`user-chigos:${userId}`);

      return {
        success: true,
        chigo: {
          ...result,
          species,
          ...finalStats,
        },
      };
    }),
  );

  // PUT /api/users/:userId/chigos/:chigoId/nickname - Cambiar nickname
  router.put(
    "/api/users/:userId/chigos/:chigoId/nickname",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);
      const uuid = ctx.params.chigoId;
      const { nickname } = ctx.body;

      const chigo = getChigoByUuid(uuid);

      if (!chigo) {
        ctx.set.status = 404;
        return { error: "Chigo not found" };
      }

      if (chigo.user_id !== userId) {
        ctx.set.status = 403;
        return { error: "Chigo does not belong to this user" };
      }

      updateChigoNickname(chigo.id, nickname);

      await cache.delete(`user-chigos:${userId}`);

      return { success: true, nickname };
    }),
  );

  // DELETE /api/users/:userId/chigos/:chigoId - Liberar chigo
  router.delete(
    "/api/users/:userId/chigos/:chigoId",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);
      const uuid = ctx.params.chigoId;

      const chigo = getChigoByUuid(uuid);

      if (!chigo) {
        ctx.set.status = 404;
        return { error: "Chigo not found" };
      }

      if (chigo.user_id !== userId) {
        ctx.set.status = 403;
        return { error: "Chigo does not belong to this user" };
      }

      deleteUserChigo(chigo.id);

      await cache.delete(`user-chigos:${userId}`);

      return { success: true, message: "Chigo released" };
    }),
  );
}
