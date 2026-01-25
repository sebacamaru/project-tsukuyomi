import { db, generateTempUsername } from "../index.js";
import { getNextQuest, getQuestByCode } from "./quests.js";
import { createUserEgg, getEggTypeByName, getEggTypeById } from "./eggs.js";
import {
  addCandyToUser,
  getCandyTypeByName,
  getCandyTypeById,
} from "./candies.js";
import {
  addStoneToUser,
  getStoneTypeByName,
  getStoneTypeById,
} from "./stones.js";

export const insertUser = (email, password) => {
  let username = generateTempUsername();
  // Asegurar que el username sea único
  while (db.query("SELECT id FROM users WHERE username = ?").get(username)) {
    username = generateTempUsername();
  }

  db.run(
    "INSERT INTO users (email, password, username, current_quest_code) VALUES (?, ?, ?, ?)",
    email,
    password,
    username,
    "set_username",
  );

  return db.query("SELECT * FROM users WHERE email = ?").get(email);
};

export const getUsers = () => {
  const rows = db
    .query(
      "SELECT id, email, username, current_quest_code, next_quest_available_at, gold FROM users",
    )
    .all();
  return rows;
};

export const getUserById = (id) => {
  return db
    .query(
      "SELECT id, email, username, current_quest_code, next_quest_available_at, gold FROM users WHERE id = ?",
    )
    .get(id);
};

export const getUserByEmail = (email) => {
  return db.query("SELECT * FROM users WHERE email = ?").get(email);
};

export const updateUsername = (userId, username) => {
  // Verificar si el username ya existe
  const existing = db
    .query("SELECT id FROM users WHERE username = ? AND id != ?")
    .get(username, userId);
  if (existing) {
    return { success: false, error: "Username already taken" };
  }

  db.run("UPDATE users SET username = ? WHERE id = ?", username, userId);
  return { success: true };
};

export const checkUsernameAvailable = (username, excludeUserId = null) => {
  let existing;
  if (excludeUserId) {
    existing = db
      .query("SELECT id FROM users WHERE username = ? AND id != ?")
      .get(username, excludeUserId);
  } else {
    existing = db
      .query("SELECT id FROM users WHERE username = ?")
      .get(username);
  }
  return !existing;
};

/**
 * Obtiene el oro de un usuario
 */
export const getUserGold = (userId) => {
  const user = db.query("SELECT gold FROM users WHERE id = ?").get(userId);
  return user ? user.gold : 0;
};

/**
 * Modifica el oro de un usuario (puede ser positivo o negativo)
 */
export const modifyUserGold = (userId, amount) => {
  const current = getUserGold(userId);
  const newAmount = current + amount;

  if (newAmount < 0) {
    return { success: false, error: "Not enough gold" };
  }

  db.run("UPDATE users SET gold = ? WHERE id = ?", newAmount, userId);
  return { success: true, newGold: newAmount };
};

export const completeCurrentQuest = (userId, delayMinutes = 0) => {
  const user = getUserById(userId);
  if (!user || !user.current_quest_code) {
    return { success: false, error: "No active quest" };
  }

  // Obtener quest actual para procesar recompensas
  const currentQuest = getQuestByCode(user.current_quest_code);

  // Procesar recompensas si existen
  let rewardsGiven = { gold: 0, items: [] };
  if (currentQuest && currentQuest.rewards_json) {
    try {
      const rewards = JSON.parse(currentQuest.rewards_json);
      rewardsGiven = processRewards(userId, rewards);
    } catch (e) {
      console.error("Error parsing rewards_json:", e);
    }
  }

  // Buscar la siguiente quest
  const nextQuest = getNextQuest(user.current_quest_code);
  const nextQuestCode = nextQuest ? nextQuest.code : null;

  // Calcular timestamp de disponibilidad si hay delay
  let nextQuestAvailableAt = null;
  if (delayMinutes > 0) {
    nextQuestAvailableAt = Math.floor(Date.now() / 1000) + delayMinutes * 60;
  }

  // Actualizar current_quest_code y next_quest_available_at
  db.run(
    "UPDATE users SET current_quest_code = ?, next_quest_available_at = ? WHERE id = ?",
    nextQuestCode,
    nextQuestAvailableAt,
    userId,
  );

  // Obtener usuario actualizado para retornar gold actual
  const updatedUser = getUserById(userId);

  return {
    success: true,
    completedQuest: user.current_quest_code,
    nextQuest: nextQuestCode,
    nextQuestAvailableAt,
    rewards: rewardsGiven,
    user: updatedUser,
  };
};

/**
 * Procesa las recompensas de una quest
 * Nuevo formato de rewards:
 * {
 *   gold: 500,
 *   eggs: [{ eggTypeName: "wild", quantity: 1 }],
 *   candies: [{ candyTypeName: "hp_candy_small", quantity: 5 }],
 *   stones: [{ stoneTypeName: "flame_burst", quantity: 1 }]
 * }
 */
function processRewards(userId, rewards) {
  const result = { gold: 0, eggs: [], candies: [], stones: [] };

  // Dar oro
  if (rewards.gold) {
    modifyUserGold(userId, rewards.gold);
    result.gold = rewards.gold;
  }

  // Dar huevos
  if (rewards.eggs && Array.isArray(rewards.eggs)) {
    for (const eggReward of rewards.eggs) {
      let eggType;

      if (eggReward.eggTypeId) {
        eggType = getEggTypeById(eggReward.eggTypeId);
      } else if (eggReward.eggTypeName) {
        eggType = getEggTypeByName(eggReward.eggTypeName);
      }

      if (eggType) {
        const quantity = eggReward.quantity || 1;
        for (let i = 0; i < quantity; i++) {
          const created = createUserEgg(userId, eggType.id);
          result.eggs.push({
            uuid: created.uuid,
            eggTypeId: eggType.id,
            name: eggType.name,
            label: eggType.label,
            icon: eggType.icon,
          });
        }
      }
    }
  }

  // Dar caramelos
  if (rewards.candies && Array.isArray(rewards.candies)) {
    for (const candyReward of rewards.candies) {
      let candyType;

      if (candyReward.candyTypeId) {
        candyType = getCandyTypeById(candyReward.candyTypeId);
      } else if (candyReward.candyTypeName) {
        candyType = getCandyTypeByName(candyReward.candyTypeName);
      }

      if (candyType) {
        const quantity = candyReward.quantity || 1;
        addCandyToUser(userId, candyType.id, quantity);
        result.candies.push({
          candyTypeId: candyType.id,
          name: candyType.name,
          label: candyType.label,
          icon: candyType.icon,
          quantity,
        });
      }
    }
  }

  // Dar piedras
  if (rewards.stones && Array.isArray(rewards.stones)) {
    for (const stoneReward of rewards.stones) {
      let stoneType;

      if (stoneReward.stoneTypeId) {
        stoneType = getStoneTypeById(stoneReward.stoneTypeId);
      } else if (stoneReward.stoneTypeName) {
        stoneType = getStoneTypeByName(stoneReward.stoneTypeName);
      }

      if (stoneType) {
        const quantity = stoneReward.quantity || 1;
        addStoneToUser(userId, stoneType.id, quantity);
        result.stones.push({
          stoneTypeId: stoneType.id,
          name: stoneType.name,
          label: stoneType.label,
          icon: stoneType.icon,
          quantity,
        });
      }
    }
  }

  return result;
}
