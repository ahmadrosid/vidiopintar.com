const path = require("node:path");

const PRODUCTION_DATABASE_PATH = "/data/vidiopintar.db";

const DEVELOPMENT_DATABASE_PATH = "./data/vidiopintar.db";

/**
 * Resolves the SQLite database file path.
 *
 * Production uses Turso (see resolveDatabaseConfig), so this path only applies
 * to local development and one-off scripts. A relative path is resolved against
 * ./data so it always lands in a writable location.
 */
function resolveDatabasePath() {
  const configured =
    process.env.SQLITE_DATABASE_PATH ??
    (process.env.NODE_ENV === "production"
      ? PRODUCTION_DATABASE_PATH
      : DEVELOPMENT_DATABASE_PATH);

  if (process.env.NODE_ENV === "production" && !path.isAbsolute(configured)) {
    return PRODUCTION_DATABASE_PATH;
  }

  if (path.isAbsolute(configured)) return configured;

  return path.join(process.cwd(), "data", path.basename(configured));
}

/**
 * Resolves the libSQL connection config.
 *
 * Vercel has no persistent disk, so production points TURSO_DATABASE_URL at a
 * hosted Turso database. Without it, the app falls back to the local SQLite file.
 */
function resolveDatabaseConfig() {
  if (process.env.TURSO_DATABASE_URL) {
    return {
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    };
  }

  return { url: `file:${resolveDatabasePath()}` };
}

module.exports = { resolveDatabaseConfig };
