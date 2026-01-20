import { getUsers, getUserById } from "../db/schema/users.js";
import { getQuests } from "../db/schema/quests.js";
import { db } from "../db/index.js";
import { asyncHandler } from "../utils/errorHandler.js";

export function registerAdmin(router) {
  // Solo habilitar en desarrollo
  if (process.env.NODE_ENV === "production") {
    return;
  }

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

      // questCode puede ser null para marcar todas las quests como completadas
      // Resetear next_quest_available_at para que la quest esté disponible inmediatamente
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
}
