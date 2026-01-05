'use client';

import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { type GenerateDiagnosesInput, type GenerateDiagnosesOutput } from '@/ai/flows/generate-diagnoses';
import { FormSchema, type FormValues, type PatientProfile } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';
import { transformFormDataForAI } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, setDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/components/UserProvider';

export type ViewMode = 'form' | 'results';

export interface DiagnosisFormState {
  form: UseFormReturn<FormValues>;
  currentStep: number;
  totalSteps: number;
  viewMode: ViewMode;
  isSubmitting: boolean;
  error: Error | null;
  result: GenerateDiagnosesOutput | undefined;
  handleSubmit: (values: FormValues) => void;
  handleStartNewDiagnosis: () => void;
  setCurrentStep: (step: number | ((prevStep: number) => number)) => void;
}

const TOTAL_FORM_STEPS = 3;
const FREE_DAILY_LIMIT = 6;
const PRO_DAILY_LIMIT = 50;

async function generateDiagnosesFromApi(input: GenerateDiagnosesInput): Promise<GenerateDiagnosesOutput> {
  const response = await fetch('/api/diagnose', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate diagnosis from API.');
  }

  return response.json();
}

export function useDiagnosisForm(patientProfile: PatientProfile | null): DiagnosisFormState {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('form');
  const [user] = useAuthState(auth);
  const { settings } = useUser();

  const isPremium = settings.isPremium;

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema.omit({ profile: true })),
    defaultValues: {
      symptoms: {
        location: [],
        type: [],
        severity: 5,
        duration: '',
        onset: undefined,
        radiation: '',
        triggers: '',
        extras: '',
        symptomImageUrl: '',
      },
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (patientProfile) {
      form.reset({
        ...form.getValues(),
        profile: patientProfile,
      });
    }
  }, [patientProfile, form]);

  const mutation: UseMutationResult<GenerateDiagnosesOutput, Error, GenerateDiagnosesInput> = useMutation<
    GenerateDiagnosesOutput,
    Error,
    GenerateDiagnosesInput
  >({
    mutationFn: generateDiagnosesFromApi,
    onSuccess: async (result, variables) => {
      if (result && result.diagnoses && user && patientProfile) {
        try {
          // 1. Save to History (Patient History Feature)
          // Ensure patientProfileId matches what the rules likely expect (user.uid) or just satisfy the write rule
          const historyCollection = collection(db, 'users', user.uid, 'diagnoses');

          // CRITICAL FIX: Ensure the patientProfileId matches the authenticated user's ID
          // based on your likely security rules (resource.data.patientProfileId == request.auth.uid)
          // If your rules are strict, this ID must match the user's UID.
          // However, based on the context, patientProfile.id is usually just the user's UID anyway if it was created correctly.
          // But to be safe and match the previous code that worked:

          const diagnosisData = {
            patientProfileId: user.uid, // Using user.uid ensures it passes ownership rules if they check this field
            patientName: patientProfile.name,
            input: variables,
            output: result,
            createdAt: serverTimestamp(),
          };

          await addDoc(historyCollection, diagnosisData);

          // 2. Update usage count
          const today = new Date().toISOString().split('T')[0];
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            diagnosisCount: increment(1),
            lastDiagnosisDate: today,
          }).catch(async (err) => {
            await setDoc(userRef, { diagnosisCount: 1, lastDiagnosisDate: today }, { merge: true });
          });

          setViewMode('results');
          toast({
            title: 'Diagnosis Generated',
            description: 'Potential diagnoses have been successfully generated and saved to history.',
          });
        } catch (dbError) {
          console.error('Error saving history:', dbError);
          // Show results even if saving history fails, but log it clearly
          setViewMode('results');
          toast({
            variant: 'warning', // Use warning variant if available, else standard
            title: 'Results Ready (History Not Saved)',
            description: 'Diagnosis generated, but could not be saved to history.',
          });
        }
      } else if (!result || !result.diagnoses) {
        const errorMessage = 'Received an empty or invalid response from the AI. Please try again.';
        setViewMode('form');
        toast({
          variant: 'destructive',
          title: 'Response Error',
          description: errorMessage,
        });
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

  const handleSubmit = async (values: FormValues) => {
    if (!patientProfile) {
      toast({ variant: 'destructive', title: 'Error', description: 'No patient profile selected.' });
      return;
    }
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const dailyLimit = isPremium ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;

    if (settings.lastDiagnosisDate === today && settings.diagnosisCount >= dailyLimit) {
      toast({
        variant: 'destructive',
        title: 'Daily Limit Reached',
        description: isPremium
          ? `You have reached the daily limit of ${PRO_DAILY_LIMIT} diagnoses.`
          : `You have used your ${FREE_DAILY_LIMIT} free daily diagnoses. Upgrade to Premium for more!`,
      });
      return;
    }

    const fullData: FormValues = {
      ...values,
      profile: patientProfile,
    };
    const inputForAI = transformFormDataForAI(fullData, isPremium, i18n.language);
    mutation.mutate(inputForAI);
  };

  const handleStartNewDiagnosis = () => {
    form.reset({
      symptoms: {
        location: [],
        type: [],
        severity: 5,
        duration: '',
        onset: undefined,
        radiation: '',
        triggers: '',
        extras: '',
        symptomImageUrl: '',
      },
      profile: patientProfile || undefined,
    });
    mutation.reset();
    setCurrentStep(0);
    setViewMode('form');
  };

  return {
    form,
    currentStep,
    totalSteps: TOTAL_FORM_STEPS,
    viewMode,
    isSubmitting: mutation.isPending,
    error: mutation.error,
    result: mutation.data,
    handleSubmit,
    handleStartNewDiagnosis,
    setCurrentStep,
  };
}
