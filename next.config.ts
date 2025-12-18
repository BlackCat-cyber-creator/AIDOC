import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

// We use 'any' to bypass the version mismatch between Next.js core types and the next-pwa plugin types.
const configWithPWA = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})(nextConfig as any);

const configWithBundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(configWithPWA as any);

export default configWithBundleAnalyzer;
