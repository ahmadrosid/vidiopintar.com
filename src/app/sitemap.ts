import { MetadataRoute } from 'next'
import { SITE_LAST_MODIFIED, SITE_URL } from '@/lib/geo/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    {
      url: SITE_URL,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/panduan`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/llms.txt`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: 'weekly' as const,
      priority: 0.3,
    },
  ]

  return staticPages
}
