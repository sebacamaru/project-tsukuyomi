import { registerAuth } from "./auth.js";
import { registerUsers } from "./users.js";
import { registerMonsters } from "./monsters.js";
import { registerItems } from "./items.js";
import { registerQuests } from "./quests.js";
import { registerAdmin } from "./admin.js";
import { registerInventory } from "./inventory.js";

export function loadApiRoutes(router) {
  registerAuth(router);
  registerUsers(router);
  registerMonsters(router);
  registerItems(router);
  registerQuests(router);
  registerAdmin(router);
  registerInventory(router);
}
