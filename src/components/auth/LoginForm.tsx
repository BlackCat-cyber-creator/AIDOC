'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface LoginFormProps {
  onSubmit: (e: React.FormEvent, email: string, password: string) => void;
  isLoading: boolean;
}

export const LoginForm = ({ onSubmit, isLoading }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e, email, password);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: t('error'),
        description: t('enter_email_first'),
        variant: 'destructive',
      });
      return;
    }

    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: t('success'),
        description: t('password_reset_sent'),
      });
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="w-full">
      <form className="my-8 space-y-4" onSubmit={handleSubmit}>
        <LabelInputContainer>
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            placeholder="example@gmail.com"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </LabelInputContainer>
        <LabelInputContainer className="relative">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">{t('password')}</Label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs text-blue-600 hover:underline disabled:opacity-50"
              disabled={isLoading || isResetting}
            >
              {isResetting ? t('sending') : t('forgot_password')}
            </button>
          </div>
          <Input
            id="password"
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </LabelInputContainer>

        <Button className="w-full h-10" type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('logging_in')}
            </>
          ) : (
            <>{t('login')} &rarr;</>
          )}
        </Button>
      </form>
    </div>
  );
};

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn('flex w-full flex-col space-y-2', className)}>{children}</div>;
};
