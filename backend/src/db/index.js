import Database from "bun:sqlite";
import initialChigoSpecies from "./seeds/chigo_species.json";
import initialEggTypes from "./seeds/egg_types.json";
import initialCandyTypes from "./seeds/candy_types.json";
import initialStoneTypes from "./seeds/stone_types.json";

// Abrimos la base de datos SQLite (si no existe, se crea)
export const db = new Database("./src/db/database.db");

// Función para generar username temporal único
export const generateTempUsername = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "User_";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Función para inicializar todas las tablas
export const initDatabase = () => {
  // Tabla Users
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    current_quest_code TEXT,
    next_quest_available_at INTEGER,
    gold INTEGER NOT NULL DEFAULT 0
  )`);

  // Migraciones de users
  const userColumns = db.query("PRAGMA table_info(users)").all();

  // Migración: agregar columna next_quest_available_at si no existe
  const hasNextQuestAvailableAt = userColumns.some(
    (col) => col.name === "next_quest_available_at",
  );
  if (!hasNextQuestAvailableAt) {
    db.run("ALTER TABLE users ADD COLUMN next_quest_available_at INTEGER");
  }

  // Migración: agregar columna gold si no existe
  const hasGold = userColumns.some((col) => col.name === "gold");
  if (!hasGold) {
    db.run("ALTER TABLE users ADD COLUMN gold INTEGER NOT NULL DEFAULT 0");
  }

  // Tabla Quests
  db.run(`CREATE TABLE IF NOT EXISTS quests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    scene TEXT,
    prerequisite_quest_code TEXT,
    rewards_json TEXT
  )`);

  // Insertar quests iniciales si la tabla está vacía
  const questCount = db.query("SELECT COUNT(*) as count FROM quests").get();
  if (questCount.count === 0) {
    const initialQuests = [
      {
        code: "set_username",
        name: "Tu Nombre",
        description: "Elige cómo te llamarás en este mundo",
        type: "main",
        scene: "professor",
        prerequisite_quest_code: null,
        rewards_json: null,
      },
      {
        code: "onboarding",
        name: "Bienvenida al Mundo",
        description: "Conoce al Profesor y elige tu primer compañero",
        type: "main",
        scene: "professor",
        prerequisite_quest_code: "set_username",
        rewards_json: JSON.stringify({
          gold: 500,
          eggs: [{ eggTypeName: "wild", quantity: 1 }],
        }),
      },
    ];

    initialQuests.forEach((quest) => {
      db.run(
        "INSERT INTO quests (code, name, description, type, scene, prerequisite_quest_code, rewards_json) VALUES (?, ?, ?, ?, ?, ?, ?)",
        quest.code,
        quest.name,
        quest.description,
        quest.type,
        quest.scene,
        quest.prerequisite_quest_code,
        quest.rewards_json,
      );
    });
  }

  // Tabla Monsters (legacy - para sistema de batalla)
  db.run(`CREATE TABLE IF NOT EXISTS monsters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    attack INTEGER NOT NULL,
    defense INTEGER NOT NULL
  )`);

  // ============================================
  // TABLAS DE CATÁLOGO (definiciones estáticas)
  // ============================================

  // Tabla chigo_species - Especies de chigos
  db.run(`CREATE TABLE IF NOT EXISTS chigo_species (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL,
    element_type TEXT NOT NULL,
    base_hp INTEGER NOT NULL,
    base_atk INTEGER NOT NULL,
    base_def INTEGER NOT NULL,
    base_spd INTEGER NOT NULL,
    generation INTEGER NOT NULL DEFAULT 1
  )`);

  // Tabla egg_types - Tipos de huevos
  db.run(`CREATE TABLE IF NOT EXISTS egg_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL,
    generation INTEGER NOT NULL DEFAULT 1,
    possible_species TEXT
  )`);

  // Tabla candy_types - Tipos de caramelos
  db.run(`CREATE TABLE IF NOT EXISTS candy_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL,
    stat_affected TEXT NOT NULL,
    stat_amount INTEGER NOT NULL,
    price INTEGER NOT NULL DEFAULT 0
  )`);

  // Tabla stone_types - Piedras/habilidades elementales
  db.run(`CREATE TABLE IF NOT EXISTS stone_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL,
    element TEXT NOT NULL,
    effect_data TEXT,
    price INTEGER NOT NULL DEFAULT 0
  )`);

  // ============================================
  // TABLAS DE INSTANCIA (por usuario)
  // ============================================

  // Tabla user_chigos - Chigos del usuario (stats únicos)
  db.run(`CREATE TABLE IF NOT EXISTS user_chigos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    species_id INTEGER NOT NULL,
    nickname TEXT,
    hp INTEGER NOT NULL,
    atk INTEGER NOT NULL,
    def INTEGER NOT NULL,
    spd INTEGER NOT NULL,
    obtained_at INTEGER NOT NULL,
    hatched_from_egg_id TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (species_id) REFERENCES chigo_species(id)
  )`);

  // Tabla user_eggs - Huevos del usuario (con parámetros de cuidado)
  db.run(`CREATE TABLE IF NOT EXISTS user_eggs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    egg_type_id INTEGER NOT NULL,
    obtained_at INTEGER NOT NULL,
    incubator_started_at INTEGER,
    hatched_at INTEGER,
    care_params TEXT,
    status TEXT NOT NULL DEFAULT 'inventory',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (egg_type_id) REFERENCES egg_types(id)
  )`);

  // Tabla user_candies - Caramelos del usuario (cantidad por tipo)
  db.run(`CREATE TABLE IF NOT EXISTS user_candies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    candy_type_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    UNIQUE(user_id, candy_type_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (candy_type_id) REFERENCES candy_types(id)
  )`);

  // Tabla user_stones - Piedras del usuario (cantidad por tipo)
  db.run(`CREATE TABLE IF NOT EXISTS user_stones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    stone_type_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    UNIQUE(user_id, stone_type_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (stone_type_id) REFERENCES stone_types(id)
  )`);

  // Tabla chigo_stones - Piedras equipadas a chigos (permanente)
  db.run(`CREATE TABLE IF NOT EXISTS chigo_stones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chigo_id INTEGER NOT NULL,
    stone_type_id INTEGER NOT NULL,
    equipped_at INTEGER NOT NULL,
    FOREIGN KEY (chigo_id) REFERENCES user_chigos(id) ON DELETE CASCADE,
    FOREIGN KEY (stone_type_id) REFERENCES stone_types(id)
  )`);

  // ============================================
  // ÍNDICES
  // ============================================
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_user_chigos_user_id ON user_chigos(user_id)",
  );
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_user_chigos_species_id ON user_chigos(species_id)",
  );
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_user_eggs_user_id ON user_eggs(user_id)",
  );
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_user_eggs_status ON user_eggs(status)",
  );
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_chigo_stones_chigo_id ON chigo_stones(chigo_id)",
  );

  // ============================================
  // SINCRONIZAR SEEDS
  // ============================================

  // Sincronizar chigo_species desde JSON
  initialChigoSpecies.forEach((species) => {
    db.run(
      `INSERT INTO chigo_species (name, label, description, icon, element_type, base_hp, base_atk, base_def, base_spd, generation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(name) DO UPDATE SET
         label = excluded.label,
         description = excluded.description,
         icon = excluded.icon,
         element_type = excluded.element_type,
         base_hp = excluded.base_hp,
         base_atk = excluded.base_atk,
         base_def = excluded.base_def,
         base_spd = excluded.base_spd,
         generation = excluded.generation`,
      species.name,
      species.label,
      species.description,
      species.icon,
      species.element_type,
      species.base_hp,
      species.base_atk,
      species.base_def,
      species.base_spd,
      species.generation ?? 1,
    );
  });

  // Sincronizar egg_types desde JSON
  initialEggTypes.forEach((eggType) => {
    db.run(
      `INSERT INTO egg_types (name, label, description, icon, generation, possible_species)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(name) DO UPDATE SET
         label = excluded.label,
         description = excluded.description,
         icon = excluded.icon,
         generation = excluded.generation,
         possible_species = excluded.possible_species`,
      eggType.name,
      eggType.label,
      eggType.description,
      eggType.icon,
      eggType.generation ?? 1,
      eggType.possible_species
        ? JSON.stringify(eggType.possible_species)
        : null,
    );
  });

  // Sincronizar candy_types desde JSON
  initialCandyTypes.forEach((candy) => {
    db.run(
      `INSERT INTO candy_types (name, label, description, icon, stat_affected, stat_amount, price)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(name) DO UPDATE SET
         label = excluded.label,
         description = excluded.description,
         icon = excluded.icon,
         stat_affected = excluded.stat_affected,
         stat_amount = excluded.stat_amount,
         price = excluded.price`,
      candy.name,
      candy.label,
      candy.description,
      candy.icon,
      candy.stat_affected,
      candy.stat_amount,
      candy.price ?? 0,
    );
  });

  // Sincronizar stone_types desde JSON
  initialStoneTypes.forEach((stone) => {
    db.run(
      `INSERT INTO stone_types (name, label, description, icon, element, effect_data, price)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(name) DO UPDATE SET
         label = excluded.label,
         description = excluded.description,
         icon = excluded.icon,
         element = excluded.element,
         effect_data = excluded.effect_data,
         price = excluded.price`,
      stone.name,
      stone.label,
      stone.description,
      stone.icon,
      stone.element,
      stone.effect_data ? JSON.stringify(stone.effect_data) : null,
      stone.price ?? 0,
    );
  });
};
