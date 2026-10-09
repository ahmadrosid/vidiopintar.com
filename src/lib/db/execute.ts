import type { SQL } from "drizzle-orm";
import { db } from "./index";

// Runs a statement for its side effects; callers only need it to succeed.
export async function executeQuery(query: SQL): Promise<void> {
  db.run(query);
}
