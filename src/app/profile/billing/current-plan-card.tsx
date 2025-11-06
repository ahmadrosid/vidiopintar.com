'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Gift, Calendar, CheckCircle, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SubscriptionDetails {
  expiresAt: Date;
  transaction: any;
}

interface CurrentPlanCardProps {
  currentPlan: 'free' | 'monthly' | 'yearly';
  subscriptionDetails?: SubscriptionDetails | null;
}

export function CurrentPlanCard({ currentPlan, subscriptionDetails }: CurrentPlanCardProps) {
  const t = useTranslations('pricing');
  const tBilling = useTranslations('billing');

  const formatExpirationDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (date: Date) => {
    const now = new Date();
    const expiry = new Date(date);
    const timeDiff = expiry.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysDiff;
  };

  const planDetails = {
    free: {
      name: t('plans.free.name'),
      price: 'Free',
      period: t('plans.free.period'),
      icon: Gift,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50 dark:bg-gray-800',
      features: [
        t('plans.free.features.limited'),
        t('plans.free.features.basic'),
        t('plans.free.features.summaries'),
        t('plans.free.features.community')
      ]
    },
    monthly: {
      name: t('plans.monthly.name'),
      price: 'IDR 50,000',
      period: t('plans.monthly.period'),
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      features: [
        t('plans.monthly.features.unlimited'),
        t('plans.monthly.features.ai'),
        t('plans.monthly.features.summaries'),
        t('plans.monthly.features.support')
      ]
    },
    yearly: {
      name: t('plans.yearly.name'),
      price: 'IDR 500,000',
      period: t('plans.yearly.period'),
      icon: Crown,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      features: [
        t('plans.yearly.features.unlimited'),
        t('plans.yearly.features.ai'),
        t('plans.yearly.features.summaries'),
        t('plans.yearly.features.support'),
        t('plans.yearly.features.priority')
      ]
    }
  };

  const plan = planDetails[currentPlan];

  return (
    <Card className="bg-card transition-all shadow-[0px_6px_20px_2px_#00000033]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-primary">{tBilling('currentPlan.title')}</CardTitle>
            <p className="text-sm text-secondary-foreground">{tBilling('currentPlan.description')}</p>
          </div>
          <Badge variant={currentPlan === 'yearly' ? 'default' : currentPlan === 'monthly' ? 'secondary' : 'outline'}>
            {plan.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold text-primary">{plan.price}</span>
            {plan.period && <span className="text-[0.9375rem] text-secondary-foreground">/ {plan.period}</span>}
          </div>
          
          {subscriptionDetails && (
            <div className="mb-4 p-4 bg-card/50 rounded-xs border-2 border-dashed border-accent">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-accent" />
                <span className="text-[0.9375rem] font-semibold text-primary">
                  Subscription Status
                </span>
              </div>
              <div className="text-[0.9375rem] text-secondary-foreground">
                <p>
                  Expires on {formatExpirationDate(subscriptionDetails.expiresAt)}
                </p>
                <p className="text-sm mt-1">
                  {getDaysUntilExpiry(subscriptionDetails.expiresAt) > 0
                    ? `${getDaysUntilExpiry(subscriptionDetails.expiresAt)} days remaining`
                    : 'Expired'
                  }
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-semibold text-[0.9375rem] text-secondary-foreground">{tBilling('currentPlan.features')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-[0.9375rem] text-primary">
                  <CheckCircle className="size-4 text-primary flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}