import type { SQL } from "drizzle-orm";
import { db } from "./index";

export type QueryRows = Record<string, unknown>[];

export async function executeQuery(query: SQL): Promise<{ rows: QueryRows }> {
  const result = await db.execute(query);

  if (Array.isArray(result)) {
    return { rows: result as QueryRows };
  }

  if (result && typeof result === "object" && "rows" in result) {
    return { rows: (result as { rows: QueryRows }).rows };
  }

  return { rows: [] };
}
