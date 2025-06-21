'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  generateDiagnoses,
  type GenerateDiagnosesInput,
  type GenerateDiagnosesOutput,
} from '@/ai/flows/generate-diagnoses';
import { FormSchema, type FormValues } from '@/lib/schema';
import { AppHeader } from '@/components/layout/AppHeader';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';

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

const DiagnosisList = dynamic(() => import('@/components/diagnosis/DiagnosisList').then((mod) => mod.DiagnosisList), {
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
});

const TOTAL_FORM_STEPS = 4; // 0: Profile, 1: Location, 2: Type, 3: Details

function ClientPageContent() {
  const { toast } = useToast();
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [viewMode, setViewMode] = useState<'form' | 'results'>('form');

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      profile: {
        age: 0,
        sex: undefined,
        chronic_conditions: '',
        medications: '',
        allergies: '',
      },
      symptoms: {
        location: [],
        type: [],
        severity: 5,
        duration: '',
        onset: undefined,
        radiation: '',
        triggers: '',
        extras: '',
      },
    },
    mode: 'onChange',
  });

  const diagnosisMutation = useMutation<GenerateDiagnosesOutput, Error, GenerateDiagnosesInput>({
    mutationFn: generateDiagnoses,
    onSuccess: (result) => {
      if (result && result.diagnoses) {
        setViewMode('results');
        toast({
          title: 'Diagnosis Generated',
          description: 'Potential diagnoses have been successfully generated.',
        });
      } else {
        const errorMessage =
          result?.diagnoses === null
            ? 'The AI returned no specific diagnoses. This can happen with uncommon symptom combinations or if more information is needed. Please review your input or try rephrasing.'
            : 'Received an empty or invalid response from the AI. Please try again.';
        setViewMode('form');
        toast({
          variant: 'destructive',
          title: 'Response Error',
          description: errorMessage,
        });
        console.error('Invalid AI Response:', result);
      }
    },
    onError: (e: Error) => {
      const errorMessage = e.message || 'An unexpected error occurred while generating diagnoses.';
      setViewMode('form');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    },
  });

  const onSubmit = async (values: FormValues) => {
    const numericAge = Number(values.profile.age);
    const ageForAI = numericAge >= 65 ? '65+' : String(numericAge);

    const symptomsForAI: GenerateDiagnosesInput['symptoms'] = {
      location: values.symptoms.location,
      type: values.symptoms.type,
      severity: values.symptoms.severity,
      duration: values.symptoms.duration,
      onset: values.symptoms.onset,
      triggers: values.symptoms.triggers.filter(Boolean),
      extras: values.symptoms.extras.filter(Boolean),
    };

    if (values.symptoms.radiation && values.symptoms.radiation.trim() !== '') {
      symptomsForAI.radiation = values.symptoms.radiation;
    }

    const inputForAI: GenerateDiagnosesInput = {
      profile: {
        age: ageForAI,
        sex: values.profile.sex,
        chronic_conditions: values.profile.chronic_conditions.filter(Boolean),
        medications: values.profile.medications.filter(Boolean),
        allergies: values.profile.allergies.filter(Boolean),
      },
      symptoms: symptomsForAI,
    };

    diagnosisMutation.mutate(inputForAI);
  };

  const handleStartNewDiagnosis = () => {
    form.reset();
    diagnosisMutation.reset();
    setCurrentStep(0);
    setViewMode('form');
  };

  return (
    <div className={`${inter.variable} font-body flex min-h-screen flex-col overflow-x-hidden`}>
      <AppHeader />
      <main className="container mx-auto flex-grow px-4 pb-12 sm:px-6 lg:px-8 w-full">
        {viewMode === 'form' && (
          <DiagnosisForm
            form={form}
            onSubmit={onSubmit}
            isLoading={diagnosisMutation.isPending}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            totalSteps={TOTAL_FORM_STEPS}
          />
        )}

        {viewMode === 'results' && diagnosisMutation.data && (
          <>
            <Button
              onClick={handleStartNewDiagnosis}
              variant="outline"
              className="mb-8 w-full md:w-auto relative z-50"
              aria-label="Start New Diagnosis"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Start New Diagnosis
            </Button>
            <DiagnosisList diagnoses={diagnosisMutation.data.diagnoses} isLoading={false} />
          </>
        )}
        {viewMode === 'results' && diagnosisMutation.isPending && <DiagnosisList diagnoses={null} isLoading={true} />}

        {diagnosisMutation.error && viewMode === 'form' && !diagnosisMutation.isPending && (
          <Alert variant="destructive" className="mt-8" aria-live="polite">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Generating Diagnosis</AlertTitle>
            <AlertDescription>{diagnosisMutation.error.message}</AlertDescription>
          </Alert>
        )}
      </main>
      <footer className="mt-auto border-t border-border py-4">
        <div className="container mx-auto text-center text-sm sm:text-base text-muted-foreground px-2">
          <p className="font-semibold">Disclaimer:</p>
          <p>
            AIDOC © {currentYear ?? new Date().getFullYear()}. This tool provides information for educational purposes
            only and is not a substitute for professional medical advice, diagnosis, or treatment.
          </p>
        </div>
      </footer>
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
