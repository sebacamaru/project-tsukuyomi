import { roomStore } from "../stores/room.js";
import { userStore } from "../stores/user.js";
import { validate } from "../validators/validate.js";
import { wsPlayerReadySchema } from "../validators/schemas.js";
import { wsErrorHandler } from "../utils/errorHandler.js";

function handlePlayerReady(ws, data) {
  // Validar datos
  const validation = validate(wsPlayerReadySchema, data);
  if (!validation.success) {
    ws.send(JSON.stringify({ type: "ERROR", message: validation.error }));
    return;
  }

  const { userId, battleId } = validation.data;
  const room = roomStore.get(battleId);

  // Verificar que la batalla existe
  if (!room) {
    ws.send(JSON.stringify({
      type: "ERROR",
      message: `La batalla ${battleId} no existe o ya finalizó`
    }));
    return;
  }

  // Verificar que el usuario pertenece a esta batalla
  if (!room.players.includes(userId)) {
    ws.send(JSON.stringify({
      type: "ERROR",
      message: "No perteneces a esta batalla"
    }));
    return;
  }

  const allReady = roomStore.setReady(battleId, userId);

  // Avisar progreso
  for (const p of room.players) {
    const socket = userStore.get(p);
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "BATTLE_READY_UPDATE",
          player: userId,
          readyState: room.ready,
          message: `Jugador ${userId} está listo`
        })
      );
    }
  }

  if (allReady) {
    for (const p of room.players) {
      const socket = userStore.get(p);
      if (socket) {
        socket.send(
          JSON.stringify({
            type: "BATTLE_START",
            battleId,
            message: "¡Que comience la batalla!"
          })
        );
      }
    }
  }
}

export function registerBattleHandlers(eventHandlers) {
  eventHandlers.set("PLAYER_READY", wsErrorHandler(handlePlayerReady));
}
