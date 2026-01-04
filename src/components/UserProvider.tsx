'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface UserSettings {
  isPremium: boolean;
  diagnosisCount: number;
  lastDiagnosisDate: string | null;
  displayName?: string;
}

interface UserContextType {
  settings: UserSettings;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, authLoading] = useAuthState(auth);
  const [settings, setSettings] = useState<UserSettings>({
    isPremium: false,
    diagnosisCount: 0,
    lastDiagnosisDate: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setSettings({ isPremium: false, diagnosisCount: 0, lastDiagnosisDate: null });
      setLoading(false);
      return;
    }

    // Use onSnapshot for real-time updates and to avoid multiple getDoc calls
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setSettings({
            isPremium: data.isPremium || false,
            diagnosisCount: data.diagnosisCount || 0,
            lastDiagnosisDate: data.lastDiagnosisDate || null,
            displayName: data.displayName,
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to user settings:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading]);

  return <UserContext.Provider value={{ settings, loading }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
