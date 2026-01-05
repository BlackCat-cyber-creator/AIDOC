'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { VerifyEmailState } from '@/components/auth/VerifyEmailState';
import { Loader2, Sparkles, Activity } from 'lucide-react';
import { useLoading } from '@/components/LoadingProvider';
import { useTranslation } from 'react-i18next';
import Iridescence from '@/components/Iridescence';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState('login');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setIsLoading: setGlobalLoading } = useLoading();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/invalid-credential':
        return t('error_invalid_credential');
      case 'auth/user-not-found':
        return t('error_user_not_found');
      case 'auth/wrong-password':
        return t('error_wrong_password');
      case 'auth/email-already-in-use':
        return t('error_email_already_in_use');
      case 'auth/weak-password':
        return t('error_weak_password');
      case 'auth/invalid-email':
        return t('error_invalid_email');
      case 'auth/too-many-requests':
        return t('error_too_many_requests');
      default:
        return t('error_default');
    }
  };

  useEffect(() => {
    if (user && !loading) {
      if (user.emailVerified) {
        router.push('/profiles');
      } else {
        setGlobalLoading(false);
        setIsLoading(false);
      }
    }
    if (!loading && !user) {
      setGlobalLoading(false);
    }
  }, [user, loading, router, setGlobalLoading]);

  const handleLogin = async (e: React.FormEvent, email, password) => {
    setError(null);
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        setError(t('verify_email_notice'));
        setIsLoading(false);
        setGlobalLoading(false);
      }
    } catch (err: any) {
      setError(getErrorMessage(err.code));
      setIsLoading(false);
      setGlobalLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent, name, email, password) => {
    setError(null);
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        displayName: name,
        email: email,
        createdAt: new Date(),
        isPremium: false,
      });

      await sendEmailVerification(user);
      setError(t('verification_email_sent'));
      setIsLoading(false);
      setGlobalLoading(false);
    } catch (err: any) {
      setError(getErrorMessage(err.code));
      setIsLoading(false);
      setGlobalLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (user) {
      try {
        await sendEmailVerification(user);
        setError(t('verification_email_sent'));
      } catch (err: any) {
        setError(getErrorMessage(err.code));
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setError(null);
  };

  if (!mounted || loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (user && !user.emailVerified) {
    return (
      <VerifyEmailState
        email={user.email || ''}
        onResend={handleResendVerification}
        onLogout={handleLogout}
        error={error}
      />
    );
  }

  if (user && user.emailVerified) return null;

  return (
    <div className="min-h-screen w-full flex relative bg-background">
      {/* Fixed Background - ensures it never cuts off */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <Iridescence color={[0.8, 0.9, 1]} mouseReact={true} amplitude={0.1} speed={0.3} />
      </div>

      {/* Left Side - Hero / Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative z-10 flex-col justify-center items-center p-12 text-center h-screen sticky top-0">
        <div className="relative w-48 h-48 mb-8">
          <img src="/icon-512x512.png" alt="AIDOC" className="w-full h-full object-contain drop-shadow-2xl" />
        </div>
        <h1 className="text-6xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          AIDOC
        </h1>
        <p className="text-xl text-muted-foreground max-w-md leading-relaxed">
          Your intelligent medical companion. <br />
          <span className="font-semibold text-foreground">Diagnosis. History. Care.</span>
        </p>
      </div>

      {/* Right Side - Form (Scrollable container) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative z-10 min-h-screen">
        <Card className="w-full max-w-md shadow-2xl border-white/20 bg-white/80 backdrop-blur-xl dark:bg-black/40 my-auto">
          <CardHeader className="text-center pb-2">
            <div className="lg:hidden w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">{t('welcome_back', 'Welcome Back')}</CardTitle>
            <CardDescription>{t('login_subtitle', 'Enter your details to access your account')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 h-12 rounded-xl bg-muted/50 p-1">
                <TabsTrigger
                  value="login"
                  className="rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  {t('login')}
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  {t('signup')}
                </TabsTrigger>
              </TabsList>

              <div className="">
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> {error}
                  </div>
                )}

                <TabsContent value="login" className="mt-0 space-y-4">
                  <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
                </TabsContent>

                <TabsContent value="signup" className="mt-0 space-y-4">
                  <SignUpForm onSubmit={handleSignup} isLoading={isLoading} />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
