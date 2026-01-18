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
    .query("SELECT id, email, username, current_quest_code FROM users")
    .all();
  return rows;
};

export const getUserById = (id) => {
  return db
    .query(
      "SELECT id, email, username, current_quest_code FROM users WHERE id = ?",
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

export const checkUsernameAvailable = (username) => {
  const existing = db
    .query("SELECT id FROM users WHERE username = ?")
    .get(username);
  return !existing;
};

export const completeCurrentQuest = (userId) => {
  const user = getUserById(userId);
  if (!user || !user.current_quest_code) {
    return { success: false, error: "No active quest" };
  }

  // Buscar la siguiente quest
  const nextQuest = getNextQuest(user.current_quest_code);
  const nextQuestCode = nextQuest ? nextQuest.code : null;

  // Actualizar current_quest_code
  db.run(
    "UPDATE users SET current_quest_code = ? WHERE id = ?",
    nextQuestCode,
    userId,
  );

  return {
    success: true,
    completedQuest: user.current_quest_code,
    nextQuest: nextQuestCode,
  };
};
