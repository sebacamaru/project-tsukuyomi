import { registerAuth } from "./auth.js";
import { registerUsers } from "./users.js";
import { registerMonsters } from "./monsters.js";
import { registerQuests } from "./quests.js";
import { registerAdmin } from "./admin.js";
import { registerInventory } from "./inventory.js";
import { registerEggs } from "./eggs.js";
import { registerCandies } from "./candies.js";
import { registerStones } from "./stones.js";
import { registerChigos } from "./chigos.js";

export function loadApiRoutes(router) {
  registerAuth(router);
  registerUsers(router);
  registerMonsters(router);
  registerQuests(router);
  registerAdmin(router);
  registerInventory(router);
  registerEggs(router);
  registerCandies(router);
  registerStones(router);
  registerChigos(router);
}
