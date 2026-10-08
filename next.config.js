// Keep server action IDs stable across deploys/restarts when no explicit key is set.
if (
  !process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY &&
  process.env.CLERK_SECRET_KEY
) {
  process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY =
    process.env.CLERK_SECRET_KEY;
}

const withNextIntl = require('next-intl/plugin')(
  // This is the default (also the `src` folder is supported out of the box)
  './src/i18n.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Clerk + Server Actions when using a custom local host
  // (https://vidiopintar.local) instead of localhost.
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
      { source: '/blog/:path*', destination: '/mcp', permanent: true },
      { source: '/faq', destination: '/mcp', permanent: true },
      { source: '/changelogs', destination: '/mcp', permanent: true },
      { source: '/rss.xml', destination: '/mcp', permanent: true },
    ]
  },
  serverExternalPackages: ['better-sqlite3'],
  experimental: {
    optimizePackageImports: [
      '@phosphor-icons/react',
      'lucide-react',
      'motion/react',
      '@clerk/ui',
      'date-fns',
    ],
  },
}

module.exports = withNextIntl(nextConfig);
