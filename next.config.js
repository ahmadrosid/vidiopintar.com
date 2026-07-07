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
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('better-sqlite3');
    }
    return config;
  },
}

module.exports = withNextIntl(nextConfig);
