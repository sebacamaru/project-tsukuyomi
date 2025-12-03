import { registerAuth } from "./auth.js";
import { registerUsers } from "./users.js";
import { registerMonsters } from "./monsters.js";

export function loadApiRoutes(router) {
  registerAuth(router);
  registerUsers(router);
  registerMonsters(router);
}
