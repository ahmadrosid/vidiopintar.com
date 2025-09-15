'use client';

import React from "react";
import { CircleCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSession } from "@/lib/auth-client";
import { useRouter } from 'next/navigation';

export default function NewPricing() {
  const t = useTranslations('pricing');
  const { data: session } = useSession();
  const router = useRouter();

  const pricingData = [
    {
      id: 'free',
      tier: t('plans.free.name'),
      price: 'Free',
      recurring: t('plans.free.period'),
      discount: false,
      benefit: [
        t('plans.free.features.limited'),
        t('plans.free.features.basic'),
        t('plans.free.features.summaries'),
        t('plans.free.features.community')
      ],
      cta: t('getStartedFree'),
      free: true
    },
    {
      id: 'monthly',
      tier: t('plans.monthly.name'),
      price: 'IDR 50,000',
      recurring: t('plans.monthly.period'),
      discount: false,
      benefit: [
        t('plans.monthly.features.unlimited'),
        t('plans.monthly.features.ai'),
        t('plans.monthly.features.summaries'),
        t('plans.monthly.features.support')
      ],
      cta: t('getStarted'),
      free: false
    },
    {
      id: 'yearly',
      tier: t('plans.yearly.name'),
      price: 'IDR 500,000',
      recurring: t('plans.yearly.period'),
      discount: true,
      amount: 600000,
      originalPrice: 'IDR 600,000',
      benefit: [
        t('plans.yearly.features.unlimited'),
        t('plans.yearly.features.ai'),
        t('plans.yearly.features.summaries'),
        t('plans.yearly.features.support'),
        t('plans.yearly.features.priority')
      ],
      cta: t('getStarted'),
      free: false,
      popular: true
    }
  ];
  return (
    <div className="flex flex-col gap-7 pt-28">
      <div className="flex justify-start items-center gap-2 w-full">
        <div className="w-4 h-1 bg-accent rounded-full"></div>
        <div className="uppercase text-[0.8125rem] text-secondary-foreground font-medium">
          {t('title')}
        </div>
      </div>
      <div className="text-4xl text-primary font-semibold tracking-tight">
        {t('title')}
        <div className="text-secondary-foreground text-base font-normal pt-3 tracking-normal">
          {t('subtitle')}
        </div>
      </div>
      <div className="flex gap-2.5 flex-wrap lg:flex-nowrap">
        {pricingData.map((data) => (
          <div
            key={data.id}
            className="flex flex-col gap-7 bg-card px-7 py-8 rounded-xs min-h-[472px] w-full hover:bg-card/85 transition border-t-3 border-card hover:border-t-3 hover:border-accent"
          >
            <div className="flex flex-col gap-7 relative">
              <div className="text-[0.9375rem] text-primary uppercase relative">
                <div className="h-5 w-[3px] -ml-7 -mb-[22px] bg-accent text-primary" />
                {data.tier}
                {data.discount && (
                  <div className="absolute flex gap-2 text-sm text-[#D1CDFF] normal-case font-medium right-0 -mt-7 -mr-10 pl-4 pr-3 py-2 bg-[#6155F5] border-x-[2px] border-b-2 border-[#463CBC] rounded-sm shadow-[inset_0px_0.5px_1px_0px_rgba(255,255,255,0.4),0px_4px_8px_1px_#000000]">
                    <span className="drop-shadow-[0px_1px_2px_#5047C9] select-none">
                      Save 20%
                    </span>
                    <Sparkles
                      fill="#D1CDFF"
                      className="size-4 text-[#D1CDFF] drop-shadow-[0px_1px_2px_#5047C9]"
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-2 text-3xl font-semibold text-primary">
                  {data.price}
                  {data.originalPrice && (
                    <div className="text-base text-secondary-foreground font-normal line-through mt-2.5">
                      {data.originalPrice}
                    </div>
                  )}
                </div>
                <div className="text-secondary-foreground text-[0.9375rem]">
                  {data.recurring}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="text-secondary-foreground text-[0.9375rem] mb-1">
                  What's included:
                </div>
                {data.benefit.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 text-[0.9375rem] text-primary"
                  >
                    <CircleCheck className="size-4 text-primary" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            {data.free ? (
              <Link
                href="/register"
                className="mt-auto w-fit"
              >
                <Button
                  variant="default"
                  className="rounded-xs min-w-[100px] w-fit font-semibold border-b-2 border-x-1 border-[#00AAB6] text-[0.9375rem] hover:cursor-pointer shadow-[inset_0px_0.5px_1px_0px_#88F8FF,0px_6px_20px_2px_#000000] active:shadow-none active:scale-[0.975] transition-shadow duration-200 ease-in-out"
                >
                  {data.cta}
                </Button>
              </Link>
            ) : (
              <Button
                variant="default"
                className="mt-auto rounded-xs min-w-[100px] w-fit font-semibold border-b-2 border-x-1 border-[#00AAB6] text-[0.9375rem] hover:cursor-pointer shadow-[inset_0px_0.5px_1px_0px_#88F8FF,0px_6px_20px_2px_#000000] active:shadow-none active:scale-[0.975] transition-shadow duration-200 ease-in-out"
                onClick={() => {
                  if (session) {
                    // User is logged in, go directly to payment
                    router.push(`/payment?plan=${data.id}`);
                  } else {
                    // User is not logged in, store plan and redirect to login
                    sessionStorage.setItem('selectedPlan', data.id);
                    router.push(`/login?returnTo=${encodeURIComponent(`/payment?plan=${data.id}`)}`);
                  }
                }}
              >
                {data.cta}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
