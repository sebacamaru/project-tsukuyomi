import { db } from "../index.js";

// ============================================
// CANDY TYPES (Catálogo)
// ============================================

/**
 * Obtiene todos los tipos de caramelos
 */
export const getAllCandyTypes = () => {
  return db.query("SELECT * FROM candy_types ORDER BY stat_affected, stat_amount").all();
};

/**
 * Obtiene un tipo de caramelo por ID
 */
export const getCandyTypeById = (id) => {
  return db.query("SELECT * FROM candy_types WHERE id = ?").get(id);
};

/**
 * Obtiene un tipo de caramelo por nombre
 */
export const getCandyTypeByName = (name) => {
  return db.query("SELECT * FROM candy_types WHERE name = ?").get(name);
};

/**
 * Obtiene tipos de caramelos por stat afectado
 */
export const getCandyTypesByStat = (stat) => {
  return db
    .query("SELECT * FROM candy_types WHERE stat_affected = ? ORDER BY stat_amount")
    .all(stat);
};

/**
 * Obtiene caramelos comprables (price > 0)
 */
export const getBuyableCandyTypes = () => {
  return db
    .query("SELECT * FROM candy_types WHERE price > 0 ORDER BY price")
    .all();
};

/**
 * Crea un nuevo tipo de caramelo (admin)
 */
export const createCandyType = (candy) => {
  const result = db.run(
    `INSERT INTO candy_types (name, label, description, icon, stat_affected, stat_amount, price)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    candy.name,
    candy.label,
    candy.description,
    candy.icon,
    candy.stat_affected,
    candy.stat_amount,
    candy.price ?? 0
  );
  return { id: result.lastInsertRowid, ...candy };
};

/**
 * Actualiza un tipo de caramelo (admin)
 */
export const updateCandyType = (id, updates) => {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) return null;

  values.push(id);
  db.run(`UPDATE candy_types SET ${fields.join(", ")} WHERE id = ?`, ...values);
  return getCandyTypeById(id);
};

/**
 * Elimina un tipo de caramelo (admin)
 */
export const deleteCandyType = (id) => {
  db.run("DELETE FROM candy_types WHERE id = ?", id);
};

// ============================================
// USER CANDIES (Inventario)
// ============================================

/**
 * Obtiene todos los caramelos de un usuario
 */
export const getUserCandies = (userId) => {
  return db
    .query(
      `SELECT
        uc.id,
        uc.quantity,
        ct.id as candy_type_id,
        ct.name,
        ct.label,
        ct.description,
        ct.icon,
        ct.stat_affected,
        ct.stat_amount,
        ct.price
      FROM user_candies uc
      JOIN candy_types ct ON uc.candy_type_id = ct.id
      WHERE uc.user_id = ?
      ORDER BY ct.stat_affected, ct.stat_amount`
    )
    .all(userId);
};

/**
 * Obtiene la cantidad de un tipo de caramelo que tiene el usuario
 */
export const getUserCandyQuantity = (userId, candyTypeId) => {
  const result = db
    .query("SELECT quantity FROM user_candies WHERE user_id = ? AND candy_type_id = ?")
    .get(userId, candyTypeId);
  return result ? result.quantity : 0;
};

/**
 * Agrega caramelos al inventario del usuario
 */
export const addCandyToUser = (userId, candyTypeId, quantity = 1) => {
  const existing = db
    .query("SELECT id, quantity FROM user_candies WHERE user_id = ? AND candy_type_id = ?")
    .get(userId, candyTypeId);

  if (existing) {
    db.run(
      "UPDATE user_candies SET quantity = quantity + ? WHERE id = ?",
      quantity,
      existing.id
    );
    return { success: true, newQuantity: existing.quantity + quantity };
  }

  const result = db.run(
    "INSERT INTO user_candies (user_id, candy_type_id, quantity) VALUES (?, ?, ?)",
    userId,
    candyTypeId,
    quantity
  );
  return { success: true, id: result.lastInsertRowid, newQuantity: quantity };
};

/**
 * Remueve caramelos del inventario del usuario
 */
export const removeCandyFromUser = (userId, candyTypeId, quantity = 1) => {
  const existing = db
    .query("SELECT id, quantity FROM user_candies WHERE user_id = ? AND candy_type_id = ?")
    .get(userId, candyTypeId);

  if (!existing || existing.quantity < quantity) {
    return { success: false, error: "Not enough candies" };
  }

  if (existing.quantity === quantity) {
    db.run("DELETE FROM user_candies WHERE id = ?", existing.id);
    return { success: true, newQuantity: 0 };
  }

  db.run(
    "UPDATE user_candies SET quantity = quantity - ? WHERE id = ?",
    quantity,
    existing.id
  );
  return { success: true, newQuantity: existing.quantity - quantity };
};

/**
 * Verifica si el usuario tiene suficientes caramelos
 */
export const hasCandy = (userId, candyTypeId, minQuantity = 1) => {
  const quantity = getUserCandyQuantity(userId, candyTypeId);
  return quantity >= minQuantity;
};
