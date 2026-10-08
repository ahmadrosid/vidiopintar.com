'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Gift, Calendar, CheckCircle, Clock } from 'lucide-react';
import { formatDisplayDate } from '@/lib/utils';

interface SubscriptionDetails {
  expiresAt: Date;
  transaction: any;
}

interface CurrentPlanCardProps {
  currentPlan: 'free' | 'monthly' | 'yearly';
  subscriptionDetails?: SubscriptionDetails | null;
}

function formatExpirationDate(date: Date) {
  return formatDisplayDate(date);
}

function getDaysUntilExpiry(date: Date) {
  const now = new Date();
  const expiry = new Date(date);
  const timeDiff = expiry.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return daysDiff;
}

function buildPlanDetails() {
  return {
    free: {
      name: "Gratis",
      price: 'Free',
      period: "selamanya",
      icon: Gift,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50 dark:bg-gray-800',
      features: [
        "2 video per hari",
        "Wawasan AI dasar",
        "Ringkasan sederhana",
        "Dukungan komunitas"
      ]
    },
    monthly: {
      name: "Bulanan",
      price: 'IDR 50,000',
      period: "per bulan",
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      features: [
        "Pemrosesan video tanpa batas",
        "Wawasan bertenaga AI",
        "Ringkasan instan",
        "Dukungan email"
      ]
    },
    yearly: {
      name: "Tahunan",
      price: 'IDR 500,000',
      period: "per tahun",
      icon: Crown,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      features: [
        "Pemrosesan video tanpa batas",
        "Wawasan bertenaga AI",
        "Ringkasan instan",
        "Dukungan email",
        "Dukungan prioritas"
      ]
    }
  };
}

export function CurrentPlanCard({ currentPlan, subscriptionDetails }: CurrentPlanCardProps) {

  const planDetails = buildPlanDetails();
  const plan = planDetails[currentPlan];

  return (
    <Card className="bg-card border border-border shadow-none rounded-xs">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-primary">{"Paket Saat Ini"}</CardTitle>
            <p className="text-sm text-secondary-foreground">{"Langganan aktif kamu"}</p>
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
            <h4 className="font-semibold text-[0.9375rem] text-secondary-foreground">{"Fitur Paket:"}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-[0.9375rem] text-primary">
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