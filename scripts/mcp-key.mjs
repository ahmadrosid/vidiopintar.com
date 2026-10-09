import { createClient } from "@libsql/client";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const { resolveDatabaseConfig } = require("../src/lib/db/resolve-database-path.js");

const [command, ...args] = process.argv.slice(2);

const db = createClient(resolveDatabaseConfig());

try {
  if (command === "create") {
    const name = args.join(" ").trim();

    if (!name) throw new Error('Gunakan: npm run mcp:key -- create "Nama agen"');
    const token = `vpt_live_${randomBytes(32).toString("base64url")}`;
    const prefix = `${token.slice(0, 16)}...`;
    await db.execute({
      sql: "INSERT INTO mcp_api_keys (id, name, prefix, key_hash, created_at) VALUES (?, ?, ?, ?, ?)",
      args: [randomUUID(), name, prefix, createHash("sha256").update(token).digest("hex"), Date.now()],
    });
    console.log(`Prefix: ${prefix}\nSimpan kunci ini sekarang. Kunci lengkap tidak dapat dilihat lagi:\n${token}`);
  } else if (command === "revoke") {
    const prefix = args[0];

    if (!prefix) throw new Error("Gunakan: npm run mcp:key -- revoke <prefix>");
    const replacementHash = createHash("sha256").update(randomBytes(32)).digest("hex");

    const result = await db.execute({
      sql: "UPDATE mcp_api_keys SET key_hash = ?, revoked_at = ? WHERE prefix = ? AND revoked_at IS NULL",
      args: [replacementHash, Date.now(), prefix],
    });

    if (!result.rowsAffected) throw new Error("Prefix tidak ditemukan atau kunci sudah dicabut.");
    console.log(`Kunci ${prefix} sudah dicabut.`);
  } else {
    throw new Error("Perintah harus create atau revoke.");
  }
} finally {
  db.close();
}
