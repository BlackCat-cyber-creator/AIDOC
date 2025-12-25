'use client';

import React, { useState, useEffect } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Crown, Loader2, Play } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useLoading } from '@/components/LoadingProvider';

export default function BillingPage() {
  const [user, loading] = useAuthState(auth);
  const { t } = useTranslation();
  const [isPremium, setIsPremium] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { setIsLoading } = useLoading();

  useEffect(() => {
    async function checkSubscription() {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setIsPremium(userDoc.data().isPremium || false);
        }
      }
      setIsLoading(false);
    }
    checkSubscription();
  }, [user, setIsLoading]);

  // Setup Global Callbacks for Android Studio to call
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).onPurchaseSuccess = async (purchaseToken: string) => {
        if (user) {
          try {
            await updateDoc(doc(db, 'users', user.uid), {
              isPremium: true,
              premiumSince: new Date().toISOString(),
              purchaseToken: purchaseToken,
            });
            setIsPremium(true);
            alert(t('success_premium'));
          } catch (e) {
            console.error('Error updating premium status', e);
          } finally {
            setIsProcessing(false);
          }
        }
      };

      (window as any).onPurchaseError = (error: string) => {
        setIsProcessing(false);
        alert(t('error_purchase_failed') + ': ' + error);
      };
    }

    return () => {
      delete (window as any).onPurchaseSuccess;
      delete (window as any).onPurchaseError;
    };
  }, [user, t]);

  const handleUpgrade = async () => {
    if (!user) return;

    // Check if we are inside the Android App (via Javascript Interface)
    if (typeof window !== 'undefined' && (window as any).AndroidBilling) {
      setIsProcessing(true);
      try {
        // This calls the @JavascriptInterface in MainActivity.kt
        (window as any).AndroidBilling.upgradeToPremium();
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
                  disabled={plan.current || isProcessing}
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
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>{t('payment_notice')}</p>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
