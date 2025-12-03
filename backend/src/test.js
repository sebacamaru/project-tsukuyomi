import { insertUser, getUsers } from "./db/schema/users.js";
import { insertMonster, getMonsters } from "./db/schema/monsters.js";

function main() {
  // Consultar datos
  const users = getUsers();
  const monsters = getMonsters();

  console.log("Usuarios:", users);
  console.log("Monstruos:", monsters);
}

main();
