import { db } from "../db/index.js";
import bcrypt from "bcrypt";
import { validate } from "../validators/validate.js";
import { createUserSchema } from "../validators/schemas.js";
import { cache } from "../services/cache.js";
import { asyncHandler } from "../utils/errorHandler.js";

// Registrar rutas de usuario
export function registerUsers(router) {
  // GET all users
  router.get("/api/users", asyncHandler(async () => {
    // Intentar obtener del cache
    const cached = await cache.get("users:all");
    if (cached) {
      return Response.json(cached);
    }

    // Si no está en cache, consultar DB
    const users = [...db.query("SELECT id, email, nickname FROM users")].map(([id, email, nickname]) => ({
      id,
      email,
      nickname,
    }));

    // Guardar en cache por 5 minutos
    await cache.set("users:all", users, 300);

    return Response.json(users);
  }));

  // POST create user
  router.post("/api/users", asyncHandler(async (req) => {
    const body = await req.json();

    // Validar datos
    const validation = validate(createUserSchema, body);
    if (!validation.success) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    const { email, password, nickname } = validation.data;

    // Hashear la contraseña
    const hashed = await bcrypt.hash(password, 10);

    // Insertar usuario
    db.run(
      "INSERT INTO users (email, password, nickname) VALUES (?, ?, ?)",
      email,
      hashed,
      nickname
    );

    // Obtener el último ID insertado
    const id = db.lastInsertRowId;

    // Invalidar cache de usuarios
    await cache.delete("users:all");

    return Response.json({ id, email, nickname });
  }));
}
