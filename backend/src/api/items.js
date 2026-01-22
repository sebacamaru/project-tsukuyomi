import { db } from "../db/index.js";
import { validate } from "../validators/validate.js";
import { createItemSchema } from "../validators/schemas.js";
import { cache } from "../services/cache.js";
import { asyncHandler } from "../utils/errorHandler.js";
import {
  getUserGold,
  modifyUserGold,
  addItemToInventory,
  getItemById,
} from "../db/schema/inventory.js";

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
        ...db.query(
          "SELECT id, name, label, description, price, icon, type FROM items",
        ),
      ].map((row) => ({
        id: row.id,
        name: row.name,
        label: row.label,
        description: row.description,
        price: row.price,
        icon: row.icon,
        type: row.type,
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

      const { name, label, description, price, icon, type } = validation.data;

      // Insertar item
      db.run(
        "INSERT INTO items (name, label, description, price, icon, type) VALUES (?, ?, ?, ?, ?, ?)",
        name,
        label,
        description || null,
        price,
        icon,
        type,
      );

      // Obtener el último ID insertado
      const id = db.lastInsertRowId;

      // Invalidar cache de items
      await cache.delete("items:all");

      return Response.json({ id, name, label, description, price, icon, type });
    }),
  );

  // POST /api/marketplace/buy - Comprar item
  router.post(
    "/api/marketplace/buy",
    asyncHandler(async (ctx) => {
      const { userId, itemId, quantity = 1 } = ctx.body;

      if (!userId || !itemId) {
        ctx.set.status = 400;
        return { error: "userId and itemId are required" };
      }

      if (quantity < 1) {
        ctx.set.status = 400;
        return { error: "Quantity must be at least 1" };
      }

      // Validar item
      const item = getItemById(itemId);
      if (!item) {
        ctx.set.status = 404;
        return { error: "Item not found" };
      }

      // Items con precio 0 no se pueden comprar (son recompensas)
      if (item.price === 0) {
        ctx.set.status = 400;
        return { error: "This item cannot be purchased" };
      }

      // Calcular costo total
      const totalCost = item.price * quantity;

      // Verificar y descontar oro
      const goldResult = modifyUserGold(userId, -totalCost);
      if (!goldResult.success) {
        ctx.set.status = 400;
        return { error: "Not enough gold" };
      }

      // Agregar item al inventario
      const inventoryResult = addItemToInventory(userId, itemId, quantity);

      // Invalidar cache
      await cache.delete(`inventory:${userId}`);

      return {
        success: true,
        newGold: goldResult.newGold,
        item: {
          ...item,
          quantity: inventoryResult.newQuantity,
        },
      };
    }),
  );
}
