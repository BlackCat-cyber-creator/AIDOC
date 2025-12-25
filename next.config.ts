import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  // output: 'export', // Enabled for static export if needed for Capacitor
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

// For a WebView mobile app, PWA service workers often cause "SyntaxError" and cache stalls.
// Disabling it ensures the WebView always gets the latest content from the server without local cache conflicts.
const configWithPWA = withPWA({
  dest: 'public',
  disable: true, // Set to true to fix WebView cache corruption and Workbox errors
})(nextConfig as any);

const configWithBundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(configWithPWA as any);

export default configWithBundleAnalyzer;
