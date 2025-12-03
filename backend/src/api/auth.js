import { db } from "../db/index.js";
import bcrypt from "bcrypt";
import { validate } from "../validators/validate.js";
import { registerSchema, loginSchema } from "../validators/schemas.js";
import { asyncHandler } from "../utils/errorHandler.js";

export function registerAuth(router) {
  // REGISTER
  router.post("/auth/register", asyncHandler(async (req) => {
    const body = await req.json();

    // Validar datos
    const validation = validate(registerSchema, body);
    if (!validation.success) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    const { email, password, nickname } = validation.data;

    // Hashear contraseña
    const hashed = await bcrypt.hash(password, 10);

    // Insertar usuario
    db.run(
      "INSERT INTO users (email, password, nickname) VALUES (?, ?, ?)",
      email,
      hashed,
      nickname
    );

    // Obtener ID del usuario recién creado
    const id = db.lastInsertRowId;

    // Generar token JWT
    // Suponiendo que tienes jwt.sign disponible en req.jwt
    const token = await req.jwt.sign({ id, email });

    return Response.json({ token });
  }));

  // LOGIN
  router.post("/auth/login", asyncHandler(async (req) => {
    const body = await req.json();

    // Validar datos
    const validation = validate(loginSchema, body);
    if (!validation.success) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    const { email, password } = validation.data;

    // Buscar usuario por email
    const rows = [...db.query("SELECT * FROM users WHERE email = ?", email)];

    if (rows.length === 0) return Response.json({ error: "User not found" });

    const [id, dbEmail, dbPassword, nickname] = rows[0];

    // Verificar contraseña
    const ok = await bcrypt.compare(password, dbPassword);
    if (!ok) return Response.json({ error: "Invalid password" });

    // Generar token JWT
    const token = await req.jwt.sign({ id, email: dbEmail });

    return Response.json({ token });
  }));
}
