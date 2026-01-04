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
import { AuthLayout } from '@/components/auth/AuthLayout';
import { VerifyEmailState } from '@/components/auth/VerifyEmailState';
import { Loader2 } from 'lucide-react';
import { useLoading } from '@/components/LoadingProvider';
import { useTranslation } from 'react-i18next';

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

  // Helper function to map Firebase error codes to translated strings
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

  // If the user is already logged in and verified, send them to profiles automatically
  useEffect(() => {
    if (user && !loading) {
      if (user.emailVerified) {
        router.push('/profiles');
      } else {
        setGlobalLoading(false);
        setIsLoading(false);
      }
    }
    // If not loading and no user, make sure global loading is off
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
      <div className="flex min-h-[100dvh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If user is logged in but NOT verified, show verification screen
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

  if (user && user.emailVerified) return null; // Prevent flicker before redirect

  return (
    <AuthLayout activeTab={activeTab} setActiveTab={setActiveTab} error={error}>
      {activeTab === 'login' ? (
        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
      ) : (
        <SignUpForm onSubmit={handleSignup} isLoading={isLoading} />
      )}
    </AuthLayout>
  );
}
