import { registerLoginHandlers } from "./login.js";
import { registerChallengeHandlers } from "./challenge.js";
import { registerBattleHandlers } from "./battle.js";

export const eventHandlers = new Map();

export function loadWsHandlers() {
  registerLoginHandlers(eventHandlers);
  registerChallengeHandlers(eventHandlers);
  registerBattleHandlers(eventHandlers);
}
