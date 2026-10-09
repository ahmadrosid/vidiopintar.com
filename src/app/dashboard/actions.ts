"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createUserMcpKey, MAX_ACTIVE_KEYS_PER_USER, revokeUserMcpKey } from "@/lib/mcp/keys";
import { UserPlanService } from "@/lib/user-plan-service";

export type CreateKeyState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "created"; token: string; name: string };

const nameSchema = z.string().trim().min(1, "Nama key wajib diisi.").max(60, "Nama key maksimal 60 karakter.");

export async function createKeyAction(_prev: CreateKeyState, formData: FormData): Promise<CreateKeyState> {
  const user = await getCurrentUser();

  if ((await UserPlanService.getCurrentPlan(user.id)) === "free") {
    return { status: "error", message: "Buat API key butuh paket berbayar. Pilih paket di halaman billing." };
  }

  const parsed = nameSchema.safeParse(formData.get("name") ?? "");

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message };
  }

  const created = await createUserMcpKey(user.id, parsed.data);

  if (!created) {
    return {
      status: "error",
      message: `Maksimal ${MAX_ACTIVE_KEYS_PER_USER} key aktif. Cabut key lama sebelum membuat yang baru.`,
    };
  }

  revalidatePath("/dashboard");

  return { status: "created", token: created.token, name: parsed.data };
}

export async function revokeKeyAction(keyId: string) {
  const user = await getCurrentUser();
  await revokeUserMcpKey(user.id, keyId);
  revalidatePath("/dashboard");
}
