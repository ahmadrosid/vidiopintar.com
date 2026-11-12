export const PLAN_CONFIGS = {
  monthly: {
    amount: 50000,
  },
  yearly: {
    amount: 500000,
  },
} as const;

const BANK_TRANSFER_DETAILS = {
  bankName: "BNI",
  bankAccountNumber: "1229085831",
  bankAccountName: "Ahmad Rosid",
} as const;

const PAYMENT_CONTACT_CONFIG = {
  whatsappPhoneNumber: "6281234567890",
  whatsappMessageTemplate:
    "Halo, saya sudah melakukan transfer untuk {planName} sebesar {planPrice}. Mohon konfirmasi pembayaran saya.",
} as const;

export function getPaymentSettings() {
  return {
    ...BANK_TRANSFER_DETAILS,
    ...PAYMENT_CONTACT_CONFIG,
  };
}
