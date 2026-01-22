import { getUsers, getUserById } from "../db/schema/users.js";
import { getQuests } from "../db/schema/quests.js";
import { db } from "../db/index.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { cache } from "../services/cache.js";

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

  // DELETE todos los items
  router.delete(
    "/api/admin/items",
    asyncHandler(async () => {
      db.run("DELETE FROM items");
      await cache.delete("items:all");
      return { success: true, message: "All items deleted" };
    }),
  );

  // GET todos los items
  router.get(
    "/api/admin/items",
    asyncHandler(async () => {
      const items = db
        .query(
          "SELECT id, name, label, description, price, icon, type FROM items ORDER BY id",
        )
        .all();
      return items;
    }),
  );

  // POST crear item
  router.post(
    "/api/admin/items",
    asyncHandler(async (ctx) => {
      const { name, label, description, price, icon, type } = ctx.body;

      if (!name || !label || price === undefined || !icon) {
        ctx.set.status = 400;
        return { error: "name, label, price and icon are required" };
      }

      db.run(
        "INSERT INTO items (name, label, description, price, icon, type) VALUES (?, ?, ?, ?, ?, ?)",
        name,
        label,
        description || null,
        price,
        icon,
        type || "misc",
      );

      const id = db.query("SELECT last_insert_rowid() as id").get().id;
      await cache.delete("items:all");

      return {
        success: true,
        item: {
          id,
          name,
          label,
          description,
          price,
          icon,
          type: type || "misc",
        },
      };
    }),
  );

  // PUT actualizar item
  router.put(
    "/api/admin/items/:id",
    asyncHandler(async (ctx) => {
      const id = parseInt(ctx.params.id);
      const { name, label, description, price, icon, type } = ctx.body;

      const existing = db.query("SELECT * FROM items WHERE id = ?").get(id);
      if (!existing) {
        ctx.set.status = 404;
        return { error: "Item not found" };
      }

      db.run(
        "UPDATE items SET name = ?, label = ?, description = ?, price = ?, icon = ?, type = ? WHERE id = ?",
        name ?? existing.name,
        label ?? existing.label,
        description ?? existing.description,
        price ?? existing.price,
        icon ?? existing.icon,
        type ?? existing.type,
        id,
      );

      await cache.delete("items:all");
      const updated = db.query("SELECT * FROM items WHERE id = ?").get(id);

      return { success: true, item: updated };
    }),
  );

  // DELETE item individual
  router.delete(
    "/api/admin/items/:id",
    asyncHandler(async (ctx) => {
      const id = parseInt(ctx.params.id);

      const existing = db.query("SELECT * FROM items WHERE id = ?").get(id);
      if (!existing) {
        ctx.set.status = 404;
        return { error: "Item not found" };
      }

      db.run("DELETE FROM items WHERE id = ?", id);
      await cache.delete("items:all");

      return { success: true, message: "Item deleted" };
    }),
  );
}
