import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { UserPlanService } from '@/lib/user-plan-service';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const plan = searchParams.get('plan');

    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan parameter' }, { status: 400 });
    }

    const canPurchaseCheck = await UserPlanService.canPurchasePlan(user.id, plan as any);
    
    return NextResponse.json(canPurchaseCheck);
  } catch (error) {
    console.error('Failed to check if user can purchase plan:', error);

    return NextResponse.json(
      { error: 'Failed to check plan availability' },
      { status: 500 }
    );
  }
}