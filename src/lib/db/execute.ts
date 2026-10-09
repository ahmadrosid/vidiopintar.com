import type { SQL } from "drizzle-orm";
import { db } from "./index";

export async function executeQuery(query: SQL): Promise<void> {
  await db.run(query);
}
