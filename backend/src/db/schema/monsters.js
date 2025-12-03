import { db } from "../index.js";

// Crear tabla Monsters si no existe
db.run(`CREATE TABLE IF NOT EXISTS monsters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  attack INTEGER NOT NULL,
  defense INTEGER NOT NULL
)`);

// Insertar monster
export const insertMonster = (name, attack, defense) => {
  db.run("INSERT INTO monsters (name, attack, defense) VALUES (?, ?, ?)", name, attack, defense);
};

// Obtener todos los monsters
export const getMonsters = () => {
  const rows = [...db.query("SELECT * FROM monsters")];
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    attack: row.attack,
    defense: row.defense,
  }));
};
