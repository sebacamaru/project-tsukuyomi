import { db } from "../index.js";

// ============================================
// STONE TYPES (Catálogo)
// ============================================

/**
 * Obtiene todos los tipos de piedras
 */
export const getAllStoneTypes = () => {
  return db.query("SELECT * FROM stone_types ORDER BY element, name").all();
};

/**
 * Obtiene un tipo de piedra por ID
 */
export const getStoneTypeById = (id) => {
  return db.query("SELECT * FROM stone_types WHERE id = ?").get(id);
};

/**
 * Obtiene un tipo de piedra por nombre
 */
export const getStoneTypeByName = (name) => {
  return db.query("SELECT * FROM stone_types WHERE name = ?").get(name);
};

/**
 * Obtiene tipos de piedras por elemento
 */
export const getStoneTypesByElement = (element) => {
  return db
    .query("SELECT * FROM stone_types WHERE element = ? ORDER BY name")
    .all(element);
};

/**
 * Obtiene piedras comprables (price > 0)
 */
export const getBuyableStoneTypes = () => {
  return db
    .query("SELECT * FROM stone_types WHERE price > 0 ORDER BY price")
    .all();
};

/**
 * Crea un nuevo tipo de piedra (admin)
 */
export const createStoneType = (stone) => {
  const result = db.run(
    `INSERT INTO stone_types (name, label, description, icon, element, effect_data, price)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    stone.name,
    stone.label,
    stone.description,
    stone.icon,
    stone.element,
    stone.effect_data ? JSON.stringify(stone.effect_data) : null,
    stone.price ?? 0
  );
  return { id: result.lastInsertRowid, ...stone };
};

/**
 * Actualiza un tipo de piedra (admin)
 */
export const updateStoneType = (id, updates) => {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      if (key === "effect_data") {
        fields.push(`${key} = ?`);
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
  }

  if (fields.length === 0) return null;

  values.push(id);
  db.run(`UPDATE stone_types SET ${fields.join(", ")} WHERE id = ?`, ...values);
  return getStoneTypeById(id);
};

/**
 * Elimina un tipo de piedra (admin)
 */
export const deleteStoneType = (id) => {
  db.run("DELETE FROM stone_types WHERE id = ?", id);
};

/**
 * Parsea effect_data de una piedra
 */
export const parseEffectData = (stone) => {
  if (!stone.effect_data) return {};
  try {
    return JSON.parse(stone.effect_data);
  } catch {
    return {};
  }
};

// ============================================
// USER STONES (Inventario)
// ============================================

/**
 * Obtiene todas las piedras de un usuario
 */
export const getUserStones = (userId) => {
  return db
    .query(
      `SELECT
        us.id,
        us.quantity,
        st.id as stone_type_id,
        st.name,
        st.label,
        st.description,
        st.icon,
        st.element,
        st.effect_data,
        st.price
      FROM user_stones us
      JOIN stone_types st ON us.stone_type_id = st.id
      WHERE us.user_id = ?
      ORDER BY st.element, st.name`
    )
    .all(userId);
};

/**
 * Obtiene la cantidad de un tipo de piedra que tiene el usuario
 */
export const getUserStoneQuantity = (userId, stoneTypeId) => {
  const result = db
    .query("SELECT quantity FROM user_stones WHERE user_id = ? AND stone_type_id = ?")
    .get(userId, stoneTypeId);
  return result ? result.quantity : 0;
};

/**
 * Agrega piedras al inventario del usuario
 */
export const addStoneToUser = (userId, stoneTypeId, quantity = 1) => {
  const existing = db
    .query("SELECT id, quantity FROM user_stones WHERE user_id = ? AND stone_type_id = ?")
    .get(userId, stoneTypeId);

  if (existing) {
    db.run(
      "UPDATE user_stones SET quantity = quantity + ? WHERE id = ?",
      quantity,
      existing.id
    );
    return { success: true, newQuantity: existing.quantity + quantity };
  }

  const result = db.run(
    "INSERT INTO user_stones (user_id, stone_type_id, quantity) VALUES (?, ?, ?)",
    userId,
    stoneTypeId,
    quantity
  );
  return { success: true, id: result.lastInsertRowid, newQuantity: quantity };
};

/**
 * Remueve piedras del inventario del usuario
 */
export const removeStoneFromUser = (userId, stoneTypeId, quantity = 1) => {
  const existing = db
    .query("SELECT id, quantity FROM user_stones WHERE user_id = ? AND stone_type_id = ?")
    .get(userId, stoneTypeId);

  if (!existing || existing.quantity < quantity) {
    return { success: false, error: "Not enough stones" };
  }

  if (existing.quantity === quantity) {
    db.run("DELETE FROM user_stones WHERE id = ?", existing.id);
    return { success: true, newQuantity: 0 };
  }

  db.run(
    "UPDATE user_stones SET quantity = quantity - ? WHERE id = ?",
    quantity,
    existing.id
  );
  return { success: true, newQuantity: existing.quantity - quantity };
};

/**
 * Verifica si el usuario tiene suficientes piedras
 */
export const hasStone = (userId, stoneTypeId, minQuantity = 1) => {
  const quantity = getUserStoneQuantity(userId, stoneTypeId);
  return quantity >= minQuantity;
};
