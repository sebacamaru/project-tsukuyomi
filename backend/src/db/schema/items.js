import { db } from "../index.js";

export const insertItem = (name, price, icon) => {
  db.run(
    "INSERT INTO items (name, price, icon) VALUES (?, ?, ?)",
    name,
    price,
    icon,
  );
};

// Obtener todos los items
export const getItems = () => {
  const rows = [...db.query("SELECT * FROM items")];
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    price: row.price,
    icon: row.icon,
  }));
};
