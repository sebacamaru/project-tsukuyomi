import { db } from "../index.js";

// ============================================
// CHIGO SPECIES (Catálogo)
// ============================================

/**
 * Obtiene todas las especies de chigos
 */
export const getAllSpecies = () => {
  return db.query("SELECT * FROM chigo_species ORDER BY generation, name").all();
};

/**
 * Obtiene una especie por ID
 */
export const getSpeciesById = (id) => {
  return db.query("SELECT * FROM chigo_species WHERE id = ?").get(id);
};

/**
 * Obtiene una especie por nombre
 */
export const getSpeciesByName = (name) => {
  return db.query("SELECT * FROM chigo_species WHERE name = ?").get(name);
};

/**
 * Obtiene especies por generación
 */
export const getSpeciesByGeneration = (generation) => {
  return db
    .query("SELECT * FROM chigo_species WHERE generation = ? ORDER BY name")
    .all(generation);
};

/**
 * Obtiene especies por elemento
 */
export const getSpeciesByElement = (elementType) => {
  return db
    .query("SELECT * FROM chigo_species WHERE element_type = ? ORDER BY name")
    .all(elementType);
};

/**
 * Crea una nueva especie (admin)
 */
export const createSpecies = (species) => {
  const result = db.run(
    `INSERT INTO chigo_species (name, label, description, icon, element_type, base_hp, base_atk, base_def, base_spd, generation)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    species.name,
    species.label,
    species.description,
    species.icon,
    species.element_type,
    species.base_hp,
    species.base_atk,
    species.base_def,
    species.base_spd,
    species.generation ?? 1
  );
  return { id: result.lastInsertRowid, ...species };
};

/**
 * Actualiza una especie (admin)
 */
export const updateSpecies = (id, updates) => {
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
  db.run(`UPDATE chigo_species SET ${fields.join(", ")} WHERE id = ?`, ...values);
  return getSpeciesById(id);
};

/**
 * Elimina una especie (admin)
 */
export const deleteSpecies = (id) => {
  db.run("DELETE FROM chigo_species WHERE id = ?", id);
};

// ============================================
// USER CHIGOS (Instancias)
// ============================================

/**
 * Obtiene todos los chigos de un usuario
 */
export const getUserChigos = (userId) => {
  return db
    .query(
      `SELECT
        uc.*,
        cs.name as species_name,
        cs.label as species_label,
        cs.description as species_description,
        cs.icon,
        cs.element_type,
        cs.base_hp,
        cs.base_atk,
        cs.base_def,
        cs.base_spd,
        cs.generation
      FROM user_chigos uc
      JOIN chigo_species cs ON uc.species_id = cs.id
      WHERE uc.user_id = ?
      ORDER BY uc.obtained_at DESC`
    )
    .all(userId);
};

/**
 * Obtiene un chigo por UUID
 */
export const getChigoByUuid = (uuid) => {
  return db
    .query(
      `SELECT
        uc.*,
        cs.name as species_name,
        cs.label as species_label,
        cs.description as species_description,
        cs.icon,
        cs.element_type,
        cs.base_hp,
        cs.base_atk,
        cs.base_def,
        cs.base_spd,
        cs.generation
      FROM user_chigos uc
      JOIN chigo_species cs ON uc.species_id = cs.id
      WHERE uc.uuid = ?`
    )
    .get(uuid);
};

/**
 * Obtiene un chigo por ID
 */
export const getChigoById = (id) => {
  return db
    .query(
      `SELECT
        uc.*,
        cs.name as species_name,
        cs.label as species_label,
        cs.icon,
        cs.element_type
      FROM user_chigos uc
      JOIN chigo_species cs ON uc.species_id = cs.id
      WHERE uc.id = ?`
    )
    .get(id);
};

/**
 * Crea un nuevo chigo para un usuario
 * Los stats pueden variar de los base según cuidados del huevo
 */
export const createUserChigo = (userId, speciesId, stats, hatchedFromEggId = null) => {
  const uuid = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);

  const result = db.run(
    `INSERT INTO user_chigos (uuid, user_id, species_id, nickname, hp, atk, def, spd, obtained_at, hatched_from_egg_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    uuid,
    userId,
    speciesId,
    stats.nickname ?? null,
    stats.hp,
    stats.atk,
    stats.def,
    stats.spd,
    now,
    hatchedFromEggId
  );

  return { id: result.lastInsertRowid, uuid };
};

/**
 * Actualiza el nickname de un chigo
 */
export const updateChigoNickname = (chigoId, nickname) => {
  db.run("UPDATE user_chigos SET nickname = ? WHERE id = ?", nickname, chigoId);
};

/**
 * Modifica stats de un chigo (ej: al usar caramelos)
 */
export const modifyChigoStats = (chigoId, statChanges) => {
  const fields = [];
  const values = [];

  for (const [stat, amount] of Object.entries(statChanges)) {
    if (["hp", "atk", "def", "spd"].includes(stat)) {
      fields.push(`${stat} = ${stat} + ?`);
      values.push(amount);
    }
  }

  if (fields.length === 0) return null;

  values.push(chigoId);
  db.run(`UPDATE user_chigos SET ${fields.join(", ")} WHERE id = ?`, ...values);
  return getChigoById(chigoId);
};

/**
 * Elimina un chigo (liberar)
 */
export const deleteUserChigo = (chigoId) => {
  db.run("DELETE FROM user_chigos WHERE id = ?", chigoId);
};

/**
 * Cuenta los chigos de un usuario
 */
export const countUserChigos = (userId) => {
  const result = db
    .query("SELECT COUNT(*) as count FROM user_chigos WHERE user_id = ?")
    .get(userId);
  return result.count;
};

// ============================================
// CHIGO STONES (Habilidades equipadas)
// ============================================

/**
 * Obtiene las piedras equipadas de un chigo
 */
export const getChigoStones = (chigoId) => {
  return db
    .query(
      `SELECT
        cs.*,
        st.name,
        st.label,
        st.description,
        st.icon,
        st.element,
        st.effect_data
      FROM chigo_stones cs
      JOIN stone_types st ON cs.stone_type_id = st.id
      WHERE cs.chigo_id = ?
      ORDER BY cs.equipped_at`
    )
    .all(chigoId);
};

/**
 * Equipa una piedra a un chigo (permanente)
 */
export const equipStone = (chigoId, stoneTypeId) => {
  const now = Math.floor(Date.now() / 1000);
  const result = db.run(
    "INSERT INTO chigo_stones (chigo_id, stone_type_id, equipped_at) VALUES (?, ?, ?)",
    chigoId,
    stoneTypeId,
    now
  );
  return { id: result.lastInsertRowid };
};

/**
 * Cuenta piedras equipadas en un chigo
 */
export const countChigoStones = (chigoId) => {
  const result = db
    .query("SELECT COUNT(*) as count FROM chigo_stones WHERE chigo_id = ?")
    .get(chigoId);
  return result.count;
};
