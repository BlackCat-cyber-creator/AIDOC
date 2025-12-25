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
import { VerifyEmailState } from '@/components/auth/VerifyEmailState'; // Import the new component
import { Loader2 } from 'lucide-react';
import { useLoading } from '@/components/LoadingProvider';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState('login');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { setIsLoading: setGlobalLoading } = useLoading();
  const { t } = useTranslation();

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
        // Pre-fetch/Start navigation
        router.push('/profiles');
      } else {
        // User needs verification, ensure loading is off so they see the UI
        setGlobalLoading(false);
        setIsLoading(false);
      }
    }

    // If we're done loading auth state and no user is found, ensure UI is visible
    if (!loading && !user) {
      setGlobalLoading(false);
      setIsLoading(false); // Ensure local loading is off too
    }
  }, [user, loading, router, setGlobalLoading]);

  const handleLogin = async (e: React.FormEvent, email, password) => {
    // e.preventDefault(); // Handled in the form component now via onSubmit(e,...) or just pass data
    // The form component passes the event, so we can prevent default there or here.
    // Ideally the form handles the event prevention.

    setError(null);
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        setError(t('verify_email_notice'));
        setIsLoading(false);
        setGlobalLoading(false);
      }
      // If verified, the useEffect will catch it and redirect
    } catch (err: any) {
      console.error(err);
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
        isPremium: false, // Default to free
      });

      await sendEmailVerification(user);
      // Don't set error here, just let the UI switch to verification state
      setIsLoading(false);
      setGlobalLoading(false);
    } catch (err: any) {
      console.error(err);
      setError(getErrorMessage(err.code));
      setIsLoading(false);
      setGlobalLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (user) {
      setIsResending(true);
      setError(null);
      try {
        await sendEmailVerification(user);
        // Show success message or toast? For now using error state to show info is a bit hacky but works
        // Better: toast notification. But let's stick to the current UI pattern for simplicity unless requested.
        // Actually, let's just clear error if it was "sent" before.
        alert(t('verification_email_sent'));
      } catch (err: any) {
        // If "too many requests", handle gracefully
        setError(getErrorMessage(err.code));
      } finally {
        setIsResending(false);
      }
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut(auth);
    setError(null);
    setIsLoading(false);
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-gray-50 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">{t('loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  // 2. Verification State
  if (user && !user.emailVerified) {
    return (
      <VerifyEmailState
        email={user.email || ''}
        onResend={handleResendVerification}
        onLogout={handleLogout}
        error={error}
        isResending={isResending}
      />
    );
  }

  // 3. Authenticated State (Redirecting)
  if (user && user.emailVerified) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-gray-50 dark:bg-neutral-950">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // 4. Auth Forms State
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
