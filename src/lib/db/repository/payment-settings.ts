import { eq } from 'drizzle-orm';
import { db } from '../index';
import { paymentSettings, type PaymentSettings, type NewPaymentSettings } from '../schema/payment-settings';

class PaymentSettingsRepository {
  async getActive(): Promise<PaymentSettings | null> {
    const result = await db
      .select()
      .from(paymentSettings)
      .where(eq(paymentSettings.isActive, 'true'))
      .limit(1);
    
    return result[0] || null;
  }

  async create(data: Omit<NewPaymentSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentSettings> {
    await db
      .update(paymentSettings)
      .set({ 
        isActive: 'false',
        updatedAt: new Date()
      });

    const result = await db
      .insert(paymentSettings)
      .values({
        ...data,
        isActive: 'true'
      })
      .returning();
    
    return result[0];
  }

  async update(id: string, data: Partial<Omit<NewPaymentSettings, 'id' | 'createdAt'>>): Promise<PaymentSettings | null> {
    const result = await db
      .update(paymentSettings)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(paymentSettings.id, id))
      .returning();
    
    return result[0] || null;
  }

  async getAll(): Promise<PaymentSettings[]> {
    return await db
      .select()
      .from(paymentSettings)
      .orderBy(paymentSettings.createdAt);
  }

  async setActive(id: string): Promise<PaymentSettings | null> {
    await db
      .update(paymentSettings)
      .set({ 
        isActive: 'false',
        updatedAt: new Date()
      });

    const result = await db
      .update(paymentSettings)
      .set({ 
        isActive: 'true',
        updatedAt: new Date()
      })
      .where(eq(paymentSettings.id, id))
      .returning();
    
    return result[0] || null;
  }
}

export const paymentSettingsRepository = new PaymentSettingsRepository();