import { db } from "../db/index.js";
import { validate } from "../validators/validate.js";
import { createMonsterSchema, userIdParamSchema } from "../validators/schemas.js";
import { cache } from "../services/cache.js";
import { asyncHandler } from "../utils/errorHandler.js";

// GET all monsters
export function registerMonsters(router) {
  router.get("/api/monsters", asyncHandler(async () => {
    // Intentar obtener del cache
    const cached = await cache.get("monsters:all");
    if (cached) {
      return Response.json(cached);
    }

    // Si no está en cache, consultar DB
    const monsters = [...db.query("SELECT * FROM monsters")].map(
      ([id, name, attack, defense, ownerId]) => ({
        id,
        name,
        attack,
        defense,
        ownerId,
      })
    );

    // Guardar en cache por 5 minutos
    await cache.set("monsters:all", monsters, 300);

    return Response.json(monsters);
  }));

  // GET monsters by user ID
  router.get("/api/monsters/by-user/:userId", asyncHandler(async (req) => {
    // Validar parámetro
    const validation = validate(userIdParamSchema, req.params);
    if (!validation.success) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    const userId = validation.data.userId;

    // Intentar obtener del cache
    const cacheKey = `monsters:user:${userId}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return Response.json(cached);
    }

    // Si no está en cache, consultar DB
    const monsters = [...db.query("SELECT * FROM monsters WHERE ownerId = ?", userId)].map(
      ([id, name, attack, defense, ownerId]) => ({
        id,
        name,
        attack,
        defense,
        ownerId,
      })
    );

    // Guardar en cache por 5 minutos
    await cache.set(cacheKey, monsters, 300);

    return Response.json(monsters);
  }));

  // CREATE monster
  router.post("/api/monsters", asyncHandler(async (req) => {
    const body = await req.json();

    // Validar datos
    const validation = validate(createMonsterSchema, body);
    if (!validation.success) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    const { name, attack, defense, ownerId } = validation.data;

    // Insertar el monstruo
    db.run(
      "INSERT INTO monsters (name, attack, defense, ownerId) VALUES (?, ?, ?, ?)",
      name,
      attack,
      defense,
      ownerId
    );

    // Obtener el último ID insertado
    const id = db.lastInsertRowId;

    // Invalidar cache de monsters
    await cache.delete("monsters:all");
    await cache.delete(`monsters:user:${ownerId}`);

    return Response.json({ id, name, attack, defense, ownerId });
  }));
}
