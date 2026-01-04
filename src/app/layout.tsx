import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { Inter } from 'next/font/google';
import { I18nProvider } from '@/components/I18nProvider';
import { LoadingProvider } from '@/components/LoadingProvider';
import { BillingListener } from '@/components/BillingListener';
import { UserProvider } from '@/components/UserProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'AIDOC',
  description: 'AI-powered medical diagnostic assistant - AIDOC',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AIDOC',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#5DADE2',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="192x192" href="/apple-touch-icon.webp" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" forceTheme="light" disableTransitionOnChange>
          <I18nProvider>
            <LoadingProvider>
              <UserProvider>
                <BillingListener />
                {children}
              </UserProvider>
            </LoadingProvider>
            <Toaster />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
