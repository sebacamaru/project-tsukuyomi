import { logError } from "./logger.js";

/**
 * Wrapper para manejar errores en handlers async
 * @param {Function} handler - Handler async
 * @returns {Function} - Handler envuelto con try/catch
 */
export function asyncHandler(handler) {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      logError("API Handler", error);

      // Determinar status code
      let status = 500;
      let message = "Error interno del servidor";

      if (error.message.includes("UNIQUE constraint failed")) {
        status = 409;
        message = "El recurso ya existe";
      } else if (error.message.includes("NOT NULL constraint failed")) {
        status = 400;
        message = "Faltan campos requeridos";
      } else if (error.message.includes("FOREIGN KEY constraint failed")) {
        status = 400;
        message = "Referencia inválida";
      }

      return Response.json(
        { error: message, details: process.env.NODE_ENV === "development" ? error.message : undefined },
        { status }
      );
    }
  };
}

/**
 * Handler de errores para WebSocket
 * @param {Function} handler - Handler de WS
 * @returns {Function} - Handler envuelto con try/catch
 */
export function wsErrorHandler(handler) {
  return (ws, data) => {
    try {
      return handler(ws, data);
    } catch (error) {
      logError("WS Handler", error, { data });
      ws.send(
        JSON.stringify({
          type: "ERROR",
          message: "Error procesando evento",
          details: process.env.NODE_ENV === "development" ? error.message : undefined,
        })
      );
    }
  };
}
