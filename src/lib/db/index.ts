import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { mkdirSync } from "node:fs";
import path from "node:path";
import * as schema from "./schema";
import { resolveDatabaseConfig } from "./database-path";

declare global {
  var libsqlClient: Client | undefined;
  var drizzleDb: LibSQLDatabase<typeof schema> | undefined;
}

function getClient(): Client {
  if (!global.libsqlClient) {
    const config = resolveDatabaseConfig();

    if (config.url.startsWith("file:")) {
      // data/ is gitignored, so a fresh clone has no directory for the local file yet.
      mkdirSync(path.dirname(config.url.slice("file:".length)), { recursive: true });
    }

    global.libsqlClient = createClient(config);
  }

  return global.libsqlClient;
}

function getDrizzle() {
  if (!global.drizzleDb) {
    global.drizzleDb = drizzle(getClient(), { schema });
  }

  return global.drizzleDb;
}

// SAFETY: the proxy target is never read; every property access is forwarded to the drizzle instance.
export const db = new Proxy({} as LibSQLDatabase<typeof schema>, {
  get(_target, prop) {
    const instance = getDrizzle();
    // SAFETY: callers only read drizzle's own API, so prop names a key of the drizzle instance.
    const value = instance[prop as keyof typeof instance];

    return value instanceof Function ? value.bind(instance) : value;
  },
});
