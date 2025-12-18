'use client';

import React, { useState, useEffect } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Crown, Zap, Shield, UserPlus, Image as ImageIcon, Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useLoading } from '@/components/LoadingProvider'; // Import useLoading

declare global {
  interface Window {
    snap: any;
  }
}

export default function BillingPage() {
  const [user, loading] = useAuthState(auth);
  const { t } = useTranslation();
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { setIsLoading } = useLoading(); // Get setIsLoading from context

  useEffect(() => {
    async function checkSubscription() {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setIsPremium(userDoc.data().isPremium || false);
        }
      }
      setIsLoading(false); // Turn off global loader after checking subscription
    }
    checkSubscription();
  }, [user, setIsLoading]);

  const handleUpgrade = async () => {
    if (!user) return;
    setIsProcessing(true);
    setIsLoading(true); // Turn on global loader when starting upgrade

    try {
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          planName: 'AIDOC Premium',
          amount: 155000, // Roughly $9.99 USD
          email: user.email,
          name: user.displayName,
        }),
      });

      const data = await response.json();

      if (data.token) {
        window.snap.pay(data.token, {
          onSuccess: async (result: any) => {
            await updateDoc(doc(db, 'users', user.uid), { isPremium: true });
            setIsPremium(true);
            setIsLoading(false); // Turn off global loader on success
            router.push('/profiles');
          },
          onPending: (result: any) => {
            alert('Payment is pending. Please complete your payment.');
            setIsLoading(false); // Turn off global loader on pending
          },
          onError: (result: any) => {
            alert('Payment failed. Please try again.');
            setIsLoading(false); // Turn off global loader on error
          },
          onClose: () => {
            setIsProcessing(false);
            setIsLoading(false); // Turn off global loader on close (if payment never completed)
          },
        });
      } else {
        setIsLoading(false); // Turn off global loader if no token is received
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong. Please try again.');
      setIsProcessing(false);
      setIsLoading(false); // Turn off global loader on API call error
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Basic medical assistance',
      features: [
        'Up to 2 patient profiles',
        '6 diagnoses per day',
        '3 results per diagnosis',
        'Basic AI analysis',
        'Symptom location map',
      ],
      current: !isPremium,
      buttonText: 'Current Plan',
      premium: false,
    },
    {
      name: 'Premium',
      price: '$9.99', // Updated to USD look
      period: '/month',
      description: 'The complete healthcare assistant',
      features: [
        'Up to 10 patient profiles',
        '50 diagnoses per day',
        '5 results per diagnosis',
        'Confidence match meter',
        'Symptom photo analysis',
        'Priority AI processing',
      ],
      current: isPremium,
      buttonText: isPremium ? 'Current Plan' : 'Upgrade to Premium',
      premium: true,
    },
  ];

  if (loading) return null;

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
      />

      <AppHeader />
      <main className="container mx-auto flex-grow px-4 pb-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground">
            Get more accurate results and manage your whole family with Premium.
          </p>
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
                  <Crown className="h-3 w-3" /> Recommended
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
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
