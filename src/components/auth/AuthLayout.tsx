'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  error: string | null;
}

export const AuthLayout = ({ children, activeTab, setActiveTab, error }: AuthLayoutProps) => {
  const { t, i18n } = useTranslation();

  const getPrivacyLinkText = () => {
    if (i18n.language === 'id') return 'Kebijakan Privasi';
    if (i18n.language === 'es') return 'Política de Privacidad';
    if (i18n.language === 'fr') return 'Politique de confidentialité';
    return 'Privacy Policy';
  };

  const privacyLinkText = getPrivacyLinkText();
  const notice = t('terms_privacy_notice');
  const parts = notice.split(privacyLinkText);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-gray-50 dark:bg-neutral-950 relative">
      <LanguageSwitcher className="absolute top-4 right-4" />

      <div className="shadow-input mx-auto w-full max-w-md rounded-2xl bg-white p-6 md:p-8 dark:bg-black border border-neutral-200 dark:border-neutral-800">
        <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">{t('welcome_to')} AIDOC</h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
          {activeTab === 'login' ? t('login_description') : t('signup_description')}
        </p>

        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-neutral-100 dark:bg-neutral-900">
              <TabsTrigger value="login" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800">
                {t('login')}
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800">
                {t('signup')}
              </TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>{t('error')}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {children}
          </Tabs>
        </div>

        <div className="my-6 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

        <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
          {parts[0]}
          <Link href="/privacy" className="underline hover:text-neutral-700 dark:hover:text-neutral-200">
            {privacyLinkText}
          </Link>
          {parts[1]}
        </p>
      </div>
    </div>
  );
};
