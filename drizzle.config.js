const { resolveDatabaseConfig } = require("./src/lib/db/resolve-database-path.js");

/** @type {import("drizzle-kit").Config} */
module.exports = {
  schema: "./src/lib/db/schema/*.ts",
  out: "./src/drizzle",
  dialect: "turso",
  dbCredentials: resolveDatabaseConfig(),
};
