'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';

interface VerifyEmailStateProps {
  email: string;
  onResend: () => void;
  onLogout: () => void;
  error?: string | null;
  isResending?: boolean;
}

export const VerifyEmailState = ({ email, onResend, onLogout, error, isResending }: VerifyEmailStateProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-gray-50 dark:bg-neutral-950">
      <div className="max-w-md w-full bg-white dark:bg-black p-8 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 text-center animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2 text-neutral-900 dark:text-neutral-100">{t('verify_email_title')}</h2>

        <p className="text-neutral-600 dark:text-neutral-300 mb-6 leading-relaxed">
          {t('verify_email_instructions_pre', { defaultValue: 'We sent a verification link to' })}{' '}
          <span className="font-semibold text-neutral-900 dark:text-white">{email}</span>.
          <br />
          {t('verify_email_instructions_post', {
            defaultValue: 'Please check your inbox and click the link to continue.',
          })}
        </p>

        <div className="space-y-3">
          <Button onClick={onResend} className="w-full h-12 text-base font-medium" disabled={isResending}>
            {isResending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {t('sending')}
              </>
            ) : (
              t('resend_verification')
            )}
          </Button>

          <Button
            onClick={onLogout}
            variant="ghost"
            className="w-full h-12 text-base text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('back_to_login')}
          </Button>
        </div>

        {error && (
          <div className="mt-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};
