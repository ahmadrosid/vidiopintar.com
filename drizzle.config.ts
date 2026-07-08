import "dotenv/config";
import { resolveDatabasePath } from "./src/lib/db/resolve-database-path.js";

export default {
  schema: "./src/lib/db/schema/*.ts",
  out: "./src/drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: resolveDatabasePath(),
  },
};
