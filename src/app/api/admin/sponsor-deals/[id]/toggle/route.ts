import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-admin';
import { db } from '@/lib/db';
import { sponsorDeals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Deal ID is required' },
        { status: 400 }
      );
    }

    // Get current deal status
    const [currentDeal] = await db
      .select()
      .from(sponsorDeals)
      .where(eq(sponsorDeals.id, id))
      .limit(1);

    if (!currentDeal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Toggle the isActive status
    const newStatus = !currentDeal.isActive;
    
    const [updatedDeal] = await db
      .update(sponsorDeals)
      .set({ 
        isActive: newStatus,
        updatedAt: new Date()
      })
      .where(eq(sponsorDeals.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      message: `Deal ${newStatus ? 'activated' : 'deactivated'} successfully`,
      deal: updatedDeal
    });

  } catch (error) {
    console.error('Error toggling sponsor deal:', error);
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Deal ID is required' },
        { status: 400 }
      );
    }

    // Check if deal exists
    const [existingDeal] = await db
      .select()
      .from(sponsorDeals)
      .where(eq(sponsorDeals.id, id))
      .limit(1);

    if (!existingDeal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Delete the deal
    await db
      .delete(sponsorDeals)
      .where(eq(sponsorDeals.id, id));

    return NextResponse.json({
      success: true,
      message: 'Deal deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting sponsor deal:', error);
    
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