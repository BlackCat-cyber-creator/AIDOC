'use client';

import { AppIcon3D } from '../3d/AppIcon3D';
import { useIsMobile } from '@/hooks/use-mobile';
import Iridescence from '../Iridescence';
import { UserCircle, LogOut, CreditCard, User, Crown, Languages, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
];

export function AppHeader() {
  const isMobile = useIsMobile();
  const [user] = useAuthState(auth);
  const router = useRouter();
  const { i18n, t } = useTranslation();
  const [isPremium, setIsPremium] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function checkSubscription() {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setIsPremium(userDoc.data().isPremium || false);
        }
      }
    }
    checkSubscription();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
  };

  const currentLanguageName = languages.find((l) => l.code === i18n.language)?.name || 'Language';

  if (!mounted) {
    return (
      <header className="py-0 mb-6 border-b border-border relative h-21 sm:h-25 md:h-29 lg:h-33 bg-muted/10"></header>
    );
  }

  return (
    <header className="py-0 mb-6 border-b border-border relative h-21 sm:h-25 md:h-29 lg:h-33">
      <div className="absolute inset-0 z-0">
        <Iridescence color={[1, 0.9, 0.9]} mouseReact={false} amplitude={0} speed={0.5} horizontalStretch={0.5} />
      </div>
      <div className="container mx-auto flex items-center justify-center gap-x-2 px-4 h-full relative z-10">
        <h1 className="leading-none">
          <img src="/ai.webp" alt="AI" className="h-20 sm:h-24 md:h-28 lg:h-36 w-auto" />
        </h1>
        <div className="flex justify-center items-center h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-40 lg:w-40">
          <AppIcon3D
            modelPath="/models/app_icon.glb"
            scale={isMobile ? 0.5 : 0.8}
            position={isMobile ? [0, -0.5, 0] : [0, -0.7, 0]}
            rotation={[-Math.PI / 16, Math.PI / 16, 0]}
          />
        </div>
        <h1 className="leading-none">
          <img src="/doc.webp" alt="DOC" className="h-28 sm:h-32 md:h-36 lg:h-44 w-auto" />
        </h1>
      </div>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 md:right-8 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full relative">
              <UserCircle className="h-6 w-6" />
              {isPremium && <Crown className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500 fill-yellow-500" />}
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.displayName || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => router.push('/billing')}
              className="cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>{t('subscription')}</span>
              </div>
              <Badge
                variant={isPremium ? 'default' : 'secondary'}
                className={isPremium ? 'bg-yellow-500 hover:bg-yellow-600 h-5 text-[10px]' : 'h-5 text-[10px]'}
              >
                {isPremium ? 'PRO' : 'FREE'}
              </Badge>
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                <Languages className="mr-2 h-4 w-4" />
                <span>{currentLanguageName}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-48">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      {lang.name}
                      {i18n.language === lang.code && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuItem onClick={() => router.push('/profiles')} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>{t('profiles_title')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
