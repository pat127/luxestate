import { imageHosts } from './image-hosts.config.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  productionBrowserSourceMaps: false,
  distDir: process.env.DIST_DIR || '.next',

  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
    // Tree-shake large packages so only used exports are bundled — reduces unused JS chunks
    optimizePackageImports: [
      'recharts',
      '@heroicons/react',
      'lucide-react',
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // Force /favicon.ico to always resolve to the Cove Estates logo route.
  // beforeFiles runs ahead of the static public/favicon.ico (old house icon),
  // so browsers' automatic first-load /favicon.ico request gets the correct icon.
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/favicon.ico', destination: '/api/favicon' },
      ],
      afterFiles: [],
      fallback: [],
    };
  },

  async headers() {
    return [
      {
        source: '/api/favicon',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
    ];
  },

  images: {
    remotePatterns: imageHosts,
    minimumCacheTTL: 2592000,
    // avif first: ~50% smaller than webp on mobile, significantly reducing LCP image transfer time
    // Modern mobile browsers (Chrome 85+, Safari 16+) support avif
    formats: ['image/avif', 'image/webp'],
    // Mobile-first device sizes: prioritise smaller breakpoints for faster LCP on mobile
    deviceSizes: [480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: false,
  },

  webpack(
    config,
    {
      dev: dev
    }
  ) {
    if (dev) {
      config.module.rules.push({
        test: /\.(jsx|tsx)$/,
        exclude: [/node_modules/],
        use: [{
          loader: '@dhiwise/component-tagger/nextLoader',
        }],
      });
    }

    return config;
  }
};
export default nextConfig;