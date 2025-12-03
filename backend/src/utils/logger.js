import pino from "pino";

/**
 * Logger estructurado con Pino
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

/**
 * Logger para requests HTTP
 */
export function logRequest(method, path, status, duration) {
  logger.info(
    {
      type: "http",
      method,
      path,
      status,
      duration: `${duration}ms`,
    },
    `${method} ${path} ${status}`
  );
}

/**
 * Logger para eventos WebSocket
 */
export function logWsEvent(event, userId, success = true) {
  logger.info(
    {
      type: "websocket",
      event,
      userId,
      success,
    },
    `WS: ${event} (user: ${userId})`
  );
}

/**
 * Logger para errores
 */
export function logError(context, error, metadata = {}) {
  logger.error(
    {
      context,
      error: error.message,
      stack: error.stack,
      ...metadata,
    },
    `Error en ${context}: ${error.message}`
  );
}

/**
 * Logger para cache
 */
export function logCache(operation, key, hit = null) {
  const message = hit !== null ? (hit ? "HIT" : "MISS") : operation.toUpperCase();

  logger.debug(
    {
      type: "cache",
      operation,
      key,
      hit,
    },
    `Cache ${message}: ${key}`
  );
}
