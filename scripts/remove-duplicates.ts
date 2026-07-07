#!/usr/bin/env bun

import "dotenv/config";
import Database from "better-sqlite3";
import path from "node:path";

const sqlitePath = path.resolve(
  process.env.SQLITE_DATABASE_PATH ?? "./data/vidiopintar.db"
);

const db = new Database(sqlitePath);

const duplicates = db
  .prepare(
    `SELECT user_id, youtube_id, COUNT(*) as count, group_concat(id) as ids
     FROM user_videos
     GROUP BY user_id, youtube_id
     HAVING COUNT(*) > 1`
  )
  .all() as { user_id: string; youtube_id: string; count: number; ids: string }[];

console.log(`Found ${duplicates.length} duplicate groups`);

if (duplicates.length === 0) {
  console.log("No duplicates to remove");
  db.close();
  process.exit(0);
}

const result = db
  .prepare(
    `DELETE FROM user_videos
     WHERE id IN (
       SELECT a.id
       FROM user_videos a
       INNER JOIN user_videos b
         ON a.user_id = b.user_id
         AND a.youtube_id = b.youtube_id
         AND a.id > b.id
     )`
  )
  .run();

console.log(`Deleted ${result.changes} duplicate rows`);
db.close();
console.log("Done!");
