import path from "node:path";

const PRODUCTION_DATABASE_PATH = "/data/vidiopintar.db";
const DEVELOPMENT_DATABASE_PATH = "./data/vidiopintar.db";

/**
 * Resolves the SQLite database file path.
 *
 * In production containers the app runs as a non-root user from /app, which is
 * not writable. A relative path like ./data/vidiopintar.db (common in .env for
 * local dev) would resolve to /app/data and fail with EACCES when passed via
 * --env-file during docker run.
 */
export function resolveDatabasePath(): string {
  const configured =
    process.env.SQLITE_DATABASE_PATH ??
    (process.env.NODE_ENV === "production"
      ? PRODUCTION_DATABASE_PATH
      : DEVELOPMENT_DATABASE_PATH);

  if (process.env.NODE_ENV === "production" && !path.isAbsolute(configured)) {
    return PRODUCTION_DATABASE_PATH;
  }

  return path.resolve(configured);
}
