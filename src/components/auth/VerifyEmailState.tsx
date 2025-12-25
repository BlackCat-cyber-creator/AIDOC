'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface VerifyEmailStateProps {
  email: string;
  onResend: () => void;
  onLogout: () => void;
  error?: string | null;
}

export const VerifyEmailState = ({ email, onResend, onLogout, error }: VerifyEmailStateProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-black p-8 rounded-2xl shadow-input border border-neutral-200 dark:border-neutral-800 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('verify_email_title')}</h2>
        <p className="text-neutral-600 dark:text-neutral-300 mb-6">
          {t('verify_email_instructions', { email: email })}
        </p>
        <div className="space-y-4">
          <Button onClick={onResend} className="w-full">
            {t('resend_verification')}
          </Button>
          <Button onClick={onLogout} variant="outline" className="w-full">
            {t('back_to_login')}
          </Button>
        </div>
        {error && <p className="mt-4 text-sm text-blue-600 font-medium">{error}</p>}
      </div>
    </div>
  );
};
