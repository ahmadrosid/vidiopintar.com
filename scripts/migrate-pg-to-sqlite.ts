#!/usr/bin/env bun

/**
 * One-time PostgreSQL → SQLite data migration.
 *
 * Usage:
 *   MIGRATE_PG_URL=postgres://... SQLITE_DATABASE_PATH=./data/vidiopintar.db bun scripts/migrate-pg-to-sqlite.ts
 *   bun scripts/migrate-pg-to-sqlite.ts --force
 */

import "dotenv/config";
import { Pool } from "pg";
import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

const force = process.argv.includes("--force");
const pgUrl =
  process.env.MIGRATE_PG_URL ??
  (process.env.DB_USER
    ? `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    : undefined);
const sqlitePath = path.resolve(
  process.env.SQLITE_DATABASE_PATH ?? "./data/vidiopintar.db"
);

if (!pgUrl) {
  console.error("Set MIGRATE_PG_URL or legacy DB_* env vars for PostgreSQL source.");
  process.exit(1);
}

mkdirSync(path.dirname(sqlitePath), { recursive: true });

const sqlite = new Database(sqlitePath);
sqlite.run("PRAGMA journal_mode = WAL");
sqlite.run("PRAGMA foreign_keys = OFF");

const existing = sqlite
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
  .all() as { name: string }[];

if (existing.length > 0 && !force) {
  console.error(
    `Target SQLite database is not empty (${existing.length} tables). Run db:migrate first or pass --force.`
  );
  process.exit(1);
}

const pool = new Pool({ connectionString: pgUrl, ssl: { rejectUnauthorized: false } });

const TABLES_IN_ORDER = [
  "user",
  "account",
  "session",
  "verification",
  "videos",
  "user_videos",
  "messages",
  "notes",
  "shared_videos",
  "transcript_segments",
  "token_usage",
  "transactions",
  "payment_settings",
  "feedback",
] as const;

function toSqliteValue(value: unknown): string | number | bigint | boolean | Uint8Array | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return value;
  return String(value);
}

async function migrateTable(table: string) {
  const { rows } = await pool.query(`SELECT * FROM "${table}"`);
  if (rows.length === 0) {
    console.log(`  ${table}: 0 rows (skipped)`);
    return;
  }

  const columns = Object.keys(rows[0]);
  const placeholders = columns.map(() => "?").join(", ");
  const quotedColumns = columns.map((c) => `"${c}"`).join(", ");
  const insert = sqlite.prepare(
    `INSERT OR REPLACE INTO "${table}" (${quotedColumns}) VALUES (${placeholders})`
  );

  const insertMany = sqlite.transaction((batch: Record<string, unknown>[]) => {
    for (const row of batch) {
      insert.run(...columns.map((col) => toSqliteValue(row[col])));
    }
  });

  insertMany(rows as Record<string, unknown>[]);

  const sqliteCount = sqlite
    .prepare(`SELECT COUNT(*) as count FROM "${table}"`)
    .get() as { count: number };

  if (sqliteCount.count !== rows.length) {
    throw new Error(
      `Row count mismatch for ${table}: source=${rows.length} target=${sqliteCount.count}`
    );
  }

  console.log(`  ${table}: ${rows.length} rows`);
}

async function main() {
  if (!pgUrl) {
    return;
  }

  console.log("Migrating PostgreSQL → SQLite");
  console.log(`  Source: ${pgUrl.replace(/:[^:@]+@/, ":***@")}`);
  console.log(`  Target: ${sqlitePath}`);

  for (const table of TABLES_IN_ORDER) {
    await migrateTable(table);
  }

  const serialTables = ["videos", "user_videos", "shared_videos", "transcript_segments", "feedback", "token_usage", "notes"];
  for (const table of serialTables) {
    const maxRow = sqlite
      .prepare(`SELECT MAX(id) as max_id FROM "${table}"`)
      .get() as { max_id: number | null } | undefined;
    if (maxRow?.max_id) {
      sqlite.prepare(
        `INSERT OR REPLACE INTO sqlite_sequence (name, seq) VALUES (?, ?)`
      ).run(table, maxRow.max_id);
    }
  }

  sqlite.run("PRAGMA foreign_keys = ON");
  await pool.end();
  sqlite.close();
  console.log("Migration completed successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
