import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Alert01Icon } from "@hugeicons/core-free-icons";
import Link from 'next/link'
import { CopyButton } from '@/components/ui/copy-button'
import { WhatsAppConfirmButton } from '@/components/payment/whatsapp-confirm-button'
import { transactionsRepository } from '@/lib/db/repository/transactions'
import { getCurrentUser } from '@/lib/auth'
import { getPaymentSettings, PLAN_CONFIGS } from '@/lib/validations/payment'
import { UserPlanService } from '@/lib/user-plan-service'

interface PaymentPageProps {
  searchParams: Promise<{ plan?: string }>
}

const PLAN_NAMES = {
  monthly: 'Paket Bulanan',
  yearly: 'Paket Tahunan',
} as const;

function getPlanDetails(validPlan: 'monthly' | 'yearly') {
  const config = PLAN_CONFIGS[validPlan];

  return {
    name: PLAN_NAMES[validPlan],
    price: `IDR ${config.amount.toLocaleString('id-ID')}`,
    amount: config.amount,
  };
}

async function getPaymentContext(
    validPlan: 'monthly' | 'yearly',
    currentPlan: ReturnType<typeof getPlanDetails>,
    paymentSettings: ReturnType<typeof getPaymentSettings>,
) {
    let transaction;
    let existingTransaction;
    let canPurchaseCheck;

    try {
        const user = await getCurrentUser();
        canPurchaseCheck = await UserPlanService.canPurchasePlan(user.id, validPlan);

        if (canPurchaseCheck.canPurchase) {
            existingTransaction = await transactionsRepository.getPendingTransactionByUserAndPlan(user.id, validPlan);
            transaction = existingTransaction ?? await transactionsRepository.create({
                userId: user.id,
                planType: validPlan,
                amount: currentPlan.amount,
                currency: 'IDR',
                transactionReference: await transactionsRepository.generateUniqueReference(),
                paymentSettings: JSON.stringify(paymentSettings),
            });
        }
    } catch (error) {
        console.error('Error handling transaction:', error);
    }

    return { transaction, canPurchaseCheck };
}

function DetailRow({ label, value, copyValue }: { label: string; value: string; copyValue?: string }) {
    return (
        <div className="flex items-center justify-between gap-4 border-t border-site-line-soft py-4">
            <div className="min-w-0">
                <p className="text-xs text-site-text-muted">{label}</p>
                <p className="truncate font-mono text-site-text">{value}</p>
            </div>
            {copyValue && (
                <CopyButton content={copyValue} copyMessage={"Disalin!"} label="Salin" className="text-site-text-muted" />
            )}
        </div>
    )
}

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
    const { plan } = await searchParams

    const validPlan = plan && (plan === 'monthly' || plan === 'yearly') ? plan : 'monthly';
    const currentPlan = getPlanDetails(validPlan);
    const paymentSettings = getPaymentSettings();

    const { transaction, canPurchaseCheck } = await getPaymentContext(
        validPlan,
        currentPlan,
        paymentSettings,
    );

    const bankDetails = {
        bankName: paymentSettings.bankName,
        accountNumber: paymentSettings.bankAccountNumber,
        accountName: paymentSettings.bankAccountName,
    }

    const reference = transaction?.transactionReference;

    let whatsappMessage = paymentSettings.whatsappMessageTemplate
        .replace('{planName}', currentPlan.name)
        .replace('{planPrice}', currentPlan.price)

    if (reference) {
        whatsappMessage += `\n\nReferensi Transaksi: ${reference}`
    }

    const whatsappPhone = paymentSettings.whatsappPhoneNumber;
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`

    return (
        <div className="min-h-screen bg-site-bg px-6 py-10 font-mono text-site-text-2">
            <div className="mx-auto max-w-lg">
                <div className="mb-6">
                    <Link href="/dashboard/billing" className="inline-flex items-center gap-2 text-sm text-site-text-muted transition-colors hover:text-site-text">
                        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
                        Tagihan
                    </Link>
                </div>
                <div className="mb-10 mt-10">
                    <h1 className="font-display text-4xl font-extrabold leading-none tracking-tight text-site-text sm:text-5xl">{"Selesaikan Pembayaran"}</h1>
                    <p className="text-sm text-site-text-muted">{"Transfer ke rekening di bawah, lalu konfirmasi via WhatsApp"}</p>
                </div>

                {canPurchaseCheck && !canPurchaseCheck.canPurchase && canPurchaseCheck.reason === 'already_have_active_subscription' && (
                    <div className="mb-6 border border-site-line border-l-2 border-l-site-accent bg-site-panel p-5">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                                <HugeiconsIcon icon={Alert01Icon} className="size-5 text-site-accent" />
                            </div>
                            <div className="text-sm">
                                <p className="mb-1 font-semibold text-site-text">Langganan aktif ditemukan</p>
                                <p className="mb-3 text-site-text-2">
                                    Kamu sudah punya {currentPlan.name} yang masih aktif. Paket yang sama belum bisa dibeli sampai masa aktifnya habis.
                                </p>
                                {canPurchaseCheck.activeSubscription && (
                                    <p className="text-xs text-site-text-muted">
                                        Berakhir pada {canPurchaseCheck.activeSubscription.expiresAt.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}
                                    </p>
                                )}
                                <div className="mt-4">
                                    <Link
                                        href="/dashboard/billing"
                                        className="inline-flex min-h-10 items-center border border-site-line px-4 text-sm font-semibold text-site-text transition-colors hover:border-site-line-strong"
                                    >
                                        Lihat langganan saya
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {(!canPurchaseCheck || canPurchaseCheck.canPurchase) && (
                <div className="border border-site-line bg-site-panel p-5 sm:p-6">
                    <div className="flex items-baseline justify-between gap-4">
                        <p className="text-sm text-site-text-muted">{currentPlan.name}</p>
                        <p className="font-display text-3xl font-extrabold tracking-tight text-site-text">{currentPlan.price}</p>
                    </div>

                    <div className="mt-6">
                        <DetailRow label="Bank" value={`${bankDetails.bankName} · ${bankDetails.accountName}`} />
                        <DetailRow label="Rekening" value={bankDetails.accountNumber} copyValue={bankDetails.accountNumber} />
                        {reference && <DetailRow label="Referensi" value={reference} copyValue={reference} />}
                    </div>

                    <p className="mt-6 text-sm text-site-text-2">
                        {reference
                            ? `Transfer tepat ${currentPlan.price} dan tulis kode referensi di berita transfer.`
                            : `Transfer tepat ${currentPlan.price}.`}
                    </p>

                    <div className="mt-6 space-y-3">
                        <WhatsAppConfirmButton
                            whatsappUrl={whatsappUrl}
                            transactionId={transaction?.id}
                            label="Saya sudah transfer"
                        />
                        <p className="text-center text-xs text-site-text-muted">Kami verifikasi dan aktifkan langganan dalam 24 jam.</p>
                    </div>
                </div>
                )}
            </div>
        </div>
    )
}
