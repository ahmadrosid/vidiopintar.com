import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { env } from "../env/server";
import * as schema from "./schema";

declare global {
  var sqliteDb: Database.Database | undefined;
}

function createDatabase(): Database.Database {
  const dbPath = path.resolve(env.SQLITE_DATABASE_PATH);
  mkdirSync(path.dirname(dbPath), { recursive: true });

  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("busy_timeout = 5000");
  sqlite.pragma("foreign_keys = ON");

  return sqlite;
}

const sqlite =
  env.NODE_ENV === "production"
    ? createDatabase()
    : (global.sqliteDb ??= createDatabase());

export const db = drizzle(sqlite, { schema });
