import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

const { resolveDatabaseConfig } = require("../src/lib/db/resolve-database-path.js");

const client = createClient(resolveDatabaseConfig());

try {
  await migrate(drizzle(client), { migrationsFolder: path.join(process.cwd(), "src/drizzle") });
} finally {
  client.close();
}
