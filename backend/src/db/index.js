import Database from "bun:sqlite";

// Abrimos la base de datos SQLite (si no existe, se crea)
export const db = new Database("./src/db/database.db");

// Función para inicializar todas las tablas
export const initDatabase = () => {
  // Tabla Users
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    nickname TEXT
  )`);

  // Tabla Monsters
  db.run(`CREATE TABLE IF NOT EXISTS monsters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    attack INTEGER NOT NULL,
    defense INTEGER NOT NULL
  )`);

  // Tabla Items
  db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    icon TEXT NOT NULL
  )`);

  // Insertar datos iniciales de items si la tabla está vacía
  const count = db.query("SELECT COUNT(*) as count FROM items").get();
  if (count.count === 0) {
    const initialItems = [
      {
        name: "Potion",
        price: 50,
        icon: "https://via.placeholder.com/64/3498db/ffffff?text=P",
      },
      {
        name: "Elixir",
        price: 120,
        icon: "https://via.placeholder.com/64/e74c3c/ffffff?text=E",
      },
      {
        name: "Phoenix Down",
        price: 500,
        icon: "https://via.placeholder.com/64/f39c12/ffffff?text=PD",
      },
      {
        name: "Ether",
        price: 150,
        icon: "https://via.placeholder.com/64/9b59b6/ffffff?text=ET",
      },
    ];

    initialItems.forEach((item) => {
      db.run(
        "INSERT INTO items (name, price, icon) VALUES (?, ?, ?)",
        item.name,
        item.price,
        item.icon,
      );
    });
  }
};
