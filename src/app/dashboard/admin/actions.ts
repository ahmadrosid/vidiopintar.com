"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-admin";
import { transactionsRepository } from "@/lib/db/repository/transactions";

const openStatuses = ["pending", "waiting_confirmation"];

// Confirming a transaction is what activates the plan, so only admins can do it.
export async function confirmTransactionAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const transaction = id ? await transactionsRepository.getById(id) : null;

  if (!transaction || !openStatuses.includes(transaction.status)) return;

  await transactionsRepository.updateStatus(id, "confirmed", new Date());
  revalidatePath("/dashboard/admin");
}

export async function cancelTransactionAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const transaction = id ? await transactionsRepository.getById(id) : null;

  if (!transaction || !openStatuses.includes(transaction.status)) return;

  await transactionsRepository.updateStatus(id, "cancelled");
  revalidatePath("/dashboard/admin");
}
