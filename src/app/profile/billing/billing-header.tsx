'use client';

import { useTranslations } from 'next-intl';

export function BillingHeader() {
  const t = useTranslations('billing');

  return (
    <div className="flex flex-col gap-7 mb-8">
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
    </div>
  );
}