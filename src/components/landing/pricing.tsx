'use client'

import { Check } from 'lucide-react'
import { useState } from 'react'

const pricingPlans = {
    free: {
        name: 'Free',
        price: '$0',
        period: '/month',
        description: 'Perfect for trying out the service',
        features: [
            '5 videos per month',
            'Basic AI insights',
            'Resets monthly',
            'No credit card required'
        ],
        buttonText: 'Get Started Free',
        buttonStyle: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
    },
    pro: {
        monthly: {
            name: 'Pro',
            price: '$5',
            period: '/month',
            description: 'Full access, monthly billing',
            features: [
                'Unlimited video',
                'Priority support',
                'Personal knowledge base',
                'Cancel anytime'
            ],
            buttonText: 'Get Started',
            buttonStyle: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
            badge: undefined
        },
        yearly: {
            name: 'Pro',
            price: '$50',
            period: '/year',
            description: 'Save $10 with annual billing',
            features: [
                'Unlimited video',
                'Priority support',
                'Personal knowledge base',
                'Cancel anytime'
            ],
            buttonText: 'Get Started',
            buttonStyle: 'bg-primary text-primary-foreground hover:bg-primary/90',
            badge: 'Best Value'
        }
    },
    lifetime: {
        name: 'Lifetime',
        price: '$95',
        period: 'one-time',
        description: 'Pay once, use forever',
        features: [
            'Everything in Yearly',
            'Lifetime updates',
            'Exclusive features',
            'No recurring charges'
        ],
        buttonText: 'Buy Forever',
        buttonStyle: 'bg-orange-500 text-white hover:bg-orange-600',
        badge: 'Limited Offer'
    }
}

export function Pricing() {
    const [isYearly, setIsYearly] = useState(false)
    const currentPro = isYearly ? pricingPlans.pro.yearly : pricingPlans.pro.monthly
    return (
        <section className="py-12 md:py-20">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                    <h2 className="text-balance text-4xl font-medium lg:text-5xl">Simple, transparent pricing</h2>
                    <p>Start free with 5 videos per month, or choose a plan that works best for you.</p>
                    
                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <span className={`text-sm ${!isYearly ? 'font-medium' : 'text-muted-foreground'}`}>Monthly</span>
                        <button
                            onClick={() => setIsYearly(!isYearly)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                isYearly ? 'bg-primary' : 'bg-gray-200'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    isYearly ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                        <span className={`text-sm ${isYearly ? 'font-medium' : 'text-muted-foreground'}`}>
                            Yearly 
                            <span className="ml-1 text-green-600 font-medium">Save $10</span>
                        </span>
                    </div>
                </div>

                <div className="relative mx-auto grid max-w-4xl gap-8 px-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Free Plan */}
                    <div className="relative space-y-6 border p-8 rounded-lg">
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">{pricingPlans.free.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold">{pricingPlans.free.price}</span>
                                <span className="text-sm text-muted-foreground">{pricingPlans.free.period}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{pricingPlans.free.description}</p>
                        </div>
                        
                        <ul className="space-y-3">
                            {pricingPlans.free.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2">
                                    <Check className="size-4 text-green-600" />
                                    <span className="text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button className={`w-full rounded-md px-4 py-2 text-sm font-medium ${pricingPlans.free.buttonStyle}`}>
                            {pricingPlans.free.buttonText}
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className={`relative space-y-6 border p-8 rounded-lg ${isYearly ? 'bg-muted/50' : ''}`}>
                        {currentPro.badge && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-full">
                                    {currentPro.badge}
                                </span>
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">{currentPro.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold">{currentPro.price}</span>
                                <span className="text-sm text-muted-foreground">{currentPro.period}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{currentPro.description}</p>
                        </div>
                        
                        <ul className="space-y-3">
                            {currentPro.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2">
                                    <Check className="size-4 text-green-600" />
                                    <span className="text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button className={`w-full rounded-md px-4 py-2 text-sm font-medium ${currentPro.buttonStyle}`}>
                            {currentPro.buttonText}
                        </button>
                    </div>

                    {/* Lifetime Plan */}
                    <div className="relative space-y-6 border p-8 rounded-lg border-orange-200 bg-orange-50/50">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="bg-orange-500 text-white px-3 py-1 text-xs font-medium rounded-full">
                                {pricingPlans.lifetime.badge}
                            </span>
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">{pricingPlans.lifetime.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold">{pricingPlans.lifetime.price}</span>
                                <span className="text-sm text-muted-foreground">{pricingPlans.lifetime.period}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{pricingPlans.lifetime.description}</p>
                        </div>
                        
                        <ul className="space-y-3">
                            {pricingPlans.lifetime.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2">
                                    <Check className="size-4 text-green-600" />
                                    <span className="text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button className={`w-full rounded-md px-4 py-2 text-sm font-medium ${pricingPlans.lifetime.buttonStyle}`}>
                            {pricingPlans.lifetime.buttonText}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}