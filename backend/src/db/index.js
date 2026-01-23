import Database from "bun:sqlite";

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
    next_quest_available_at INTEGER
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
          items: [{ itemName: "chigo_egg", quantity: 1 }],
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
    label TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    icon TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'misc'
  )`);

  // Migración: agregar columna stackable a items si no existe
  const itemColumns = db.query("PRAGMA table_info(items)").all();
  const hasStackable = itemColumns.some((col) => col.name === "stackable");
  if (!hasStackable) {
    db.run("ALTER TABLE items ADD COLUMN stackable INTEGER NOT NULL DEFAULT 1");
    // Items tipo egg y chigo no son stackeables
    db.run("UPDATE items SET stackable = 0 WHERE type IN ('egg', 'chigo')");
  }

  // Tabla User Items (inventario) - sin UNIQUE constraint para soportar items únicos
  db.run(`CREATE TABLE IF NOT EXISTS user_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    obtained_at INTEGER NOT NULL,
    uuid TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
  )`);

  // Migración: agregar columna uuid a user_items si no existe
  const userItemColumns = db.query("PRAGMA table_info(user_items)").all();
  const hasUuid = userItemColumns.some((col) => col.name === "uuid");
  if (!hasUuid) {
    db.run("ALTER TABLE user_items ADD COLUMN uuid TEXT");
  }

  // Migración: remover UNIQUE constraint de user_items si existe
  // SQLite no permite DROP CONSTRAINT, hay que recrear la tabla
  const tableInfo = db
    .query(
      "SELECT sql FROM sqlite_master WHERE type='table' AND name='user_items'",
    )
    .get();

  if (tableInfo && tableInfo.sql && tableInfo.sql.includes("UNIQUE")) {
    // Recrear tabla sin UNIQUE constraint
    db.run("BEGIN TRANSACTION");
    try {
      // Crear tabla temporal con nueva estructura
      db.run(`CREATE TABLE user_items_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        obtained_at INTEGER NOT NULL,
        uuid TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
      )`);

      // Copiar datos existentes
      db.run(`INSERT INTO user_items_new (id, user_id, item_id, quantity, obtained_at, uuid)
              SELECT id, user_id, item_id, quantity, obtained_at, uuid FROM user_items`);

      // Eliminar tabla vieja y renombrar nueva
      db.run("DROP TABLE user_items");
      db.run("ALTER TABLE user_items_new RENAME TO user_items");

      db.run("COMMIT");
    } catch (error) {
      db.run("ROLLBACK");
      throw error;
    }
  }

  // Índices para user_items
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_user_items_user_id ON user_items(user_id)",
  );
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_user_items_item_id ON user_items(item_id)",
  );
  db.run("CREATE INDEX IF NOT EXISTS idx_user_items_uuid ON user_items(uuid)");

  // Insertar datos iniciales de items si la tabla está vacía
  const count = db.query("SELECT COUNT(*) as count FROM items").get();
  if (count.count === 0) {
    const initialItems = [
      {
        name: "basic_potion",
        label: "Poción",
        description: "Restaura una pequeña cantidad de salud",
        price: 50,
        icon: "https://via.placeholder.com/64/3498db/ffffff?text=P",
        type: "potion",
        stackable: 1,
      },
      {
        name: "elixir",
        label: "Elixir",
        description: "Restaura salud y energía moderadamente",
        price: 120,
        icon: "https://via.placeholder.com/64/e74c3c/ffffff?text=E",
        type: "potion",
        stackable: 1,
      },
      {
        name: "phoenix_down",
        label: "Pluma de Fénix",
        description: "Revive a un compañero caído",
        price: 500,
        icon: "https://via.placeholder.com/64/f39c12/ffffff?text=PD",
        type: "potion",
        stackable: 1,
      },
      {
        name: "ether",
        label: "Éter",
        description: "Restaura energía mágica",
        price: 150,
        icon: "https://via.placeholder.com/64/9b59b6/ffffff?text=ET",
        type: "potion",
        stackable: 1,
      },
      {
        name: "chigo_egg",
        label: "Huevo Chigo",
        description: "Un misterioso huevo que contiene una criatura especial",
        price: 0,
        icon: "sprite-egg.png",
        type: "egg",
        stackable: 0,
      },
    ];

    initialItems.forEach((item) => {
      db.run(
        "INSERT INTO items (name, label, description, price, icon, type, stackable) VALUES (?, ?, ?, ?, ?, ?, ?)",
        item.name,
        item.label,
        item.description,
        item.price,
        item.icon,
        item.type,
        item.stackable,
      );
    });
  }
};
