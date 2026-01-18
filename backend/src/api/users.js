import { validate } from "../validators/validate.js";
import { usernameSchema } from "../validators/schemas.js";
import { cache } from "../services/cache.js";
import { asyncHandler } from "../utils/errorHandler.js";
import {
  getUsers,
  getUserById,
  updateUsername,
  checkUsernameAvailable,
  completeCurrentQuest,
} from "../db/schema/users.js";

// Registrar rutas de usuario
export function registerUsers(router) {
  // GET all users
  router.get(
    "/api/users",
    asyncHandler(async () => {
      // Intentar obtener del cache
      const cached = await cache.get("users:all");
      if (cached) {
        return cached;
      }

      // Si no está en cache, consultar DB
      const users = getUsers();

      // Guardar en cache por 5 minutos
      await cache.set("users:all", users, 300);

      return users;
    }),
  );

  // GET check username availability (debe ir antes de :userId para evitar colisión)
  router.get(
    "/api/users/check-username/:username",
    asyncHandler(async (ctx) => {
      const { username } = ctx.params;
      const available = checkUsernameAvailable(username);
      return { available };
    }),
  );

  // GET user by ID
  router.get(
    "/api/users/:userId",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);
      const user = getUserById(userId);

      if (!user) {
        ctx.set.status = 404;
        return { error: "User not found" };
      }

      return user;
    }),
  );

  // PUT update username
  router.put(
    "/api/users/:userId/username",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);
      const body = ctx.body;

      // Validar datos
      const validation = validate(usernameSchema, body);
      if (!validation.success) {
        ctx.set.status = 400;
        return { error: validation.error };
      }

      const { username } = validation.data;

      const result = updateUsername(userId, username);

      if (!result.success) {
        ctx.set.status = 409;
        return { error: result.error };
      }

      // Invalidar cache de usuarios
      await cache.delete("users:all");

      const updatedUser = getUserById(userId);
      return updatedUser;
    }),
  );

  // POST complete current quest
  router.post(
    "/api/users/:userId/complete-quest",
    asyncHandler(async (ctx) => {
      const userId = parseInt(ctx.params.userId);

      const result = completeCurrentQuest(userId);

      if (!result.success) {
        ctx.set.status = 400;
        return { error: result.error };
      }

      const updatedUser = getUserById(userId);
      return {
        ...result,
        user: updatedUser,
      };
    }),
  );
}
