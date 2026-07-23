export type MayarEnvelope<T> = {
  statusCode?: number;
  message?: string;
  messages?: string | string[];
  data?: T;
};

export type MayarWebhookPayload = {
  event?: string;
  data?: {
    id?: string;
    transactionId?: string;
    transactionStatus?: string;
    status?: string | boolean;
    memberId?: string;
    customerEmail?: string;
    customerName?: string;
    customerMobile?: string;
    expiredAt?: string;
    updatedAt?: string;
    amount?: number;
    productId?: string;
  };
};

export type PlanType = "monthly" | "yearly";
