'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SignUpFormProps {
  onSubmit: (e: React.FormEvent, name: string, email: string, password: string) => void;
  isLoading: boolean;
}

export const SignUpForm = ({ onSubmit, isLoading }: SignUpFormProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${firstName} ${lastName}`.trim();
    onSubmit(e, fullName, email, password);
  };

  return (
    <div className="w-full">
      <form className="my-8 space-y-4" onSubmit={handleSubmit}>
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-2">
          <LabelInputContainer>
            <Label htmlFor="firstname">{t('first_name')}</Label>
            <Input
              id="firstname"
              placeholder="John"
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={isLoading}
            />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="lastname">{t('last_name')}</Label>
            <Input
              id="lastname"
              placeholder="Doe"
              type="text"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={isLoading}
            />
          </LabelInputContainer>
        </div>
        <LabelInputContainer>
          <Label htmlFor="signup-email">{t('email')}</Label>
          <Input
            id="signup-email"
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
        <LabelInputContainer>
          <Label htmlFor="signup-password">{t('password')}</Label>
          <Input
            id="signup-password"
            placeholder="••••••••"
            type="password"
            autoComplete="new-password"
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
              {t('signing_up')}
            </>
          ) : (
            <>{t('signup')} &rarr;</>
          )}
        </Button>
      </form>
    </div>
  );
};

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn('flex w-full flex-col space-y-2', className)}>{children}</div>;
};
