import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { UserPlanService } from '@/lib/user-plan-service';
import { z } from 'zod';

const purchasablePlanSchema = z.enum(['monthly', 'yearly']);

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const plan = searchParams.get('plan');

    const parsedPlan = purchasablePlanSchema.safeParse(plan);

    if (!parsedPlan.success) {
      return NextResponse.json({ error: 'Invalid plan parameter' }, { status: 400 });
    }

    const canPurchaseCheck = await UserPlanService.canPurchasePlan(user.id, parsedPlan.data);
    
    return NextResponse.json(canPurchaseCheck);
  } catch (error) {
    console.error('Failed to check if user can purchase plan:', error);

    return NextResponse.json(
      { error: 'Failed to check plan availability' },
      { status: 500 }
    );
  }
}