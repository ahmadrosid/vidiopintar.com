import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-admin';
import { db } from '@/lib/db';
import { sponsorDeals, user } from '@/lib/db/schema';
import { eq, desc, sql, and, gte, lt } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const isActive = searchParams.get('isActive');
    const dealName = searchParams.get('dealName');
    const offset = (page - 1) * limit;

    let whereCondition = sql`1=1`;

    // Filter by active status
    if (isActive !== null) {
      const activeValue = isActive === 'true';
      const newCondition = and(whereCondition, eq(sponsorDeals.isActive, activeValue));
      whereCondition = newCondition ?? whereCondition;
    }

    // Filter by deal name
    if (dealName) {
      const newCondition = and(whereCondition, sql`${sponsorDeals.dealName} ILIKE ${`%${dealName}%`}`);
      whereCondition = newCondition ?? whereCondition;
    }

    // Get sponsor deals with user information
    const deals = await db
      .select({
        id: sponsorDeals.id,
        dealName: sponsorDeals.dealName,
        grantedAt: sponsorDeals.grantedAt,
        expiresAt: sponsorDeals.expiresAt,
        isActive: sponsorDeals.isActive,
        createdBy: sponsorDeals.createdBy,
        createdAt: sponsorDeals.createdAt,
        updatedAt: sponsorDeals.updatedAt,
        userEmail: user.email,
        userName: user.name,
      })
      .from(sponsorDeals)
      .leftJoin(user, eq(sponsorDeals.userId, user.id))
      .where(whereCondition)
      .orderBy(desc(sponsorDeals.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(sponsorDeals)
      .where(whereCondition);

    // Add computed fields
    const dealsWithStatus = deals.map(deal => ({
      ...deal,
      isExpired: new Date() > new Date(deal.expiresAt),
      daysUntilExpiry: Math.ceil((new Date(deal.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    }));

    return NextResponse.json({
      deals: dealsWithStatus,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching sponsor deals:', error);
    
    if (error instanceof Response && error.status === 302) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}