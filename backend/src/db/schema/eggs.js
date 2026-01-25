import { db } from "../index.js";

// ============================================
// EGG TYPES (Catálogo)
// ============================================

/**
 * Obtiene todos los tipos de huevos
 */
export const getAllEggTypes = () => {
  return db.query("SELECT * FROM egg_types ORDER BY generation, name").all();
};

/**
 * Obtiene un tipo de huevo por ID
 */
export const getEggTypeById = (id) => {
  return db.query("SELECT * FROM egg_types WHERE id = ?").get(id);
};

/**
 * Obtiene un tipo de huevo por nombre
 */
export const getEggTypeByName = (name) => {
  return db.query("SELECT * FROM egg_types WHERE name = ?").get(name);
};

/**
 * Obtiene tipos de huevos por generación
 */
export const getEggTypesByGeneration = (generation) => {
  return db
    .query("SELECT * FROM egg_types WHERE generation = ? ORDER BY name")
    .all(generation);
};

/**
 * Crea un nuevo tipo de huevo (admin)
 */
export const createEggType = (eggType) => {
  const result = db.run(
    `INSERT INTO egg_types (name, label, description, icon, generation, possible_species)
     VALUES (?, ?, ?, ?, ?, ?)`,
    eggType.name,
    eggType.label,
    eggType.description,
    eggType.icon,
    eggType.generation ?? 1,
    eggType.possible_species ? JSON.stringify(eggType.possible_species) : null
  );
  return { id: result.lastInsertRowid, ...eggType };
};

/**
 * Actualiza un tipo de huevo (admin)
 */
export const updateEggType = (id, updates) => {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      if (key === "possible_species") {
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
  db.run(`UPDATE egg_types SET ${fields.join(", ")} WHERE id = ?`, ...values);
  return getEggTypeById(id);
};

/**
 * Elimina un tipo de huevo (admin)
 */
export const deleteEggType = (id) => {
  db.run("DELETE FROM egg_types WHERE id = ?", id);
};

// ============================================
// USER EGGS (Instancias)
// ============================================

/**
 * Obtiene todos los huevos de un usuario
 */
export const getUserEggs = (userId, status = null) => {
  let query = `
    SELECT
      ue.*,
      et.name as type_name,
      et.label as type_label,
      et.description as type_description,
      et.icon,
      et.generation,
      et.possible_species
    FROM user_eggs ue
    JOIN egg_types et ON ue.egg_type_id = et.id
    WHERE ue.user_id = ?
  `;

  const params = [userId];

  if (status) {
    query += " AND ue.status = ?";
    params.push(status);
  }

  query += " ORDER BY ue.obtained_at DESC";

  return db.query(query).all(...params);
};

/**
 * Obtiene un huevo por UUID
 */
export const getEggByUuid = (uuid) => {
  return db
    .query(
      `SELECT
        ue.*,
        et.name as type_name,
        et.label as type_label,
        et.description as type_description,
        et.icon,
        et.generation,
        et.possible_species
      FROM user_eggs ue
      JOIN egg_types et ON ue.egg_type_id = et.id
      WHERE ue.uuid = ?`
    )
    .get(uuid);
};

/**
 * Obtiene un huevo por ID
 */
export const getEggById = (id) => {
  return db
    .query(
      `SELECT
        ue.*,
        et.name as type_name,
        et.label as type_label,
        et.icon,
        et.possible_species
      FROM user_eggs ue
      JOIN egg_types et ON ue.egg_type_id = et.id
      WHERE ue.id = ?`
    )
    .get(id);
};

/**
 * Crea un nuevo huevo para un usuario
 */
export const createUserEgg = (userId, eggTypeId) => {
  const uuid = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);

  const result = db.run(
    `INSERT INTO user_eggs (uuid, user_id, egg_type_id, obtained_at, status)
     VALUES (?, ?, ?, ?, 'inventory')`,
    uuid,
    userId,
    eggTypeId,
    now
  );

  return { id: result.lastInsertRowid, uuid };
};

/**
 * Inicia la incubación de un huevo
 */
export const startIncubation = (eggId, initialCareParams = {}) => {
  const now = Math.floor(Date.now() / 1000);

  db.run(
    `UPDATE user_eggs
     SET status = 'incubating',
         incubator_started_at = ?,
         care_params = ?
     WHERE id = ?`,
    now,
    JSON.stringify(initialCareParams),
    eggId
  );

  return getEggById(eggId);
};

/**
 * Actualiza los parámetros de cuidado de un huevo
 */
export const updateCareParams = (eggId, careParams) => {
  db.run(
    "UPDATE user_eggs SET care_params = ? WHERE id = ?",
    JSON.stringify(careParams),
    eggId
  );
  return getEggById(eggId);
};

/**
 * Marca un huevo como eclosionado
 */
export const markAsHatched = (eggId) => {
  const now = Math.floor(Date.now() / 1000);

  db.run(
    `UPDATE user_eggs
     SET status = 'hatched', hatched_at = ?
     WHERE id = ?`,
    now,
    eggId
  );

  return getEggById(eggId);
};

/**
 * Elimina un huevo
 */
export const deleteUserEgg = (eggId) => {
  db.run("DELETE FROM user_eggs WHERE id = ?", eggId);
};

/**
 * Cuenta los huevos de un usuario (opcionalmente por status)
 */
export const countUserEggs = (userId, status = null) => {
  let query = "SELECT COUNT(*) as count FROM user_eggs WHERE user_id = ?";
  const params = [userId];

  if (status) {
    query += " AND status = ?";
    params.push(status);
  }

  const result = db.query(query).get(...params);
  return result.count;
};

/**
 * Obtiene huevos que están incubando
 */
export const getIncubatingEggs = (userId) => {
  return getUserEggs(userId, "incubating");
};

/**
 * Parsea los care_params de un huevo
 */
export const parseCareParams = (egg) => {
  if (!egg.care_params) return {};
  try {
    return JSON.parse(egg.care_params);
  } catch {
    return {};
  }
};

/**
 * Parsea possible_species de un tipo de huevo
 */
export const parsePossibleSpecies = (eggType) => {
  if (!eggType.possible_species) return [];
  try {
    return JSON.parse(eggType.possible_species);
  } catch {
    return [];
  }
};
