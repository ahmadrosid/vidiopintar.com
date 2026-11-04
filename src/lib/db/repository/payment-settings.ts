import { eq } from "drizzle-orm";
import { db } from "../index";
import {
  paymentSettings,
  type PaymentSettings,
  type NewPaymentSettings,
} from "../schema/payment-settings";

class PaymentSettingsRepository {
  async getActive(): Promise<PaymentSettings | null> {
    const result = await db
      .select()
      .from(paymentSettings)
      .where(eq(paymentSettings.isActive, "true"))
      .limit(1);

    return result[0] || null;
  }

  async create(
    data: Omit<NewPaymentSettings, "id" | "createdAt" | "updatedAt">,
  ): Promise<PaymentSettings> {
    await db.update(paymentSettings).set({
      isActive: "false",
      updatedAt: new Date(),
    });

    const result = await db
      .insert(paymentSettings)
      .values({
        ...data,
        isActive: "true",
      })
      .returning();

    return result[0];
  }
}

export const paymentSettingsRepository = new PaymentSettingsRepository();
