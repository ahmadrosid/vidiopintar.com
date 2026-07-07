import { NextResponse } from 'next/server';
import { transactionsRepository } from '@/lib/db/repository/transactions';
import { getOptionalUser } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = await getOptionalUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const transaction = await transactionsRepository.getById(id);
    
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Users can only view their own transactions
    if (transaction.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const user = await getOptionalUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['confirmed', 'cancelled', 'waiting_confirmation'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const transaction = await transactionsRepository.getById(id);
    
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Users can only cancel their own pending transactions
    if (transaction.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!['pending', 'waiting_confirmation'].includes(transaction.status)) {
      return NextResponse.json({ error: 'Transaction cannot be modified' }, { status: 400 });
    }

    // Users can cancel or mark as waiting confirmation, but cannot directly confirm
    if (status === 'confirmed') {
      return NextResponse.json({ error: 'Users cannot confirm transactions' }, { status: 403 });
    }

    // Users can only set waiting_confirmation from pending status
    if (status === 'waiting_confirmation' && transaction.status !== 'pending') {
      return NextResponse.json({ error: 'Can only mark pending transactions as waiting confirmation' }, { status: 400 });
    }

    const confirmedAt = status === 'confirmed' ? new Date() : undefined;
    const updatedTransaction = await transactionsRepository.updateStatus(id, status, confirmedAt);

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
