import { NextResponse } from 'next/server';
import { transactionsRepository } from '@/lib/db/repository/transactions';
import { getOptionalUser } from '@/lib/auth';
import { headers } from 'next/headers';
import { 
  createTransactionSchema, 
  validateAmountMatchesPlan,
  PAYMENT_LIMITS,
  type PlanType 
} from '@/lib/validations/payment';
import { 
  paymentLogger, 
  getSanitizedRequestMetadata, 
  logPaymentSuccess, 
  logPaymentFailure 
} from '@/lib/utils/logger';
import { ZodError } from 'zod';

export async function POST(request: Request) {
  const requestMetadata = await getSanitizedRequestMetadata(request);
  
  try {
    const user = await getOptionalUser();
    
    if (!user) {
      paymentLogger.warn('Unauthorized transaction creation attempt', requestMetadata);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createTransactionSchema.parse(body);
    
    // Validate amount matches plan pricing
    const amountValidation = validateAmountMatchesPlan(validatedData.planType as PlanType, validatedData.amount);
    if (!amountValidation.isValid) {
      paymentLogger.warn('Invalid amount for plan type', {
        userId: user.id,
        planType: validatedData.planType,
        providedAmount: validatedData.amount,
        expectedAmount: amountValidation.expectedAmount,
        error: amountValidation.error,
      });
      return NextResponse.json({ 
        error: 'Invalid amount',
        details: amountValidation.error,
        expectedAmount: amountValidation.expectedAmount
      }, { status: 400 });
    }

    // Check for recent transactions (rate limiting)
    const recentTransactions = await transactionsRepository.getRecentTransactionsByUserId(
      user.id, 
      24 * 60 * 60 * 1000 // 24 hours in milliseconds
    );
    
    if (recentTransactions.length >= PAYMENT_LIMITS.MAX_TRANSACTIONS_PER_USER_PER_DAY) {
      paymentLogger.warn('User exceeded daily transaction limit', {
        userId: user.id,
        recentTransactionCount: recentTransactions.length,
        limit: PAYMENT_LIMITS.MAX_TRANSACTIONS_PER_USER_PER_DAY,
      });
      return NextResponse.json({ 
        error: 'Transaction limit exceeded',
        details: `Maximum ${PAYMENT_LIMITS.MAX_TRANSACTIONS_PER_USER_PER_DAY} transactions per day allowed`
      }, { status: 429 });
    }

    // Generate unique transaction reference
    const transactionReference = await transactionsRepository.generateUniqueReference();

    // Get user agent and IP from request headers
    const headersList = await headers();
    const userAgent = headersList.get('user-agent')?.substring(0, 500) || undefined;
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     headersList.get('x-real-ip') || 
                     undefined;

    const transaction = await transactionsRepository.create({
      userId: user.id,
      planType: validatedData.planType,
      amount: validatedData.amount,
      currency: validatedData.currency,
      transactionReference,
      paymentSettings: validatedData.paymentSettings,
      userAgent,
      ipAddress,
    });

    logPaymentSuccess('transaction_created', {
      userId: user.id,
      transactionId: transaction.id,
      amount: validatedData.amount,
      planType: validatedData.planType,
    });

    return NextResponse.json(transaction, { status: 201 });
    
  } catch (error) {
    if (error instanceof ZodError) {
      paymentLogger.warn('Transaction validation failed', {
        validationErrors: error.issues,
        requestMetadata,
      });
      return NextResponse.json({ 
        error: 'Validation failed',
        details: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }
    
    logPaymentFailure('transaction_creation', error, {
      requestMetadata,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const requestMetadata = await getSanitizedRequestMetadata(request);
  
  try {
    const user = await getOptionalUser();
    if (!user) {
      paymentLogger.warn('Unauthorized transaction fetch attempt', requestMetadata);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100); // Cap at 100

    const transactions = await transactionsRepository.getByUserId(user.id, limit);
    
    paymentLogger.info('User transactions fetched', {
      userId: user.id,
      transactionCount: transactions.length,
      requestedLimit: limit,
    });
    
    return NextResponse.json(transactions);
  } catch (error) {
    logPaymentFailure('transaction_fetch', error, {
      requestMetadata,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}