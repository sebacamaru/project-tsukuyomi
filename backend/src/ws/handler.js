import { eventHandlers } from "./index.js";
import { logger, logWsEvent, logError } from "../utils/logger.js";

/**
 * Parsea un mensaje WebSocket JSON
 * @param {string|object} rawMessage - Mensaje crudo (string o ya parseado)
 * @returns {{ success: boolean, data?: object, error?: Error }}
 */
function parseMessage(rawMessage) {
  try {
    // Si ya es un objeto, devolverlo directamente
    if (typeof rawMessage === 'object' && rawMessage !== null) {
      return { success: true, data: rawMessage };
    }

    // Si es string, parsear JSON
    const data = JSON.parse(rawMessage);
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Envía un mensaje de error al cliente WebSocket
 * @param {WebSocket} ws - Socket del cliente
 * @param {string} message - Mensaje de error
 */
function sendError(ws, message) {
  ws.send(JSON.stringify({ type: "ERROR", message }));
}

/**
 * Maneja un evento WebSocket
 * @param {WebSocket} ws - Socket del cliente
 * @param {string} type - Tipo de evento
 * @param {object} data - Datos del evento
 */
function handleEvent(ws, type, data) {
  const handler = eventHandlers.get(type);

  if (!handler) {
    logger.warn(`Unknown WS event: ${type}`);
    sendError(ws, `Unknown event ${type}`);
    return;
  }

  // Log evento recibido
  logWsEvent(type, data.userId || data.from || "unknown");

  // Ejecutar handler
  try {
    handler(ws, data);
  } catch (error) {
    logError(`WS Handler: ${type}`, error, { data });
    sendError(ws, "Internal server error");
  }
}

/**
 * Handler principal de mensajes WebSocket
 * Coordina el flujo: parseo → validación → ejecución
 * @param {WebSocket} ws - Socket del cliente
 * @param {string} rawMessage - Mensaje crudo recibido
 */
export function handleWsMessage(ws, rawMessage) {
  // 1. Parsear mensaje
  const parseResult = parseMessage(rawMessage);
  if (!parseResult.success) {
    logError("WS JSON Parse", parseResult.error);
    sendError(ws, "Invalid JSON");
    return;
  }

  // 2. Extraer tipo y datos
  const { type, ...data } = parseResult.data;

  if (!type) {
    logger.warn("WS message without type field");
    sendError(ws, "Message must include 'type' field");
    return;
  }

  // 3. Manejar evento
  handleEvent(ws, type, data);
}

/**
 * Handler de apertura de conexión WebSocket
 * @param {WebSocket} ws - Socket del cliente
 */
export function handleWsOpen(ws) {
  logger.info("✔ WS conectado");
  ws.send(JSON.stringify({ type: "WS_CONNECTED" }));
}

/**
 * Handler de cierre de conexión WebSocket
 * @param {WebSocket} ws - Socket del cliente
 */
export function handleWsClose(ws) {
  logger.info("❌ Cliente desconectado");
  // Aquí podrías agregar lógica para limpiar el userStore
}
