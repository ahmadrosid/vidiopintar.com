import { headers } from 'next/headers';

// Sensitive fields that should be redacted from logs
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'key',
  'bankAccountNumber',
  'bankAccountName',
  'whatsappPhoneNumber',
  'paymentSettings',
  'email', // Partially redact emails
  'ipAddress', // Partially redact IPs
  'mobile',
  'phone',
  'customerName',
  'customerEmail',
  'customerMobile',
  'msisdn',
];

// Fields to completely exclude from logs
const EXCLUDED_FIELDS = [
  'authorization',
  'cookie',
  'x-api-key',
];

/**
 * Sanitizes an object by redacting sensitive fields
 */
function sanitizeObject(obj: any, depth = 0): any {
  if (depth > 5) return '[Max Depth Reached]'; // Prevent infinite recursion
  
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return obj.length > 1000 ? obj.substring(0, 1000) + '...[truncated]' : obj;
  }
  
  if (typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.length > 10 
      ? [...obj.slice(0, 10), `...[${obj.length - 10} more items]`]
      : obj.map(item => sanitizeObject(item, depth + 1));
  }
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    // Exclude sensitive fields entirely
    if (EXCLUDED_FIELDS.some(field => lowerKey.includes(field))) {
      continue;
    }
    
    // Redact sensitive fields
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
      if (lowerKey.includes('email') && typeof value === 'string') {
        // Partially redact email
        const [local, domain] = value.split('@');
        sanitized[key] = local.length > 2 
          ? `${local.substring(0, 2)}***@${domain}`
          : `***@${domain}`;
      } else if (lowerKey.includes('ip') && typeof value === 'string') {
        // Partially redact IP address
        const parts = value.split('.');
        sanitized[key] = parts.length === 4 
          ? `${parts[0]}.${parts[1]}.***.***.`
          : '***';
      } else if (lowerKey.includes('bankaccount') && typeof value === 'string') {
        // Redact bank account info
        sanitized[key] = value.length > 4 
          ? `***${value.slice(-4)}`
          : '***';
      } else if (lowerKey.includes('phone') && typeof value === 'string') {
        // Redact phone number
        sanitized[key] = value.length > 4 
          ? `***${value.slice(-4)}`
          : '***';
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
    url: new URL(request.url).pathname, // Only path, no query params
    userAgent: headersList.get('user-agent')?.substring(0, 200) || 'unknown',
    timestamp: new Date().toISOString(),
    // Don't log full IP, just first two octets for geographic info
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