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
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState('login');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If the user is already logged in, send them to profiles automatically
  useEffect(() => {
    if (user && !loading) {
      router.push('/profiles');
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent, email, password) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // router.push is handled by the useEffect above
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent, name, email, password) => {
    e.preventDefault();
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
      });

      await sendEmailVerification(user);
      // router.push is handled by the useEffect above
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return null; // Prevent flicker before redirect

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
