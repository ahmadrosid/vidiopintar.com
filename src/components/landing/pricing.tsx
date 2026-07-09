'use client';

import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function Pricing() {
    const t = useTranslations('pricing');
    
    const plans = [
        {
            id: 'free',
            name: t('plans.free.name'),
            price: 'Free',
            period: t('plans.free.period'),
            description: t('plans.free.description'),
            features: [
                t('plans.free.features.limited'),
                t('plans.free.features.basic'),
                t('plans.free.features.summaries'),
                t('plans.free.features.quiz'),
                t('plans.free.features.community')
            ],
            popular: false,
            free: true
        },
        {
            id: 'monthly',
            name: t('plans.monthly.name'),
            price: 'IDR 50,000',
            period: t('plans.monthly.period'),
            description: t('plans.monthly.description'),
            features: [
                t('plans.monthly.features.unlimited'),
                t('plans.monthly.features.ai'),
                t('plans.monthly.features.summaries'),
                t('plans.monthly.features.quiz'),
                t('plans.monthly.features.support')
            ],
            popular: false
        },
        {
            id: 'yearly',
            name: t('plans.yearly.name'),
            price: 'IDR 500,000',
            period: t('plans.yearly.period'),
            description: t('plans.yearly.description'),
            originalPrice: 'IDR 600,000',
            features: [
                t('plans.yearly.features.unlimited'),
                t('plans.yearly.features.ai'),
                t('plans.yearly.features.summaries'),
                t('plans.yearly.features.quiz'),
                t('plans.yearly.features.support'),
                t('plans.yearly.features.priority')
            ],
            popular: true
        }
    ];

    return (
        <section className="py-16 md:py-24 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
            
            <div className="mx-auto max-w-5xl px-6 relative">
                <div className="text-center mb-16">
                    <div className="space-y-4">
                        <h2 className="text-balance text-4xl tracking-tighter font-medium lg:text-6xl mb-6 bg-gradient-to-br from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent leading-tight">
                            {t('title')}
                        </h2>
                        <p className="text-xl text-muted-foreground/80 max-w-3xl mx-auto leading-relaxed">
                            {t('subtitle')}
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 md:gap-6 md:grid-cols-3 max-w-5xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`group relative rounded-2xl border p-6 transition-all duration-500 ease-out hover:shadow-xl min-h-[480px] flex flex-col ${
                                plan.popular
                                    ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/15 hover:shadow-primary/30'
                                    : 'border-border bg-card hover:border-primary/40 hover:bg-card/90 hover:shadow-primary/10'
                            }`}
                        >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <div className="bg-gradient-to-r from-blue-400 to-sky-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                                            ✨ {t('popular')}
                                        </div>
                                    </div>
                                )}

                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold mb-4">{plan.name}</h3>
                                    <div className="mb-3">
                                        <div className="flex items-baseline justify-center gap-1 mb-1">
                                            {plan.free ? (
                                                <span className="text-3xl font-bold tracking-tight">
                                                    {plan.price}
                                                </span>
                                            ) : (
                                                <>
                                                    <span className="text-3xl font-bold tracking-tight">
                                                        {plan.price.split(' ')[1]}
                                                    </span>
                                                    <div className="flex flex-col items-start">
                                                        <span className="text-sm font-medium opacity-70">
                                                            {plan.price.split(' ')[0]}
                                                        </span>
                                                        {plan.originalPrice && (
                                                            <span className="text-xs opacity-50 line-through">
                                                                {plan.originalPrice.split(' ')[1]}
                                                            </span>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <p className="text-sm opacity-70 font-medium">{plan.period}</p>
                                    </div>
                                    <p className="text-sm opacity-80">{plan.description}</p>
                                </div>

                                <div className="space-y-3 mb-6 flex-grow">
                                    {plan.features.map((feature, featureIndex) => (
                                        <div 
                                            key={featureIndex} 
                                            className="flex items-start gap-3 group/feature"
                                        >
                                            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                plan.popular 
                                                    ? 'bg-background/20 text-primary-foreground' 
                                                    : 'bg-primary/10 text-primary group-hover/feature:bg-primary group-hover/feature:text-primary-foreground'
                                            }`}>
                                                <Check className="size-3" />
                                            </div>
                                            <span className="text-sm font-medium leading-relaxed">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <a
                                    href={plan.free ? '/register' : `/payment?plan=${plan.id}`}
                                    className={`w-full py-3 px-4 rounded-xl font-semibold text-base transition-all duration-300 inline-block text-center ${
                                        plan.popular
                                            ? 'bg-background text-foreground hover:bg-background/90 shadow-md hover:shadow-lg'
                                            : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg hover:shadow-primary/20'
                                    }`}
                                >
                                    {plan.free ? t('getStartedFree') : t('getStarted')}
                                </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}