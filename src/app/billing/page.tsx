'use client';

import React, { useState, useEffect } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Crown, Loader2, Play } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useLoading } from '@/components/LoadingProvider';

// Pastikan ID ini sama dengan yang ada di Google Play Console dan MainActivity.kt
const PREMIUM_PRODUCT_ID = 'premium_monthly';

export default function BillingPage() {
  const [user, loading] = useAuthState(auth);
  const { t } = useTranslation();
  const [isPremium, setIsPremium] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { setIsLoading } = useLoading();
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    setIsAndroid(typeof window !== 'undefined' && !!window.AndroidBilling);

    let unsubscribe = () => {};

    if (user) {
      const userRef = doc(db, 'users', user.uid);
      unsubscribe = onSnapshot(
        userRef,
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setIsPremium(data.isPremium || false);
            if (data.isPremium && isProcessing) {
              setIsProcessing(false);
            }
          }
          setIsLoading(false);
        },
        (error) => {
          console.error('Error listening to user data:', error);
          setIsLoading(false);
        }
      );
    } else if (!loading) {
      setIsLoading(false);
    }

    return () => unsubscribe();
  }, [user, loading, setIsLoading, isProcessing]);

  const handleUpgrade = async () => {
    if (!user) return;

    if (window.AndroidBilling) {
      setIsProcessing(true);
      try {
        // Coba metode baru dengan ID Produk dinamis
        if (window.AndroidBilling.launchPurchaseFlow) {
          window.AndroidBilling.launchPurchaseFlow(PREMIUM_PRODUCT_ID);
        } else {
          // Fallback ke metode lama jika app belum diupdate
          window.AndroidBilling.upgradeToPremium();
        }
      } catch (e) {
        console.error('Native call failed', e);
        setIsProcessing(false);
        alert(t('error_native_connect'));
      }
    } else {
      alert(t('error_android_only'));
    }
  };

  const plans = [
    {
      name: t('free_plan'),
      price: '$0',
      description: t('free_desc'),
      features: [
        t('free_feature_1'),
        t('free_feature_2'),
        t('free_feature_3'),
        t('free_feature_4'),
        t('free_feature_5'),
      ],
      current: !isPremium,
      buttonText: t('current_plan'),
      premium: false,
    },
    {
      name: t('premium_plan'),
      price: '$4.99',
      period: `/${t('month')}`,
      description: t('premium_desc'),
      features: [
        t('premium_feature_1'),
        t('premium_feature_2'),
        t('premium_feature_3'),
        t('premium_feature_4'),
        t('premium_feature_5'),
        t('premium_feature_6'),
      ],
      current: isPremium,
      buttonText: isPremium ? t('current_plan') : t('upgrade_to_premium'),
      premium: true,
    },
  ];

  if (loading) return null;

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <AppHeader />
      <main className="container mx-auto flex-grow px-4 pb-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">{t('choose_plan')}</h1>
          <p className="text-xl text-muted-foreground">{t('plan_description')}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                'relative flex flex-col transition-all duration-300',
                plan.premium ? 'border-primary shadow-xl scale-105 z-10' : 'border-muted shadow-sm',
                plan.current && 'ring-2 ring-primary ring-offset-2'
              )}
            >
              {plan.premium && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <Crown className="h-3 w-3" /> {t('recommended')}
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground text-lg">{plan.period}</span>}
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="rounded-full bg-green-100 p-1 mt-0.5">
                        <Check className="h-3 w-3 text-green-700" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full h-12 text-lg font-bold"
                  variant={plan.premium ? 'default' : 'outline'}
                  disabled={plan.current || (plan.premium && isProcessing)}
                  onClick={plan.premium ? handleUpgrade : undefined}
                >
                  {isProcessing && plan.premium ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {plan.premium && !isProcessing && <Play className="mr-2 h-4 w-4 fill-current" />}
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        {!isAndroid && (
          <div className="mt-8 text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-800 max-w-2xl mx-auto">
            <p className="font-semibold">{t('mobile_app_only')}</p>
            <p className="text-sm mt-1">{t('download_app_hint')}</p>
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  );
}
