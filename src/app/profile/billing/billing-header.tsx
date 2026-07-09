'use client';

import { useTranslations } from 'next-intl';

export function BillingHeader() {
  const t = useTranslations('billing');

  return (
    <div className="mb-8">
      <div className="text-4xl text-primary font-semibold tracking-tight">
        {t('title')}
        <div className="text-secondary-foreground text-base font-normal pt-3 tracking-normal">
          {t('subtitle')}
        </div>
      </div>
    </div>
  );
}