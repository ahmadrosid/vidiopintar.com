import { z } from 'zod';

// Plan configuration with pricing
export const PLAN_CONFIGS = {
  monthly: {
    name: 'Monthly Plan',
    amount: 50000,
    currency: 'IDR',
    minAmount: 50000,
    maxAmount: 50000,
  },
  yearly: {
    name: 'Yearly Plan', 
    amount: 500000,
    currency: 'IDR',
    minAmount: 500000,
    maxAmount: 500000,
  },
} as const;

export type PlanType = keyof typeof PLAN_CONFIGS;

export const BANK_TRANSFER_DETAILS = {
  bankName: 'BNI',
  bankAccountNumber: '1229085831',
  bankAccountName: 'Ahmad Rosid',
} as const;

export const PAYMENT_CONTACT_CONFIG = {
  whatsappPhoneNumber: '6281234567890',
  whatsappMessageTemplate:
    'Halo, saya sudah melakukan transfer untuk {planName} sebesar {planPrice}. Mohon konfirmasi pembayaran saya.',
} as const;

export function getPaymentSettings() {
  return {
    id: 'hardcoded',
    ...BANK_TRANSFER_DETAILS,
    ...PAYMENT_CONTACT_CONFIG,
  };
}

// Global payment limits
export const PAYMENT_LIMITS = {
  MIN_AMOUNT: 1000, // IDR 1,000 minimum
  MAX_AMOUNT: 10000000, // IDR 10,000,000 maximum
  MAX_TRANSACTIONS_PER_USER_PER_DAY: 5,
} as const;

// Transaction creation schema
export const createTransactionSchema = z.object({
  planType: z.enum(['monthly', 'yearly'], {
    message: 'Plan type must be either monthly or yearly',
  }),
  amount: z.number({
    message: 'Amount must be a number',
  })
    .int('Amount must be an integer')
    .min(PAYMENT_LIMITS.MIN_AMOUNT, `Amount must be at least IDR ${PAYMENT_LIMITS.MIN_AMOUNT.toLocaleString()}`)
    .max(PAYMENT_LIMITS.MAX_AMOUNT, `Amount cannot exceed IDR ${PAYMENT_LIMITS.MAX_AMOUNT.toLocaleString()}`),
  currency: z.string()
    .min(3, 'Currency must be at least 3 characters')
    .max(3, 'Currency must be exactly 3 characters')
    .regex(/^[A-Z]+$/, 'Currency must be uppercase letters only')
    .default('IDR'),
  paymentSettings: z.string().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

// Payment settings schema
export const paymentSettingsSchema = z.object({
  bankName: z.string()
    .min(1, 'Bank name is required')
    .max(100, 'Bank name cannot exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s\-\(\)\.]+$/, 'Bank name contains invalid characters'),
  bankAccountNumber: z.string()
    .min(1, 'Bank account number is required')
    .max(50, 'Bank account number cannot exceed 50 characters')
    .regex(/^[0-9\-]+$/, 'Bank account number must contain only numbers and hyphens'),
  bankAccountName: z.string()
    .min(1, 'Bank account name is required')
    .max(100, 'Bank account name cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s\.]+$/, 'Bank account name can only contain letters, spaces, and periods'),
  whatsappPhoneNumber: z.string()
    .min(1, 'WhatsApp phone number is required')
    .max(20, 'WhatsApp phone number cannot exceed 20 characters')
    .regex(/^[0-9+\-\s]+$/, 'WhatsApp phone number contains invalid characters'),
  whatsappMessageTemplate: z.string()
    .min(10, 'WhatsApp message template must be at least 10 characters')
    .max(1000, 'WhatsApp message template cannot exceed 1000 characters'),
});

export type PaymentSettingsInput = z.infer<typeof paymentSettingsSchema>;

// Update payment settings schema (allows partial updates)
export const updatePaymentSettingsSchema = paymentSettingsSchema.partial().extend({
  id: z.string().uuid('Invalid payment settings ID'),
});

export type UpdatePaymentSettingsInput = z.infer<typeof updatePaymentSettingsSchema>;

// Transaction status update schema
export const updateTransactionStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'expired', 'cancelled'], {
    message: 'Invalid transaction status',
  }),
});

export type UpdateTransactionStatusInput = z.infer<typeof updateTransactionStatusSchema>;

// Validation helper functions
export function validatePlanAmount(planType: PlanType, amount: number): boolean {
  const config = PLAN_CONFIGS[planType];
  return amount >= config.minAmount && amount <= config.maxAmount;
}

export function getExpectedAmount(planType: PlanType): number {
  return PLAN_CONFIGS[planType].amount;
}

export function validateAmountMatchesPlan(planType: PlanType, amount: number): {
  isValid: boolean;
  expectedAmount?: number;
  error?: string;
} {
  const expectedAmount = getExpectedAmount(planType);
  
  if (amount !== expectedAmount) {
    return {
      isValid: false,
      expectedAmount,
      error: `Amount ${amount.toLocaleString()} does not match expected amount ${expectedAmount.toLocaleString()} for ${planType} plan`,
    };
  }
  
  return { isValid: true };
}