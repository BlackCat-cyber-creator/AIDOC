'use client';

import { usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/layout/sidebar/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useEffect, useState } from 'react';

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, loading] = useAuthState(auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <main className="flex-1 w-full h-full">{children}</main>;
  }

  // Don't show sidebar on login page or if checking auth
  if (pathname === '/' || loading || !user) {
    return <main className="flex-1 w-full h-full">{children}</main>;
  }

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:hidden">
          <SidebarTrigger className="-ml-1" />
          <span className="font-semibold">AIDOC</span>
        </header>
        {/* Changed from overflow-x-hidden to overflow-hidden on the flex container to prevent cutoff */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full min-w-0">{children}</div>
      </SidebarInset>
    </>
  );
}
