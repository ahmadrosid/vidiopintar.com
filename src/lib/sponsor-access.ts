import { db } from '@/lib/db';
import { sponsorDeals } from '@/lib/db/schema';
import { eq, and, gte } from 'drizzle-orm';

export interface SponsorAccess {
  hasAccess: boolean;
  deal?: {
    id: string;
    dealName: string;
    expiresAt: Date;
    daysRemaining: number;
  };
}

export async function checkSponsorAccess(userId: string): Promise<SponsorAccess> {
  try {
    const now = new Date();
    
    // Find active sponsor deals that haven't expired
    const activeDeal = await db
      .select()
      .from(sponsorDeals)
      .where(
        and(
          eq(sponsorDeals.userId, userId),
          eq(sponsorDeals.isActive, true),
          gte(sponsorDeals.expiresAt, now)
        )
      )
      .orderBy(sponsorDeals.expiresAt)
      .limit(1);

    if (activeDeal.length === 0) {
      return { hasAccess: false };
    }

    const deal = activeDeal[0];
    const expiresAt = new Date(deal.expiresAt);
    const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      hasAccess: true,
      deal: {
        id: deal.id,
        dealName: deal.dealName,
        expiresAt,
        daysRemaining: Math.max(0, daysRemaining)
      }
    };
  } catch (error) {
    console.error('Error checking sponsor access:', error);
    return { hasAccess: false };
  }
}

export async function getAllUserSponsorDeals(userId: string) {
  try {
    const deals = await db
      .select()
      .from(sponsorDeals)
      .where(eq(sponsorDeals.userId, userId))
      .orderBy(sponsorDeals.createdAt);

    return deals.map(deal => {
      const now = new Date();
      const expiresAt = new Date(deal.expiresAt);
      const isExpired = now > expiresAt;
      const daysRemaining = isExpired ? 0 : Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        ...deal,
        isExpired,
        daysRemaining
      };
    });
  } catch (error) {
    console.error('Error fetching user sponsor deals:', error);
    return [];
  }
}

export async function hasActiveSponsorAccess(userId: string): Promise<boolean> {
  const access = await checkSponsorAccess(userId);
  return access.hasAccess;
}