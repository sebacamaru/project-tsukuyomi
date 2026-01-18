import { Elysia } from "elysia";
import { jwtPlugin } from "./core/jwt.js";
import { loadApiRoutes } from "./api/index.js";
import { logger } from "./utils/logger.js";
import { loadWsHandlers } from "./ws/index.js";
import { staticPlugin } from "@elysiajs/static";
import { handleWsOpen, handleWsMessage, handleWsClose } from "./ws/handler.js";
import { initDatabase } from "./db/index.js";

// Inicializar base de datos
initDatabase();

const app = new Elysia()
  .use(jwtPlugin())
  .onStart(() => logger.info("🚀 Chigotama backend inició"));

// API
loadApiRoutes(app);

// WebSockets
loadWsHandlers();

app
  .ws("/ws", {
    open: handleWsOpen,
    message: handleWsMessage,
    close: handleWsClose,
  })
  .use(
    staticPlugin({
      assets: "../public",
      prefix: "/",
      alwaysStatic: true,
      indexHTML: false,
    }),
  )
  // Catch-all: sirve index.html para rutas del SPA
  .get("*", async ({ path, set }) => {
    if (path.startsWith("/api")) return;
    set.headers["content-type"] = "text/html; charset=utf-8";
    const html = await Bun.file("../public/index.html").text();
    return html;
  })
  .listen(process.env.PORT);

logger.info(`✔ Server running on http://localhost:${process.env.PORT}`);
