import { NextResponse } from 'next/server';
import { transactionsRepository } from '@/lib/db/repository/transactions';
import { requireAdmin } from '@/lib/auth-admin';
import { isTransactionActive } from '@/lib/mayar/subscription';
import {
  paymentLogger,
  getSanitizedRequestMetadata,
  logPaymentSuccess,
  logPaymentFailure,
} from '@/lib/utils/logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const requestMetadata = await getSanitizedRequestMetadata(request);

  try {
    const admin = await requireAdmin();

    const { id } = await params;

    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      paymentLogger.warn('Invalid transaction ID format for subscription revoke', {
        adminId: admin.id,
        providedId: id,
        requestMetadata,
      });
      return NextResponse.json({ error: 'Invalid transaction ID format' }, { status: 400 });
    }

    const transaction = await transactionsRepository.getById(id);

    if (!transaction) {
      paymentLogger.warn('Subscription revoke failed - transaction not found', {
        adminId: admin.id,
        transactionId: id,
      });
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.status !== 'confirmed') {
      paymentLogger.warn('Subscription revoke failed - invalid status', {
        adminId: admin.id,
        transactionId: id,
        currentStatus: transaction.status,
        expectedStatus: 'confirmed',
      });
      return NextResponse.json(
        {
          error: 'Only confirmed transactions can have their subscription revoked',
          currentStatus: transaction.status,
        },
        { status: 400 },
      );
    }

    if (!isTransactionActive(transaction)) {
      paymentLogger.warn('Subscription revoke failed - subscription not active', {
        adminId: admin.id,
        transactionId: id,
        subscriptionEndsAt: transaction.subscriptionEndsAt,
      });
      return NextResponse.json(
        { error: 'Subscription is not active or has already expired' },
        { status: 400 },
      );
    }

    const updatedTransaction = await transactionsRepository.revokeSubscription(id, 'cancelled');

    logPaymentSuccess('subscription_revoked', {
      userId: admin.id,
      transactionId: id,
      amount: transaction.amount,
      planType: transaction.planType,
      originalUserId: transaction.userId,
    });

    return NextResponse.json(updatedTransaction);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'REDIRECT') {
      paymentLogger.warn('Unauthorized subscription revoke attempt', requestMetadata);
      return NextResponse.redirect('/home');
    }

    logPaymentFailure('subscription_revoke', error, {
      requestMetadata,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
