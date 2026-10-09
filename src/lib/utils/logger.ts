import { headers } from 'next/headers';
import { z } from 'zod';

const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'key',
  'bankAccountNumber',
  'bankAccountName',
  'whatsappPhoneNumber',
  'paymentSettings',
  'email',
  'ipAddress',
];

const EXCLUDED_FIELDS = [
  'authorization',
  'cookie',
  'x-api-key',
];

type JsonValue = string | number | boolean | null | undefined | JsonValue[] | { [key: string]: JsonValue };

const jsonValue: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.null(), z.undefined(), z.array(jsonValue), z.record(z.string(), jsonValue)]),
);

function asString(value: JsonValue): string | undefined {
  const parsed = z.string().safeParse(value);

  return parsed.success ? parsed.data : undefined;
}

function redactEmail(local: string, domain: string) {
  return local.length > 2 ? `${local.substring(0, 2)}***@${domain}` : `***@${domain}`;
}

function redactTail(value: string) {
  return value.length > 4 ? `***${value.slice(-4)}` : '***';
}

/**
 * Sanitizes an object by redacting sensitive fields
 */
function sanitizeObject(input: JsonValue, depth = 0): JsonValue {
  if (depth > 5) return '[Max Depth Reached]';

  if (input === null || input === undefined) return input;

  const text = asString(input);

  if (text !== undefined) {
    return text.length > 1000 ? text.substring(0, 1000) + '...[truncated]' : text;
  }

  const list = z.array(jsonValue).safeParse(input);

  if (list.success) {
    const items = list.data;

    return items.length > 10
      ? [...items.slice(0, 10), `...[${items.length - 10} more items]`]
      : items.map((item) => sanitizeObject(item, depth + 1));
  }

  const record = z.record(z.string(), jsonValue).safeParse(input);

  if (!record.success) return input;

  const sanitized: Record<string, JsonValue> = {};

  for (const [key, value] of Object.entries(record.data)) {
    const lowerKey = key.toLowerCase();
    const stringValue = asString(value);

    if (EXCLUDED_FIELDS.some(field => lowerKey.includes(field))) {
      continue;
    }

    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
      if (stringValue === undefined) {
        sanitized[key] = '[REDACTED]';
      } else if (lowerKey.includes('email')) {
        const [local, domain = ''] = stringValue.split('@');
        sanitized[key] = redactEmail(local, domain);
      } else if (lowerKey.includes('ip')) {
        const parts = stringValue.split('.');
        sanitized[key] = parts.length === 4 ? `${parts[0]}.${parts[1]}.***.***.` : '***';
      } else if (lowerKey.includes('bankaccount') || lowerKey.includes('phone')) {
        sanitized[key] = redactTail(stringValue);
      } else {
        sanitized[key] = '[REDACTED]';
      }
    } else {
      sanitized[key] = sanitizeObject(value, depth + 1);
    }
  }

  return sanitized;
}

/**
 * Get sanitized request metadata
 */
export async function getSanitizedRequestMetadata(request: Request) {
  const headersList = await headers();
  
  return {
    method: request.method,
    url: new URL(request.url).pathname,
    userAgent: headersList.get('user-agent')?.substring(0, 200) || 'unknown',
    timestamp: new Date().toISOString(),
    ipHint: headersList.get('x-forwarded-for')?.split(',')[0]?.split('.').slice(0, 2).join('.') + '.***' || 'unknown',
  };
}

/**
 * Sanitized logger for payment operations
 */
export const paymentLogger = {
  info: (message: string, data?: any) => {
    console.log(`[PAYMENT-INFO] ${message}`, data ? sanitizeObject(data) : '');
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[PAYMENT-WARN] ${message}`, data ? sanitizeObject(data) : '');
  },
  
  error: (message: string, error?: any, data?: any) => {
    const sanitizedError = error instanceof Error 
      ? { message: error.message, name: error.name }
      : sanitizeObject(error);
    
    console.error(`[PAYMENT-ERROR] ${message}`, {
      error: sanitizedError,
      data: data ? sanitizeObject(data) : undefined,
    });
  },
  
  audit: (action: string, userId: string, data?: any) => {
    console.log(`[PAYMENT-AUDIT] ${action}`, {
      userId,
      timestamp: new Date().toISOString(),
      data: data ? sanitizeObject(data) : undefined,
    });
  },
};

/**
 * Log successful payment operations
 */
export function logPaymentSuccess(operation: string, metadata: any) {
  paymentLogger.audit(`Payment ${operation} successful`, metadata.userId, {
    operation,
    transactionId: metadata.transactionId,
    amount: metadata.amount,
    planType: metadata.planType,
  });
}

/**
 * Log failed payment operations
 */
export function logPaymentFailure(operation: string, error: any, metadata?: any) {
  paymentLogger.error(`Payment ${operation} failed`, error, {
    operation,
    userId: metadata?.userId,
    transactionId: metadata?.transactionId,
  });
}