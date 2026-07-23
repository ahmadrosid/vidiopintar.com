import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { db } from '../index';
import { transactions, type Transaction, type NewTransaction, type TransactionStatus } from '../schema/transactions';
import { user } from '../schema/auth';

export class TransactionsRepository {
  async create(data: Omit<NewTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const result = await db
      .insert(transactions)
      .values({
        ...data,
        paymentMethod: data.paymentMethod ?? 'mayar',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })
      .returning();
    
    return result[0];
  }

  async getById(id: string): Promise<Transaction | null> {
    const result = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1);
    
    return result[0] || null;
  }

  async getByReference(reference: string): Promise<Transaction | null> {
    const result = await db
      .select()
      .from(transactions)
      .where(eq(transactions.transactionReference, reference))
      .limit(1);
    
    return result[0] || null;
  }

  async getByMayarTransactionId(mayarTransactionId: string): Promise<Transaction | null> {
    const result = await db
      .select()
      .from(transactions)
      .where(eq(transactions.mayarTransactionId, mayarTransactionId))
      .limit(1);

    return result[0] || null;
  }

  async getByMayarMemberId(mayarMemberId: string): Promise<Transaction | null> {
    const result = await db
      .select()
      .from(transactions)
      .where(eq(transactions.mayarMemberId, mayarMemberId))
      .orderBy(desc(transactions.createdAt))
      .limit(1);

    return result[0] || null;
  }

  async getPendingByMayarMemberEmail(mayarMemberEmail: string): Promise<Transaction | null> {
    const result = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.mayarMemberEmail, mayarMemberEmail),
          eq(transactions.status, 'pending'),
        ),
      )
      .orderBy(desc(transactions.createdAt))
      .limit(1);

    return result[0] || null;
  }

  async getByUserId(userId: string, limit: number = 10): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async getPendingTransactionByUserAndPlan(userId: string, planType: string): Promise<Transaction | null> {
    const result = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.planType, planType),
          eq(transactions.status, 'pending')
        )
      )
      .orderBy(desc(transactions.createdAt))
      .limit(1);
    
    return result[0] || null;
  }

  async getRecentTransactionsByUserId(userId: string, timeWindowMs: number): Promise<Transaction[]> {
    const cutoffTime = new Date(Date.now() - timeWindowMs);
    return await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.createdAt, cutoffTime)
        )
      )
      .orderBy(desc(transactions.createdAt));
  }

  async updateStatus(id: string, status: TransactionStatus, confirmedAt?: Date): Promise<Transaction | null> {
    const updateData: Partial<Transaction> & { updatedAt: Date } = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'confirmed' && confirmedAt) {
      updateData.confirmedAt = confirmedAt;
    }

    const result = await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, id))
      .returning();
    
    return result[0] || null;
  }

  async attachMayarIds(
    id: string,
    data: {
      mayarMemberId: string;
      mayarTransactionId: string;
      mayarMemberEmail: string;
      membershipBillUrl: string;
    },
  ): Promise<Transaction | null> {
    const result = await db
      .update(transactions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, id))
      .returning();

    return result[0] || null;
  }

  async confirmMayarPayment(
    id: string,
    data: {
      mayarTransactionId?: string | null;
      mayarMemberId?: string | null;
      subscriptionEndsAt: Date | null;
      confirmedAt?: Date;
    },
  ): Promise<Transaction | null> {
    const result = await db
      .update(transactions)
      .set({
        status: 'confirmed',
        confirmedAt: data.confirmedAt ?? new Date(),
        subscriptionEndsAt: data.subscriptionEndsAt,
        mayarTransactionId: data.mayarTransactionId ?? undefined,
        mayarMemberId: data.mayarMemberId ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, id))
      .returning();

    return result[0] || null;
  }

  async renewSubscription(
    id: string,
    subscriptionEndsAt: Date | null,
  ): Promise<Transaction | null> {
    const result = await db
      .update(transactions)
      .set({
        status: 'confirmed',
        subscriptionEndsAt,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, id))
      .returning();

    return result[0] || null;
  }

  async revokeSubscription(
    id: string,
    status: Extract<TransactionStatus, 'expired' | 'cancelled'>,
  ): Promise<Transaction | null> {
    const result = await db
      .update(transactions)
      .set({
        status,
        subscriptionEndsAt: new Date(Date.now() - 1000),
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, id))
      .returning();

    return result[0] || null;
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.status, 'pending'))
      .orderBy(desc(transactions.createdAt));
  }

  async getExpiredTransactions(): Promise<Transaction[]> {
    const now = new Date();
    return await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.status, 'pending'),
          lte(transactions.expiresAt, now)
        )
      );
  }

  async markExpiredTransactions(): Promise<void> {
    const now = new Date();
    await db
      .update(transactions)
      .set({
        status: 'expired',
        updatedAt: now,
      })
      .where(
        and(
          eq(transactions.status, 'pending'),
          lte(transactions.expiresAt, now)
        )
      );
  }

  async expireUnpaidBankPending(): Promise<void> {
    const now = new Date();
    await db
      .update(transactions)
      .set({
        status: 'expired',
        updatedAt: now,
      })
      .where(
        and(
          eq(transactions.status, 'pending'),
          eq(transactions.paymentMethod, 'bank_transfer'),
        ),
      );
  }

  async getAll(limit: number = 50): Promise<(Transaction & { user: { name: string; email: string } | null })[]> {
    return await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        planType: transactions.planType,
        amount: transactions.amount,
        currency: transactions.currency,
        paymentMethod: transactions.paymentMethod,
        transactionReference: transactions.transactionReference,
        status: transactions.status,
        paymentSettings: transactions.paymentSettings,
        userAgent: transactions.userAgent,
        ipAddress: transactions.ipAddress,
        mayarMemberId: transactions.mayarMemberId,
        mayarTransactionId: transactions.mayarTransactionId,
        mayarMemberEmail: transactions.mayarMemberEmail,
        membershipBillUrl: transactions.membershipBillUrl,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
        confirmedAt: transactions.confirmedAt,
        expiresAt: transactions.expiresAt,
        subscriptionEndsAt: transactions.subscriptionEndsAt,
        user: {
          name: user.name,
          email: user.email,
        },
      })
      .from(transactions)
      .leftJoin(user, eq(transactions.userId, user.id))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async generateUniqueReference(): Promise<string> {
    let reference: string;
    let exists = true;
    
    while (exists) {
      const timestamp = Date.now().toString();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      reference = `TXN-${timestamp.slice(-6)}-${random}`;
      
      const existing = await this.getByReference(reference);
      exists = existing !== null;
    }
    
    return reference!;
  }
}

export const transactionsRepository = new TransactionsRepository();
