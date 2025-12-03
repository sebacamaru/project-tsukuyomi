import { db } from "../index.js";

// Crear tabla Users si no existe
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  nickname TEXT
)`);

export const insertUser = (email, password, nickname) => {
  db.run(
    "INSERT INTO users (email, password, nickname) VALUES (?, ?, ?)",
    email,
    password,
    nickname
  );
};

export const getUsers = () => {
  const rows = [...db.query("SELECT * FROM users")];

  if (!rows.length) return [];

  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    password: row.password,
    nickname: row.nickname,
  }));
};
