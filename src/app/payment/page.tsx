import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { CopyButton } from '@/components/ui/copy-button'
import { WhatsAppConfirmButton } from '@/components/payment/whatsapp-confirm-button'
import { transactionsRepository } from '@/lib/db/repository/transactions'
import { getCurrentUser } from '@/lib/auth'
import { getPaymentSettings, PLAN_CONFIGS } from '@/lib/validations/payment'
import { UserPlanService } from '@/lib/user-plan-service'
import { ChevronLeft, AlertTriangle } from 'lucide-react'

interface PaymentPageProps {
  searchParams: Promise<{ plan?: string }>
}

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
    const t = await getTranslations('payment')
    const { plan } = await searchParams

    // Use validated plan configurations
    const planDetails = {
        monthly: {
            name: PLAN_CONFIGS.monthly.name,
            price: `IDR ${PLAN_CONFIGS.monthly.amount.toLocaleString()}`,
            amount: PLAN_CONFIGS.monthly.amount,
            period: 'per month'
        },
        yearly: {
            name: PLAN_CONFIGS.yearly.name, 
            price: `IDR ${PLAN_CONFIGS.yearly.amount.toLocaleString()}`,
            amount: PLAN_CONFIGS.yearly.amount,
            period: 'per year'
        }
    }

    // Validate plan parameter
    const validPlan = plan && (plan === 'monthly' || plan === 'yearly') ? plan : 'monthly';
    const currentPlan = planDetails[validPlan];
    const paymentSettings = getPaymentSettings();

    // Get current user and handle transaction
    let user;
    let transaction;
    let existingTransaction;
    let canPurchaseCheck;
    
    try {
        user = await getCurrentUser();
        
        // Check if user can purchase this plan (no active subscription)
        canPurchaseCheck = await UserPlanService.canPurchasePlan(user.id, validPlan as any);
        
        if (!canPurchaseCheck.canPurchase) {
            // User already has an active subscription, we'll show an error
        } else {
            // Check if user already has a pending transaction for this plan
            existingTransaction = await transactionsRepository.getPendingTransactionByUserAndPlan(user.id, validPlan);
            
            if (existingTransaction) {
                // Use existing transaction instead of creating a new one
                transaction = existingTransaction;
            } else {
                // Create new transaction for this payment request
                transaction = await transactionsRepository.create({
                    userId: user.id,
                    planType: validPlan,
                    amount: currentPlan.amount,
                    currency: 'IDR',
                    transactionReference: await transactionsRepository.generateUniqueReference(),
                    paymentSettings: JSON.stringify(paymentSettings),
                });
            }
        }
    } catch (error) {
        console.error('Error handling transaction:', error);
        // Continue without transaction if user not authenticated
    }

    const bankDetails = {
        bankName: paymentSettings.bankName,
        accountNumber: paymentSettings.bankAccountNumber,
        accountName: paymentSettings.bankAccountName,
    }

    let whatsappMessage = paymentSettings.whatsappMessageTemplate
        .replace('{planName}', currentPlan.name)
        .replace('{planPrice}', currentPlan.price)

    // Add transaction reference if available
    if (transaction?.transactionReference) {
        whatsappMessage += `\n\nReferensi Transaksi: ${transaction.transactionReference}`
    }
    
    const whatsappPhone = paymentSettings.whatsappPhoneNumber;
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="mx-auto max-w-lg">
                <div className="mb-6">
                    <Link href="/home" className="text-foreground hover:underline hover:text-accent transition-colors inline-flex gap-2 items-center">
                        <ChevronLeft className="size-4" />
                        Home
                    </Link>
                </div>
                <div className="text-center mb-8">
                    <h1 className="text-xl font-medium mb-2">{t('title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
                </div>

                {canPurchaseCheck && !canPurchaseCheck.canPurchase && canPurchaseCheck.reason === 'already_have_active_subscription' && (
                    <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                                <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="text-sm">
                                <p className="font-medium text-red-900 dark:text-red-100 mb-1">Active Subscription Found</p>
                                <p className="text-red-800 dark:text-red-200 mb-3">
                                    You already have an active {currentPlan.name} subscription. You cannot purchase the same plan while it's still active.
                                </p>
                                {canPurchaseCheck.activeSubscription && (
                                    <p className="text-xs text-red-700 dark:text-red-300">
                                        Your current subscription expires on: {canPurchaseCheck.activeSubscription.expiresAt.toLocaleDateString()}
                                    </p>
                                )}
                                <div className="mt-4">
                                    <Link 
                                        href="/profile/billing" 
                                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 dark:text-red-200 dark:bg-red-800 dark:border-red-600 dark:hover:bg-red-700 transition-colors"
                                    >
                                        View My Subscription
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {existingTransaction && (
                    <p className="text-sm text-muted-foreground text-center mb-6">
                        {t('existingPayment')}
                    </p>
                )}

                {(!canPurchaseCheck || canPurchaseCheck.canPurchase) && (
                <div className="bg-card border rounded-lg p-6 space-y-6">
                    <div className="flex items-baseline justify-between">
                        <h2 className="font-medium">{currentPlan.name}</h2>
                        <p className="text-lg font-semibold">{currentPlan.price}</p>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {bankDetails.bankName} · {bankDetails.accountName}
                    </p>

                    <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">{t('accountNumber')}</p>
                                <p className="font-mono truncate">{bankDetails.accountNumber}</p>
                            </div>
                            <CopyButton content={bankDetails.accountNumber} copyMessage={t('copied')} />
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground">{t('amount')}</p>
                                <p className="font-medium">{currentPlan.price}</p>
                            </div>
                            <CopyButton content={currentPlan.price.split(' ')[1]} copyMessage={t('copied')} />
                        </div>

                        {transaction?.transactionReference && (
                            <div className="flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground">{t('transactionReference')}</p>
                                    <p className="font-mono truncate">{transaction.transactionReference}</p>
                                </div>
                                <CopyButton content={transaction.transactionReference} copyMessage={t('copied')} />
                            </div>
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground">{t('instructionsShort')}</p>

                    <div className="space-y-3 text-center">
                        <WhatsAppConfirmButton 
                            whatsappUrl={whatsappUrl}
                            transactionId={transaction?.id}
                        />
                        <p className="text-xs text-muted-foreground">{t('confirmationNote')}</p>
                    </div>
                </div>
                )}
            </div>
        </div>
    )
}
