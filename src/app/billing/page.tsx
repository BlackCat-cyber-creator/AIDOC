'use client';

import React, { useState, useEffect } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Crown, Loader2, Play, AlertCircle, Smartphone } from 'lucide-react';
import { useUser } from '@/components/UserProvider';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';

// Ensure this ID matches your Google Play Console
const PREMIUM_PRODUCT_ID = 'premium_monthly';

export default function BillingPage() {
  const { settings, loading: userLoading } = useUser();
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if we are running inside the Android WebView
    setIsAndroid(typeof window !== 'undefined' && !!window.AndroidBilling);
  }, []);

  const handleUpgrade = async () => {
    if (!isAndroid) {
      alert(t('error_android_only', 'This feature is only available in the Android app.'));
      return;
    }

    setIsProcessing(true);

    try {
      if (window.AndroidBilling?.launchPurchaseFlow) {
        window.AndroidBilling.launchPurchaseFlow(PREMIUM_PRODUCT_ID);
        // Note: The actual success callback comes from the BillingListener component
        // which listens to window events dispatched by the Android app.
      } else if (window.AndroidBilling?.upgradeToPremium) {
        // Fallback for older app versions
        window.AndroidBilling.upgradeToPremium();
      } else {
        throw new Error('Android interface not found');
      }
    } catch (e) {
      console.error('Native billing call failed', e);
      setIsProcessing(false);
      alert(t('error_native_connect', 'Could not connect to Google Play. Please try again.'));
    }

    // Auto-reset processing state after 30 seconds if no response (timeout safety)
    setTimeout(() => setIsProcessing(false), 30000);
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
      isCurrent: !settings.isPremium,
      buttonText: settings.isPremium ? t('downgrade', 'Downgrade') : t('current_plan'),
      isPremium: false,
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
      isCurrent: settings.isPremium,
      buttonText: settings.isPremium ? t('current_plan') : t('upgrade_to_premium'),
      isPremium: true,
    },
  ];

  if (userLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <AppHeader />
      <main className="container mx-auto flex-grow px-4 pb-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <Badge variant="outline" className="mb-4 px-4 py-1 text-sm border-primary/30 bg-primary/5 text-primary">
            {settings.isPremium
              ? t('active_subscription', 'Active Subscription')
              : t('upgrade_available', 'Upgrade Available')}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            {t('choose_plan')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t('plan_description')}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto items-start">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={cn(
                'relative flex flex-col transition-all duration-300 overflow-hidden',
                'animate-in slide-in-from-bottom-8 fade-in',
                index === 1 && 'delay-100', // Stagger animation
                plan.isPremium
                  ? 'border-primary shadow-2xl scale-105 z-10 bg-gradient-to-b from-card to-primary/5'
                  : 'border-muted shadow-sm hover:shadow-md bg-card/50',
                plan.isCurrent && 'ring-2 ring-primary ring-offset-2'
              )}
            >
              {plan.isPremium && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-blue-400 to-primary" />
              )}

              {plan.isPremium && !plan.isCurrent && (
                <div className="absolute top-4 right-4 animate-pulse">
                  <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 border-none text-white shadow-sm">
                    <Crown className="h-3 w-3 mr-1" /> {t('recommended')}
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  {plan.name}
                  {plan.isCurrent && (
                    <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {t('current', 'Current')}
                    </span>
                  )}
                </CardTitle>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black tracking-tight">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground text-lg">{plan.period}</span>}
                </div>
                <CardDescription className="mt-2 text-base">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-grow">
                <div className="space-y-4">
                  <div className="h-px w-full bg-border/50" />
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 group">
                        <div
                          className={cn(
                            'rounded-full p-1 mt-0.5 transition-colors',
                            plan.isPremium
                              ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="text-sm font-medium opacity-90">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="pt-6">
                <Button
                  className={cn(
                    'w-full h-14 text-lg font-bold rounded-xl shadow-lg transition-all duration-300',
                    plan.isPremium
                      ? 'bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary hover:scale-[1.02]'
                      : 'hover:bg-muted'
                  )}
                  variant={plan.isPremium ? 'default' : 'outline'}
                  disabled={plan.isCurrent || (plan.isPremium && isProcessing)}
                  onClick={plan.isPremium ? handleUpgrade : undefined}
                >
                  {isProcessing && plan.isPremium ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t('processing', 'Processing...')}
                    </>
                  ) : (
                    <>
                      {plan.isPremium && !plan.isCurrent && <Crown className="mr-2 h-5 w-5 fill-current" />}
                      {plan.buttonText}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {!isAndroid && (
          <div className="mt-12 text-center max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 text-amber-900 shadow-sm">
              <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Smartphone className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-bold text-lg mb-1">{t('mobile_app_only')}</h3>
              <p className="text-sm opacity-80 leading-relaxed">{t('download_app_hint')}</p>
            </div>
          </div>
        )}

        <div className="mt-12 text-center text-xs text-muted-foreground max-w-2xl mx-auto space-y-2">
          <p>
            {t(
              'billing_terms',
              'Subscriptions automatically renew unless auto-renew is turned off at least 24-hours before the end of the current period.'
            )}
          </p>
          <p>{t('restore_hint', 'If you already purchased Premium, tap "Upgrade" to restore your purchase.')}</p>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
