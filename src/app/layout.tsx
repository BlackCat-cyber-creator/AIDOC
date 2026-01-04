import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { Inter } from 'next/font/google';
import { I18nProvider } from '@/components/I18nProvider';
import { LoadingProvider } from '@/components/LoadingProvider';
import { BillingListener } from '@/components/BillingListener';
import { UserProvider } from '@/components/UserProvider';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar/AppSidebar';

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
                {/* Wrapping the entire app in SidebarProvider */}
                <SidebarProvider defaultOpen={false}>
                  {/* We only render the sidebar if we are not on the login page (handled conditionally or inside layouts, but for now we put it here and can control visibility via CSS or logic if needed) */}
                  {/* Actually, the cleaner way is to use a layout wrapper for authenticated routes, but let's put it here for now and hide it via CSS on login page if needed, OR we accept it shows on login? No, it shouldn't. */}
                  {/* Ideally, we should check auth status here, but RootLayout is server-side. Let's rely on inner components to handle visibility or just wrap the authenticated pages. */}
                  {/* For this "Masterpiece" refactor, let's assume we want the sidebar available on the main app dashboard. */}

                  {/* To properly hide sidebar on login, we might need a client wrapper. But let's stick to the request: "sidebar, everything". */}
                  <div className="flex w-full h-full">
                    {/* We can conditionally render this in a client component, but for now let's integrate it. */}
                    {/* Note: In a real app, I'd separate (public) and (authenticated) layouts. */}
                    {/* For now, I'll add the AppSidebar but maybe we need a client wrapper to check pathname? */}
                    {/* Let's wrap children in a ClientSidebarWrapper for safety. */}
                    <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
                  </div>
                </SidebarProvider>
              </UserProvider>
            </LoadingProvider>
            <Toaster />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

// Simple client wrapper to handle sidebar visibility
import { ClientLayoutWrapper } from '@/components/layout/ClientLayoutWrapper';
