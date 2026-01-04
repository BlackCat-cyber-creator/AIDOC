'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDiagnosisForm } from '@/hooks/use-diagnosis-form';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { Skeleton } from '@/components/ui/skeleton';
import { PatientProfile } from '@/lib/schema';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useLoading } from '@/components/LoadingProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

const DiagnosisForm = dynamic(() => import('@/components/forms/DiagnosisForm').then((mod) => mod.DiagnosisForm), {
  ssr: false,
  loading: () => (
    <div className="space-y-6 p-4 animate-fade-in max-w-2xl mx-auto">
      <div className="mb-6 rounded-md border bg-muted/30 p-3 text-center">
        <Skeleton className="mx-auto mb-2 h-5 w-1/2" />
        <Skeleton className="h-2 w-full rounded-full bg-primary/20" />
      </div>
      <Skeleton className="h-[400px] w-full rounded-lg" />
      <div className="flex justify-between mt-8">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  ),
});

const DiagnosisResult = dynamic(
  () => import('@/components/diagnosis/DiagnosisResult').then((mod) => mod.DiagnosisResult),
  {
    ssr: false,
    loading: () => (
      <div className="mt-8 p-4 max-w-2xl mx-auto">
        <Skeleton className="mb-6 h-8 w-1/3" />
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    ),
  }
);

function ClientPageContent() {
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();
  const { t } = useTranslation();
  const { setIsLoading } = useLoading();

  useEffect(() => {
    try {
      const profileData = sessionStorage.getItem('selectedPatientProfile');
      if (profileData) {
        setPatientProfile(JSON.parse(profileData));
      }
    } catch (error) {
      console.error('Could not parse patient profile from session storage', error);
    } finally {
      setIsInitializing(false);
      setIsLoading(false);
    }
  }, [setIsLoading]);

  const {
    form,
    currentStep,
    totalSteps,
    viewMode,
    isSubmitting,
    error,
    result,
    handleSubmit,
    handleStartNewDiagnosis,
    setCurrentStep,
  } = useDiagnosisForm(patientProfile);

  useEffect(() => {
    if (viewMode !== 'form') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [viewMode]);

  const handleBackToProfiles = () => {
    setIsLoading(true);
    // Use window.location.assign for a hard redirect to bypass potential WebView navigation lock
    window.location.assign('/profiles');
  };

  if (isInitializing) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="container mx-auto flex-grow px-4 py-12">
          <Skeleton className="h-24 w-full mb-8" />
          <Skeleton className="h-64 w-full" />
        </main>
        <AppFooter />
      </div>
    );
  }

  if (!patientProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              {t('no_profile_selected')}
            </CardTitle>
            <CardDescription>{t('profiles_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBackToProfiles} className="mt-4">
              {t('back_to_profiles')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${inter.variable} font-body flex min-h-screen flex-col overflow-x-hidden`}>
      <AppHeader />
      <main className="container mx-auto w-full flex-grow px-4 pb-12 sm:px-6 lg:px-8">
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2 shrink-0">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl capitalize line-clamp-1">
                  {t('start_diagnosis')}: {patientProfile.name}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {t(patientProfile.age)} • {t(patientProfile.sex)}
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={handleBackToProfiles} className="gap-2 w-full sm:w-auto h-9 text-xs">
              <ArrowLeft className="h-4 w-4" />
              {t('back_to_profiles')}
            </Button>
          </CardHeader>
        </Card>

        {viewMode === 'form' ? (
          <DiagnosisForm
            form={form}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            totalSteps={totalSteps}
            patientProfile={patientProfile}
          />
        ) : (
          <DiagnosisResult
            result={result}
            onStartNewDiagnosis={handleStartNewDiagnosis}
            isSubmitting={isSubmitting}
            error={error}
          />
        )}
      </main>
      <AppFooter />
    </div>
  );
}

export default function DiagnosisPageClient() {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <ClientPageContent />
    </QueryClientProvider>
  );
}
