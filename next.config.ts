import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  // output: 'export', // Enabled for static export if needed for Capacitor
  reactStrictMode: true,
  poweredByHeader: false, // Security & slight performance boost
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false, // Clean up console logs in prod
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      // Allow Firebase Storage images
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
    // unoptimized: true, // Keep unoptimized true for static exports/Capacitor, but for Vercel/Web hosting, false is better.
    // If you are serving this via Vercel for the WebView, set to FALSE to get automatic optimization.
    // If you are bundling the whole app inside the APK (static export), keep TRUE.
    // Assuming standard web hosting for WebView:
    unoptimized: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

// PWA Config
const configWithPWA = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // Disable in dev, enable in prod
  register: true,
  skipWaiting: true, // Updates PWA immediately
})(nextConfig as any);

const configWithBundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(configWithPWA as any);

export default configWithBundleAnalyzer;
