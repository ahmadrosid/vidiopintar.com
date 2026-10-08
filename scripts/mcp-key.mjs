import Database from "better-sqlite3";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { resolveDatabasePath } = require("../src/lib/db/resolve-database-path.js");

const [command, ...args] = process.argv.slice(2);
const db = new Database(resolveDatabasePath());
db.pragma("busy_timeout = 5000");

if (command === "create") {
  const name = args.join(" ").trim();
  if (!name) throw new Error('Gunakan: npm run mcp:key -- create "Nama agen"');
  const token = `vpt_live_${randomBytes(32).toString("base64url")}`;
  const prefix = `${token.slice(0, 16)}...`;
  db.prepare("INSERT INTO mcp_api_keys (id, name, prefix, key_hash, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(randomUUID(), name, prefix, createHash("sha256").update(token).digest("hex"), Date.now());
  console.log(`Prefix: ${prefix}\nSimpan kunci ini sekarang. Kunci lengkap tidak dapat dilihat lagi:\n${token}`);
} else if (command === "revoke") {
  const prefix = args[0];
  if (!prefix) throw new Error("Gunakan: npm run mcp:key -- revoke <prefix>");
  const replacementHash = createHash("sha256").update(randomBytes(32)).digest("hex");
  const result = db.prepare("UPDATE mcp_api_keys SET key_hash = ?, revoked_at = ? WHERE prefix = ? AND revoked_at IS NULL")
    .run(replacementHash, Date.now(), prefix);
  if (!result.changes) throw new Error("Prefix tidak ditemukan atau kunci sudah dicabut.");
  console.log(`Kunci ${prefix} sudah dicabut.`);
} else {
  throw new Error("Perintah harus create atau revoke.");
}
db.close();
