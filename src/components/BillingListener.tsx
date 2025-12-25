'use client';

import { useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export function BillingListener() {
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    // We only attach listeners if we are in a browser environment (which includes WebView)
    if (typeof window === 'undefined') return;

    // Define the success callback globally
    window.onPurchaseSuccess = async (purchaseToken: string) => {
      console.log('Purchase success callback triggered with token:', purchaseToken);

      if (!user) {
        console.error('User not logged in during purchase success.');
        // Optionally save token to localStorage to retry after login
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          isPremium: true,
          premiumSince: new Date().toISOString(),
          purchaseToken: purchaseToken,
        });

        toast({
          title: t('success') || 'Success',
          description: t('success_premium') || 'Premium subscription activated successfully!',
          variant: 'default',
        });
      } catch (error: any) {
        console.error('Error updating premium status:', error);
        toast({
          title: t('error') || 'Error',
          description: 'Failed to update account status. Please contact support.',
          variant: 'destructive',
        });
      }
    };

    // Define the error callback globally
    window.onPurchaseError = (error: string) => {
      console.error('Purchase error callback triggered:', error);
      toast({
        title: t('error_purchase_failed') || 'Purchase Failed',
        description: error,
        variant: 'destructive',
      });
    };

    // Cleanup not strictly necessary for single-page apps on navigation,
    // but good practice if the component unmounts (which it won't in Layout).
    return () => {
      // We might choose NOT to delete them to ensure they stay active
      // delete window.onPurchaseSuccess;
      // delete window.onPurchaseError;
    };
  }, [user, toast, t]);

  return null; // This component renders nothing
}
