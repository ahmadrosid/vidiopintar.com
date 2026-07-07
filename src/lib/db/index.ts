import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { env } from "../env/server";
import * as schema from "./schema";

declare global {
  var sqliteDb: Database.Database | undefined;
  var drizzleDb: ReturnType<typeof drizzle<typeof schema>> | undefined;
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

function getSqlite(): Database.Database {
  if (!global.sqliteDb) {
    global.sqliteDb = createDatabase();
  }
  return global.sqliteDb;
}

function getDrizzle() {
  if (!global.drizzleDb) {
    global.drizzleDb = drizzle(getSqlite(), { schema });
  }
  return global.drizzleDb;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop, receiver) {
    const instance = getDrizzle();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
