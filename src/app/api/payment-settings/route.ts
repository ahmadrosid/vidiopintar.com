import { NextResponse } from 'next/server';
import { paymentSettingsRepository } from '@/lib/db/repository/payment-settings';
import { requireAdmin } from '@/lib/auth-admin';
import { 
  paymentSettingsSchema, 
  updatePaymentSettingsSchema 
} from '@/lib/validations/payment';
import { 
  paymentLogger, 
  getSanitizedRequestMetadata, 
  logPaymentSuccess, 
  logPaymentFailure 
} from '@/lib/utils/logger';
import { ZodError } from 'zod';

export async function GET() {
  try {
    const settings = await paymentSettingsRepository.getActive();
    
    if (!settings) {
      return NextResponse.json(null);
    }

    // Log successful fetch (but don't include sensitive data)
    paymentLogger.info('Payment settings fetched', {
      settingsId: settings.id,
      hasActiveSettings: true,
    });

    return NextResponse.json(settings);
  } catch (error) {
    paymentLogger.error('Error fetching payment settings', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const requestMetadata = await getSanitizedRequestMetadata(request);
  
  try {
    // Require admin authentication
    const admin = await requireAdmin();
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = paymentSettingsSchema.parse(body);

    const settings = await paymentSettingsRepository.create(validatedData);

    logPaymentSuccess('payment_settings_created', {
      userId: admin.id,
      settingsId: settings.id,
    });

    return NextResponse.json(settings, { status: 201 });
  } catch (error: any) {
    if (error.message === 'REDIRECT') {
      paymentLogger.warn('Unauthorized payment settings creation attempt', requestMetadata);
      return NextResponse.redirect('/home');
    }
    
    if (error instanceof ZodError) {
      paymentLogger.warn('Payment settings validation failed', {
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
    
    logPaymentFailure('payment_settings_creation', error, {
      requestMetadata,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const requestMetadata = await getSanitizedRequestMetadata(request);
  
  try {
    // Require admin authentication
    const admin = await requireAdmin();
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = updatePaymentSettingsSchema.parse(body);
    
    const { id, ...updateData } = validatedData;

    const settings = await paymentSettingsRepository.update(id, updateData);
    
    if (!settings) {
      paymentLogger.warn('Payment settings update failed - not found', {
        userId: admin.id,
        settingsId: id,
      });
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }

    logPaymentSuccess('payment_settings_updated', {
      userId: admin.id,
      settingsId: settings.id,
    });

    return NextResponse.json(settings);
  } catch (error: any) {
    if (error.message === 'REDIRECT') {
      paymentLogger.warn('Unauthorized payment settings update attempt', requestMetadata);
      return NextResponse.redirect('/home');
    }
    
    if (error instanceof ZodError) {
      paymentLogger.warn('Payment settings update validation failed', {
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
    
    logPaymentFailure('payment_settings_update', error, {
      requestMetadata,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}