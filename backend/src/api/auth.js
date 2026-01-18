import bcrypt from "bcrypt";
import { validate } from "../validators/validate.js";
import { registerSchema, loginSchema } from "../validators/schemas.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { insertUser, getUserByEmail } from "../db/schema/users.js";

export function registerAuth(router) {
  // LOGOUT - limpia localStorage y redirige a /auth
  router.get("/auth/logout", ({ set }) => {
    set.headers["content-type"] = "text/html; charset=utf-8";
    return `<!DOCTYPE html>
      <html>
        <head><title>Logout</title></head>
        <body>
          <script>
            localStorage.removeItem("tsukuyomi_auth");
            window.location.href = "/login";
          </script>
        </body>
      </html>`;
  });

  // REGISTER
  router.post(
    "/auth/register",
    asyncHandler(async (ctx) => {
      const body = ctx.body;

      // Validar datos
      const validation = validate(registerSchema, body);
      if (!validation.success) {
        ctx.set.status = 400;
        return { error: validation.error };
      }

      const { email, password } = validation.data;

      // Hashear contraseña
      const hashed = await bcrypt.hash(password, 10);

      // Insertar usuario (genera username temporal automáticamente)
      const user = insertUser(email, hashed);

      // Generar token JWT
      const token = await ctx.jwt.sign({ id: user.id, email });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          current_quest_code: user.current_quest_code,
        },
      };
    }),
  );

  // LOGIN
  router.post(
    "/auth/login",
    asyncHandler(async (ctx) => {
      const body = ctx.body;

      // Validar datos
      const validation = validate(loginSchema, body);
      if (!validation.success) {
        ctx.set.status = 400;
        return { error: validation.error };
      }

      const { email, password } = validation.data;

      // Buscar usuario por email
      const user = getUserByEmail(email);

      if (!user) {
        ctx.set.status = 404;
        return { error: "User not found" };
      }

      // Verificar contraseña
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        ctx.set.status = 401;
        return { error: "Invalid password" };
      }

      // Generar token JWT
      const token = await ctx.jwt.sign({ id: user.id, email: user.email });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          current_quest_code: user.current_quest_code,
        },
      };
    }),
  );
}
