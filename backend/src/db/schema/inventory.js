import { db } from "../index.js";

/**
 * Obtiene el inventario completo de un usuario
 */
export const getUserInventory = (userId) => {
  return db
    .query(
      `
    SELECT
      ui.id,
      ui.item_id,
      ui.quantity,
      ui.obtained_at,
      i.name,
      i.label,
      i.description,
      i.price,
      i.icon,
      i.type
    FROM user_items ui
    JOIN items i ON ui.item_id = i.id
    WHERE ui.user_id = ?
    ORDER BY ui.obtained_at DESC
  `,
    )
    .all(userId);
};

/**
 * Agrega un item al inventario del usuario
 * Si ya existe, incrementa la cantidad
 */
export const addItemToInventory = (userId, itemId, quantity = 1) => {
  const existing = db
    .query(
      "SELECT id, quantity FROM user_items WHERE user_id = ? AND item_id = ?",
    )
    .get(userId, itemId);

  if (existing) {
    db.run(
      "UPDATE user_items SET quantity = quantity + ? WHERE id = ?",
      quantity,
      existing.id,
    );
    return { id: existing.id, newQuantity: existing.quantity + quantity };
  }

  const now = Math.floor(Date.now() / 1000);
  const result = db.run(
    "INSERT INTO user_items (user_id, item_id, quantity, obtained_at) VALUES (?, ?, ?, ?)",
    userId,
    itemId,
    quantity,
    now,
  );
  return { id: result.lastInsertRowid, newQuantity: quantity };
};

/**
 * Remueve items del inventario
 * Retorna false si no hay suficientes
 */
export const removeItemFromInventory = (userId, itemId, quantity = 1) => {
  const existing = db
    .query(
      "SELECT id, quantity FROM user_items WHERE user_id = ? AND item_id = ?",
    )
    .get(userId, itemId);

  if (!existing || existing.quantity < quantity) {
    return { success: false, error: "Not enough items" };
  }

  if (existing.quantity === quantity) {
    db.run("DELETE FROM user_items WHERE id = ?", existing.id);
  } else {
    db.run(
      "UPDATE user_items SET quantity = quantity - ? WHERE id = ?",
      quantity,
      existing.id,
    );
  }

  return { success: true, newQuantity: existing.quantity - quantity };
};

/**
 * Verifica si un usuario tiene un item específico
 */
export const hasItem = (userId, itemId, minQuantity = 1) => {
  const item = db
    .query("SELECT quantity FROM user_items WHERE user_id = ? AND item_id = ?")
    .get(userId, itemId);
  return item && item.quantity >= minQuantity;
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

/**
 * Obtiene un item por ID
 */
export const getItemById = (itemId) => {
  return db.query("SELECT * FROM items WHERE id = ?").get(itemId);
};

/**
 * Obtiene un item por nombre
 */
export const getItemByName = (name) => {
  return db.query("SELECT * FROM items WHERE name = ?").get(name);
};
