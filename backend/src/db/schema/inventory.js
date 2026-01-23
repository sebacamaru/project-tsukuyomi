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
      ui.uuid,
      i.name,
      i.label,
      i.description,
      i.price,
      i.icon,
      i.type,
      i.stackable
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
 * - Items stackeables: incrementa quantity si ya existe
 * - Items únicos: crea un nuevo registro con uuid
 */
export const addItemToInventory = (userId, itemId, quantity = 1) => {
  const item = getItemById(itemId);

  if (!item) {
    return { success: false, error: "Item not found" };
  }

  const now = Math.floor(Date.now() / 1000);

  if (item.stackable) {
    // Item stackeable: buscar existente y sumar
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
      return {
        success: true,
        id: existing.id,
        newQuantity: existing.quantity + quantity,
      };
    }

    // Insert nuevo registro stackeable
    const result = db.run(
      "INSERT INTO user_items (user_id, item_id, quantity, obtained_at) VALUES (?, ?, ?, ?)",
      userId,
      itemId,
      quantity,
      now,
    );
    return { success: true, id: result.lastInsertRowid, newQuantity: quantity };
  } else {
    // Item único: insertar N registros con uuid
    const results = [];
    for (let i = 0; i < quantity; i++) {
      const uuid = crypto.randomUUID();
      const result = db.run(
        "INSERT INTO user_items (user_id, item_id, quantity, obtained_at, uuid) VALUES (?, ?, 1, ?, ?)",
        userId,
        itemId,
        now + i, // Incrementar timestamp para orden consistente
        uuid,
      );
      results.push({ id: result.lastInsertRowid, uuid });
    }
    return { success: true, ids: results, newQuantity: quantity };
  }
};

/**
 * Remueve items del inventario
 * - Items stackeables: decrementa quantity o elimina si llega a 0
 * - Items únicos: elimina por uuid o los más antiguos
 * Retorna false si no hay suficientes
 */
export const removeItemFromInventory = (
  userId,
  itemId,
  quantity = 1,
  uuid = null,
) => {
  const item = getItemById(itemId);

  if (!item) {
    return { success: false, error: "Item not found" };
  }

  if (item.stackable) {
    // Comportamiento original para items stackeables
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
  } else {
    // Item único: eliminar por uuid o los más antiguos
    if (uuid) {
      // Eliminar item específico por uuid
      const existing = db
        .query("SELECT id FROM user_items WHERE user_id = ? AND uuid = ?")
        .get(userId, uuid);

      if (!existing) {
        return { success: false, error: "Item not found" };
      }

      db.run("DELETE FROM user_items WHERE id = ?", existing.id);
      return { success: true, removedUuid: uuid };
    } else {
      // Verificar que hay suficientes
      const count = db
        .query(
          "SELECT COUNT(*) as count FROM user_items WHERE user_id = ? AND item_id = ?",
        )
        .get(userId, itemId);

      if (count.count < quantity) {
        return { success: false, error: "Not enough items" };
      }

      // Eliminar los N más antiguos
      const toDelete = db
        .query(
          `SELECT id FROM user_items
           WHERE user_id = ? AND item_id = ?
           ORDER BY obtained_at ASC LIMIT ?`,
        )
        .all(userId, itemId, quantity);

      for (const row of toDelete) {
        db.run("DELETE FROM user_items WHERE id = ?", row.id);
      }

      return { success: true, removedCount: quantity };
    }
  }
};

/**
 * Verifica si un usuario tiene un item específico
 */
export const hasItem = (userId, itemId, minQuantity = 1) => {
  const item = getItemById(itemId);

  if (!item) return false;

  if (item.stackable) {
    const userItem = db
      .query(
        "SELECT quantity FROM user_items WHERE user_id = ? AND item_id = ?",
      )
      .get(userId, itemId);
    return userItem && userItem.quantity >= minQuantity;
  } else {
    // Para items únicos, contar registros
    const count = db
      .query(
        "SELECT COUNT(*) as count FROM user_items WHERE user_id = ? AND item_id = ?",
      )
      .get(userId, itemId);
    return count.count >= minQuantity;
  }
};

/**
 * Obtiene la cantidad total de un item que tiene el usuario
 */
export const getItemQuantity = (userId, itemId) => {
  const item = getItemById(itemId);

  if (!item) return 0;

  if (item.stackable) {
    const userItem = db
      .query(
        "SELECT quantity FROM user_items WHERE user_id = ? AND item_id = ?",
      )
      .get(userId, itemId);
    return userItem ? userItem.quantity : 0;
  } else {
    // Para items únicos, contar registros
    const count = db
      .query(
        "SELECT COUNT(*) as count FROM user_items WHERE user_id = ? AND item_id = ?",
      )
      .get(userId, itemId);
    return count.count;
  }
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
