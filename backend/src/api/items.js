import { db } from "../db/index.js";
import { validate } from "../validators/validate.js";
import { createItemSchema } from "../validators/schemas.js";
import { cache } from "../services/cache.js";
import { asyncHandler } from "../utils/errorHandler.js";

// Registrar rutas de items
export function registerItems(router) {
  // GET all items
  router.get(
    "/api/items",
    asyncHandler(async () => {
      // Intentar obtener del cache
      const cached = await cache.get("items:all");
      if (cached) {
        return Response.json(cached);
      }

      // Si no está en cache, consultar DB
      const items = [
        ...db.query("SELECT id, name, price, icon FROM items"),
      ].map((row) => ({
        id: row.id,
        name: row.name,
        price: row.price,
        icon: row.icon,
      }));

      // Guardar en cache por 5 minutos
      await cache.set("items:all", items, 300);

      return Response.json(items);
    }),
  );

  // POST create item
  router.post(
    "/api/items",
    asyncHandler(async (req) => {
      const body = await req.json();

      // Validar datos
      const validation = validate(createItemSchema, body);
      if (!validation.success) {
        return Response.json({ error: validation.error }, { status: 400 });
      }

      const { name, price, icon } = validation.data;

      // Insertar item
      db.run(
        "INSERT INTO items (name, price, icon) VALUES (?, ?, ?)",
        name,
        price,
        icon,
      );

      // Obtener el último ID insertado
      const id = db.lastInsertRowId;

      // Invalidar cache de items
      await cache.delete("items:all");

      return Response.json({ id, name, price, icon });
    }),
  );
}
