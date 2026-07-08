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
    domains: ['i.ytimg.com','res.cloudinary.com', 'lh3.googleusercontent.com', 'media.licdn.com', 'scontent-sin2-1.cdninstagram.com'],
  },
  output: 'standalone',
  serverExternalPackages: ['better-sqlite3'],
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'motion/react',
      '@clerk/ui',
      'date-fns',
    ],
    webpackBuildWorker: true,
  },
  webpack: (config, { isServer, dev }) => {
    if (isServer) {
      config.externals.push('better-sqlite3');
    }
    // Avoid webpack filesystem cache warnings from large vendor chunks (e.g. @clerk/backend).
    // Docker builds are cold anyway, so memory cache is sufficient.
    if (!dev) {
      config.cache = { type: 'memory' };
    }
    return config;
  },
}

module.exports = withNextIntl(nextConfig);
