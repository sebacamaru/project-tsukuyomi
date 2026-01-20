import { db, generateTempUsername } from "../index.js";
import { getNextQuest } from "./quests.js";

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
      "SELECT id, email, username, current_quest_code, next_quest_available_at FROM users",
    )
    .all();
  return rows;
};

export const getUserById = (id) => {
  return db
    .query(
      "SELECT id, email, username, current_quest_code, next_quest_available_at FROM users WHERE id = ?",
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

export const completeCurrentQuest = (userId, delayMinutes = 0) => {
  const user = getUserById(userId);
  if (!user || !user.current_quest_code) {
    return { success: false, error: "No active quest" };
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

  return {
    success: true,
    completedQuest: user.current_quest_code,
    nextQuest: nextQuestCode,
    nextQuestAvailableAt,
  };
};
