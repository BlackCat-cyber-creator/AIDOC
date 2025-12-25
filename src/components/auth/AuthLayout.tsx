'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  error: string | null;
}

export const AuthLayout = ({ children, activeTab, setActiveTab, error }: AuthLayoutProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center p-4 bg-gray-50 dark:bg-neutral-950 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-3xl opacity-50 pointer-events-none" />

      <LanguageSwitcher className="absolute top-6 right-6 z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-0"
      >
        <div className="bg-white/80 dark:bg-black/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 p-6 md:p-8 overflow-hidden">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 tracking-tight">
              {t('welcome_to')} <span className="text-primary">AIDOC</span>
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 max-w-xs mx-auto">
              {activeTab === 'login' ? t('login_description') : t('signup_description')}
            </p>
          </div>

          <div className="mt-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-neutral-100/50 dark:bg-neutral-900/50 p-1 rounded-xl">
                <TabsTrigger
                  value="login"
                  className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-sm transition-all duration-300"
                >
                  {t('login')}
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-sm transition-all duration-300"
                >
                  {t('signup')}
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <Alert
                      variant="destructive"
                      className="mt-4 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                    >
                      <Terminal className="h-4 w-4" />
                      <AlertTitle>{t('error')}</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {children}
            </Tabs>
          </div>

          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-neutral-200 dark:border-neutral-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-black px-2 text-neutral-500">
                {t('secure_access') || 'Secure Access'}
              </span>
            </div>
          </div>

          <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">{t('terms_privacy_notice')}</p>
        </div>
      </motion.div>
    </div>
  );
};
