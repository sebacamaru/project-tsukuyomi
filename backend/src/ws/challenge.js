import { userStore } from "../stores/user.js";
import { roomStore } from "../stores/room.js";
import { validate } from "../validators/validate.js";
import { wsChallengeSchema } from "../validators/schemas.js";
import { wsErrorHandler } from "../utils/errorHandler.js";

function handleSendChallenge(ws, data) {
  // Validar datos
  const validation = validate(wsChallengeSchema, data);
  if (!validation.success) {
    ws.send(JSON.stringify({ type: "ERROR", message: validation.error }));
    return;
  }

  const { from, to } = validation.data;
  const targetWS = userStore.get(to);

  if (!targetWS) {
    ws.send(JSON.stringify({
      type: "ERROR",
      message: `El usuario ${to} no está conectado`
    }));
    return;
  }

  targetWS.send(
    JSON.stringify({
      type: "CHALLENGE_RECEIVED",
      from,
    })
  );

  // Confirmar al remitente que se envió el desafío
  ws.send(
    JSON.stringify({
      type: "CHALLENGE_SENT",
      to,
      message: "Desafío enviado exitosamente"
    })
  );
}

function handleAcceptChallenge(ws, data) {
  // Validar datos
  const validation = validate(wsChallengeSchema, data);
  if (!validation.success) {
    ws.send(JSON.stringify({ type: "ERROR", message: validation.error }));
    return;
  }

  const { from, to } = validation.data;

  // Verificar que ambos usuarios estén conectados
  const wsA = userStore.get(from);
  const wsB = userStore.get(to);

  if (!wsA) {
    ws.send(JSON.stringify({
      type: "ERROR",
      message: `El usuario ${from} ya no está conectado`
    }));
    return;
  }

  if (!wsB) {
    ws.send(JSON.stringify({
      type: "ERROR",
      message: `El usuario ${to} ya no está conectado`
    }));
    return;
  }

  // Crear room
  const battleId = "battle_" + Date.now();
  roomStore.create(battleId, [from, to]);

  // Avisar a ambos que empieza la selección
  for (const socket of [wsA, wsB]) {
    socket.send(
      JSON.stringify({
        type: "CHALLENGE_ACCEPTED",
        battleId,
        message: "¡Batalla creada! Selecciona tu monstruo"
      })
    );
  }
}

export function registerChallengeHandlers(eventHandlers) {
  eventHandlers.set("SEND_CHALLENGE", wsErrorHandler(handleSendChallenge));
  eventHandlers.set("ACCEPT_CHALLENGE", wsErrorHandler(handleAcceptChallenge));
}
