/** @type {import("drizzle-kit").Config} */
module.exports = {
  schema: "./src/lib/db/schema/*.ts",
  out: "./src/drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.SQLITE_DATABASE_PATH ?? "/data/vidiopintar.db",
  },
};
