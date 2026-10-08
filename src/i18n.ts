import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => ({
  locale: 'id',
  messages: (await import('../i18n/id.json')).default,
}));
