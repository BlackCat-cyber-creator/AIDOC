'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Crown, Loader2, Smartphone } from 'lucide-react';
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
      } else if (window.AndroidBilling?.upgradeToPremium) {
        window.AndroidBilling.upgradeToPremium();
      } else {
        throw new Error('Android interface not found');
      }
    } catch (e) {
      console.error('Native billing call failed', e);
      setIsProcessing(false);
      alert(t('error_native_connect', 'Could not connect to Google Play. Please try again.'));
    }

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
      <main className="flex-grow flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden p-4 sm:p-8">
      <main className="container mx-auto flex-grow pb-12">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 px-4 py-1 text-sm border-primary/30 bg-primary/5 text-primary">
            {settings.isPremium
              ? t('active_subscription', 'Active Subscription')
              : t('upgrade_available', 'Upgrade Available')}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{t('choose_plan')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t('plan_description')}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto items-stretch">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                'relative flex flex-col transition-all border-2',
                plan.isPremium ? 'border-primary shadow-xl bg-card' : 'border-border bg-card/50',
                plan.isCurrent && 'ring-2 ring-primary ring-offset-2'
              )}
            >
              {plan.isPremium && !plan.isCurrent && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-primary text-white border-none shadow-sm">
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
                      <li key={feature} className="flex items-start gap-3">
                        <div
                          className={cn(
                            'rounded-full p-1 mt-0.5',
                            plan.isPremium ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                          )}
                        >
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="text-sm font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="pt-6">
                <Button
                  className={cn(
                    'w-full h-14 text-lg font-bold rounded-full shadow-lg transition-all',
                    plan.isPremium ? 'bg-primary text-white hover:bg-primary/90' : 'hover:bg-muted'
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
                    <>{plan.buttonText}</>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {!isAndroid && (
          <div className="mt-12 text-center max-w-md mx-auto">
            <div className="p-6 bg-muted/50 rounded-2xl border border-border text-foreground shadow-sm">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-1">{t('mobile_app_only')}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t('download_app_hint')}</p>
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
    </div>
  );
}
