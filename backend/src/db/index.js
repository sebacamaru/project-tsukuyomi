import Database from "bun:sqlite";

// Abrimos la base de datos SQLite (si no existe, se crea)
export const db = new Database("./src/db/database.db");
