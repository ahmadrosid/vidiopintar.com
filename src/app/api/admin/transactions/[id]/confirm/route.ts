import { NextResponse } from 'next/server';
import { transactionsRepository } from '@/lib/db/repository/transactions';
import { requireAdmin } from '@/lib/auth-admin';
import { 
  paymentLogger, 
  getSanitizedRequestMetadata, 
  logPaymentSuccess, 
  logPaymentFailure 
} from '@/lib/utils/logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const requestMetadata = await getSanitizedRequestMetadata(request);
  
  try {
    const admin = await requireAdmin();

    const { id } = await params;
    
    // Validate transaction ID format (UUID)
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      paymentLogger.warn('Invalid transaction ID format for confirmation', {
        adminId: admin.id,
        providedId: id,
        requestMetadata,
      });
      return NextResponse.json({ error: 'Invalid transaction ID format' }, { status: 400 });
    }
    
    const transaction = await transactionsRepository.getById(id);
    
    if (!transaction) {
      paymentLogger.warn('Transaction confirmation failed - transaction not found', {
        adminId: admin.id,
        transactionId: id,
      });
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.paymentMethod === 'mayar') {
      paymentLogger.warn('Mayar transaction cannot be admin-confirmed', {
        adminId: admin.id,
        transactionId: id,
      });
      return NextResponse.json(
        { error: 'Mayar payments are webhook-only; admin confirm is disabled' },
        { status: 410 },
      );
    }

    if (transaction.status !== 'waiting_confirmation') {
      paymentLogger.warn('Transaction confirmation failed - invalid status', {
        adminId: admin.id,
        transactionId: id,
        currentStatus: transaction.status,
        expectedStatuses: ['waiting_confirmation'],
      });
      return NextResponse.json({ 
        error: 'Only bank-transfer waiting_confirmation rows can be confirmed',
        currentStatus: transaction.status 
      }, { status: 400 });
    }

    const updatedTransaction = await transactionsRepository.updateStatus(
      id, 
      'confirmed', 
      new Date()
    );

    logPaymentSuccess('transaction_confirmed', {
      userId: admin.id,
      transactionId: id,
      amount: transaction.amount,
      planType: transaction.planType,
      originalUserId: transaction.userId,
    });

    return NextResponse.json(updatedTransaction);
  } catch (error: any) {
    if (error.message === 'REDIRECT') {
      paymentLogger.warn('Unauthorized transaction confirmation attempt', requestMetadata);
      return NextResponse.redirect('/home');
    }
    
    logPaymentFailure('transaction_confirmation', error, {
      requestMetadata,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}