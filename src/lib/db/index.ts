import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { env } from "../env/server";
import * as schema from "./schema";

declare global {
  var sqliteDb: Database | undefined;
}

function createDatabase(): Database {
  const dbPath = path.resolve(env.SQLITE_DATABASE_PATH);
  mkdirSync(path.dirname(dbPath), { recursive: true });

  const sqlite = new Database(dbPath);
  sqlite.run("PRAGMA journal_mode = WAL");
  sqlite.run("PRAGMA busy_timeout = 5000");
  sqlite.run("PRAGMA foreign_keys = ON");

  return sqlite;
}

const sqlite =
  env.NODE_ENV === "production"
    ? createDatabase()
    : (global.sqliteDb ??= createDatabase());

export const db = drizzle(sqlite, { schema });
