import { Elysia } from "elysia";
import { jwtPlugin } from "./core/jwt.js";
import { staticFiles } from "./core/static.js";
import { loadApiRoutes } from "./api/index.js";
import { logger } from "./utils/logger.js";
import { loadWsHandlers } from "./ws/index.js";
import { handleWsOpen, handleWsMessage, handleWsClose } from "./ws/handler.js";

const app = new Elysia()
  .use(jwtPlugin())
  .use(staticFiles())
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
  .listen(process.env.PORT);

logger.info(`✔ Server running on http://localhost:${process.env.PORT}`);
