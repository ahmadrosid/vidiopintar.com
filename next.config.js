if (
  !process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY &&
  process.env.CLERK_SECRET_KEY
) {
  process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY =
    process.env.CLERK_SECRET_KEY;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['vidiopintar.local', 'https://vidiopintar.local'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'yt3.ggpht.com' },
      { protocol: 'https', hostname: 'yt3.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'media.licdn.com' },
      { protocol: 'https', hostname: 'scontent-sin2-1.cdninstagram.com' },
    ],
  },
  output: 'standalone',
  async redirects() {
    return [
      { source: '/mcp', destination: '/panduan', permanent: true },
      { source: '/blog/:path*', destination: '/panduan', permanent: true },
      { source: '/faq', destination: '/panduan', permanent: true },
      { source: '/changelogs', destination: '/panduan', permanent: true },
      { source: '/rss.xml', destination: '/panduan', permanent: true },
      { source: '/profile/billing', destination: '/dashboard/billing', permanent: true },
      { source: '/:path(home|explore|library|notes|profile)/:rest*', destination: '/dashboard', permanent: true },
      { source: '/:path(watch|video|shared)/:rest*', destination: '/', permanent: true },
    ]
  },
  serverExternalPackages: ['@libsql/client'],
  experimental: {
    optimizePackageImports: [
      '@clerk/ui',
      'date-fns',
    ],
  },
}

module.exports = nextConfig;
