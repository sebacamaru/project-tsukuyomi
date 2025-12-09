import { db } from "../index.js";

export const insertUser = (email, password, nickname) => {
  db.run(
    "INSERT INTO users (email, password, nickname) VALUES (?, ?, ?)",
    email,
    password,
    nickname,
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
