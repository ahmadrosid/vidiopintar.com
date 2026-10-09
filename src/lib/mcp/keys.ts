import { createHash, randomBytes, randomUUID } from "node:crypto";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { mcpApiKeys, mcpUsage } from "@/lib/db/schema";

// Same token format as scripts/mcp-key.mjs and authenticateMcpRequest.
export const MAX_ACTIVE_KEYS_PER_USER = 5;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

const dayMs = 86_400_000;

// Active keys with today's usage. The "day" window starts at UTC midnight, as in authenticateMcpRequest.
export async function listUserMcpKeys(userId: string) {
  const today = Math.floor(Date.now() / dayMs) * dayMs;

  const rows = await db
    .select({
      id: mcpApiKeys.id,
      name: mcpApiKeys.name,
      prefix: mcpApiKeys.prefix,
      createdAt: mcpApiKeys.createdAt,
      requestsPerDay: mcpApiKeys.requestsPerDay,
      bytesPerDay: mcpApiKeys.bytesPerDay,
      requestsToday: mcpUsage.requests,
      bytesToday: mcpUsage.outputBytes,
    })
    .from(mcpApiKeys)
    .leftJoin(
      mcpUsage,
      and(eq(mcpUsage.keyId, mcpApiKeys.id), eq(mcpUsage.window, "day"), eq(mcpUsage.periodStart, today)),
    )
    .where(and(eq(mcpApiKeys.userId, userId), isNull(mcpApiKeys.revokedAt)))
    .orderBy(desc(mcpApiKeys.createdAt));

  return rows.map((row) => ({ ...row, requestsToday: row.requestsToday ?? 0, bytesToday: row.bytesToday ?? 0 }));
}

export async function createUserMcpKey(userId: string, name: string) {
  const [{ active }] = await db
    .select({ active: count() })
    .from(mcpApiKeys)
    .where(and(eq(mcpApiKeys.userId, userId), isNull(mcpApiKeys.revokedAt)));

  if (active >= MAX_ACTIVE_KEYS_PER_USER) return null;

  const token = `vpt_live_${randomBytes(32).toString("base64url")}`;
  const prefix = `${token.slice(0, 16)}...`;
  await db.insert(mcpApiKeys).values({
    id: randomUUID(),
    userId,
    name,
    prefix,
    keyHash: hashToken(token),
    createdAt: new Date(),
  });

  return { token, prefix };
}

export async function revokeUserMcpKey(userId: string, keyId: string) {
  // Overwrite the hash so the revoked token can never match again.
  const result = await db
    .update(mcpApiKeys)
    .set({ keyHash: hashToken(randomBytes(32).toString("hex")), revokedAt: new Date() })
    .where(and(eq(mcpApiKeys.id, keyId), eq(mcpApiKeys.userId, userId), isNull(mcpApiKeys.revokedAt)))
    .returning({ id: mcpApiKeys.id });

  return result.length > 0;
}
