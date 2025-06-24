'use client';

import React, { useMemo } from 'react';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDiagnosisForm } from '@/hooks/use-diagnosis-form';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { Skeleton } from '@/components/ui/skeleton';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

const DiagnosisForm = dynamic(() => import('@/components/forms/DiagnosisForm').then((mod) => mod.DiagnosisForm), {
  ssr: false,
  loading: () => (
    <div className="space-y-6 p-4">
      <div className="mb-6 rounded-md border bg-muted/30 p-3 text-center">
        <Skeleton className="mx-auto mb-2 h-5 w-1/2" />
        <Skeleton className="h-2 w-full rounded-full bg-primary/20" />
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
      <div className="flex justify-between">
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
      <div className="mt-8 p-4">
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
  } = useDiagnosisForm();

  return (
    <div className={`${inter.variable} font-body flex min-h-screen flex-col overflow-x-hidden`}>
      <AppHeader />
      <main className="container mx-auto w-full flex-grow px-4 pb-12 sm:px-6 lg:px-8">
        {viewMode === 'form' ? (
          <DiagnosisForm
            form={form}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            totalSteps={totalSteps}
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

export default function Home() {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <ClientPageContent />
    </QueryClientProvider>
  );
}
