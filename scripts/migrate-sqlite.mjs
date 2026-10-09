import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "node:path";

const databasePath = process.env.SQLITE_DATABASE_PATH ?? "/data/vidiopintar.db";

const sqlite = new Database(databasePath);

try {
  migrate(drizzle(sqlite), { migrationsFolder: path.join(process.cwd(), "src/drizzle") });
} finally {
  sqlite.close();
}
