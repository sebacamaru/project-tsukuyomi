import { userStore } from "../stores/user.js";
import { validate } from "../validators/validate.js";
import { wsLoginSchema } from "../validators/schemas.js";
import { wsErrorHandler } from "../utils/errorHandler.js";

function handleLogin(ws, data) {
  // Validar datos
  const validation = validate(wsLoginSchema, data);
  if (!validation.success) {
    ws.send(JSON.stringify({
      type: "ERROR",
      message: validation.error
    }));
    return;
  }

  const { userId } = validation.data;

  // Verificar si el usuario ya está conectado
  const existingSocket = userStore.get(userId);
  if (existingSocket && existingSocket !== ws) {
    ws.send(JSON.stringify({
      type: "ERROR",
      message: "Este usuario ya está conectado en otra sesión"
    }));
    return;
  }

  userStore.add(userId, ws);

  ws.send(
    JSON.stringify({
      type: "LOGIN_OK",
      userId,
      message: `Bienvenido, usuario ${userId}`
    })
  );
}

export function registerLoginHandlers(eventHandlers) {
  eventHandlers.set("LOGIN", wsErrorHandler(handleLogin));
}
