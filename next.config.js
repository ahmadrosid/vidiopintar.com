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
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'yt3.ggpht.com' },
      { protocol: 'https', hostname: 'yt3.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'media.licdn.com' },
      { protocol: 'https', hostname: 'scontent-sin2-1.cdninstagram.com' },
    ],
  },
  output: 'standalone',
  serverExternalPackages: ['better-sqlite3'],
  experimental: {
    optimizePackageImports: [
      '@phosphor-icons/react',
      'lucide-react',
      'recharts',
      'motion/react',
      '@clerk/ui',
      'date-fns',
    ],
    webpackBuildWorker: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('better-sqlite3');
    }
    // Keep default filesystem cache so Docker BuildKit can reuse /.next/cache.
    return config;
  },
}

module.exports = withNextIntl(nextConfig);
