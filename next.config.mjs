import { imageHosts } from './image-hosts.config.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  distDir: process.env.DIST_DIR || '.next',

  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: imageHosts,
    minimumCacheTTL: 2592000,
    // webp first for broader compatibility; avif can add decode latency on low-end mobile
    formats: ['image/webp', 'image/avif'],
    // Mobile-first device sizes: prioritise smaller breakpoints for faster LCP on mobile
    deviceSizes: [480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  webpack(config) {
config.module.rules.push({
      test: /\.(jsx|tsx)$/,
      exclude: [/node_modules/],
      use: [{ loader: '@dhiwise/component-tagger/nextLoader' }],
    });

    return config;
  }
};
export default nextConfig;