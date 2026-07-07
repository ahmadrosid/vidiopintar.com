import type { SQL } from "drizzle-orm";
import { db } from "./index";

export type QueryRows = Record<string, unknown>[];

export async function executeQuery(query: SQL): Promise<{ rows: QueryRows }> {
  const rows = db.all(query) as QueryRows;
  return { rows };
}
