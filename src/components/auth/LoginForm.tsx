'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2, ArrowRight, Mail, Lock } from 'lucide-react';
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
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form className="my-8 space-y-5" onSubmit={handleSubmit}>
        <LabelInputContainer>
          <Label htmlFor="email" className="text-sm font-medium">
            {t('email')}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
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
              className="pl-9 h-11 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
            />
          </div>
        </LabelInputContainer>

        <LabelInputContainer>
          <div className="flex justify-between items-center mb-1">
            <Label htmlFor="password" className="text-sm font-medium">
              {t('password')}
            </Label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs text-primary hover:underline disabled:opacity-50 font-medium transition-colors"
              disabled={isLoading || isResetting}
            >
              {isResetting ? t('sending') : t('forgot_password')}
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="pl-9 h-11 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
            />
          </div>
        </LabelInputContainer>

        <Button
          className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('logging_in')}
            </>
          ) : (
            <>
              {t('login')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn('flex w-full flex-col space-y-1', className)}>{children}</div>;
};
