import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://vidiopintar.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/faq',
          '/home',
          '/category/*',
          '/changelogs',
          '/privacy',
          '/terms',
          '/login',
          '/register',
          '/shared/*',
        ],
        disallow: [
          '/admin/*',
          '/profile/*',
          '/video/*',
          '/watch',
          '/payment',
          '/api/*',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: ['/'],
      },
      {
        userAgent: 'CCBot',
        disallow: ['/'],
      },
      {
        userAgent: 'anthropic-ai',
        disallow: ['/'],
      },
      {
        userAgent: 'Claude-Web',
        disallow: ['/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
