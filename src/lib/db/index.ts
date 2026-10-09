import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import * as schema from "./schema";
import { resolveDatabasePath } from "./database-path";

declare global {
  var sqliteDb: Database.Database | undefined;
  var drizzleDb: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

function createDatabase(): Database.Database {
  const dbPath = resolveDatabasePath();
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

// SAFETY: the proxy target is never read; every property access is forwarded to the drizzle instance.
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const instance = getDrizzle();
    // SAFETY: callers only read drizzle's own API, so prop names a key of the drizzle instance.
    const value = instance[prop as keyof typeof instance];

    return value instanceof Function ? value.bind(instance) : value;
  },
});
