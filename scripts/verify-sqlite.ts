#!/usr/bin/env bun

/**
 * Smoke verification for SQLite database setup.
 * Usage: SQLITE_DATABASE_PATH=./data/vidiopintar.db bun scripts/verify-sqlite.ts
 */

import { Database } from "bun:sqlite";
import path from "node:path";

const sqlitePath = path.resolve(
  process.env.SQLITE_DATABASE_PATH ?? "./data/vidiopintar.db"
);

function main() {
  const checks: { name: string; ok: boolean; detail?: string }[] = [];

  let db: Database;
  try {
    db = new Database(sqlitePath, { readonly: true });
    db.query("SELECT 1").get();
    checks.push({ name: "database connection", ok: true });
  } catch (err) {
    checks.push({
      name: "database connection",
      ok: false,
      detail: String(err),
    });
    report(checks);
    return;
  }

  const tables = db
    .query(
      `SELECT name FROM sqlite_master
       WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name != '__drizzle_migrations'
       ORDER BY name`
    )
    .all() as { name: string }[];

  const tableNames = tables.map((r) => r.name);
  const expectedTables = [
    "feedback",
    "messages",
    "notes",
    "payment_settings",
    "quiz_attempts",
    "shared_videos",
    "token_usage",
    "transactions",
    "transcript_segments",
    "transcript_cache",
    "user",
    "user_usage_events",
    "user_videos",
    "video_quizzes",
    "videos",
  ];

  const missing = expectedTables.filter((t) => !tableNames.includes(t));
  checks.push({
    name: "schema tables",
    ok: missing.length === 0,
    detail: missing.length ? `missing: ${missing.join(", ")}` : `${tableNames.length} tables`,
  });

  try {
    const users = db.query(`SELECT COUNT(*) as count FROM "user"`).get() as {
      count: number;
    };
    checks.push({
      name: "user table query",
      ok: true,
      detail: `${users.count} users`,
    });
  } catch (err) {
    checks.push({ name: "user table query", ok: false, detail: String(err) });
  }

  try {
    db.query(
      `SELECT COUNT(DISTINCT user_id) as mau
       FROM user_videos
       WHERE created_at >= datetime('now', '-30 days')`
    ).get();
    checks.push({ name: "admin analytics SQL", ok: true });
  } catch (err) {
    checks.push({ name: "admin analytics SQL", ok: false, detail: String(err) });
  }

  db.close();
  report(checks);
}

function report(checks: { name: string; ok: boolean; detail?: string }[]) {
  let failed = 0;
  for (const check of checks) {
    const status = check.ok ? "PASS" : "FAIL";
    const detail = check.detail ? ` (${check.detail})` : "";
    console.log(`${status} ${check.name}${detail}`);
    if (!check.ok) failed++;
  }
  process.exit(failed > 0 ? 1 : 0);
}

main();
