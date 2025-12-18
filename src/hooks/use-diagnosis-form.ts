'use client';

import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import {
  generateDiagnoses,
  type GenerateDiagnosesInput,
  type GenerateDiagnosesOutput,
} from '@/ai/flows/generate-diagnoses';
import { FormSchema, type FormValues, type PatientProfile } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';
import { transformFormDataForAI } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment, setDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useTranslation } from 'react-i18next';

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

export function useDiagnosisForm(patientProfile: PatientProfile | null): DiagnosisFormState {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('form');
  const [user] = useAuthState(auth);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    async function checkSubscription() {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setIsPremium(userDoc.data().isPremium || false);
          }
        } catch (error) {
          console.error('Error fetching premium status:', error);
        }
      }
    }
    checkSubscription();
  }, [user]);

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
    mutationFn: generateDiagnoses,
    onSuccess: async (result) => {
      if (result && result.diagnoses) {
        // Increment usage count on success
        if (user) {
          const today = new Date().toISOString().split('T')[0];
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            diagnosisCount: increment(1),
            lastDiagnosisDate: today,
          }).catch(async (err) => {
            // If the document doesn't exist or field is missing, set it
            await setDoc(userRef, { diagnosisCount: 1, lastDiagnosisDate: today }, { merge: true });
          });
        }

        setViewMode('results');
        toast({
          title: 'Diagnosis Generated',
          description: 'Potential diagnoses have been successfully generated.',
        });
      } else {
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

    // Check Daily Limit
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    const today = new Date().toISOString().split('T')[0];
    const lastDate = userData?.lastDiagnosisDate;
    let count = userData?.diagnosisCount || 0;

    if (lastDate !== today) {
      count = 0; // Reset count for a new day
      await updateDoc(doc(db, 'users', user.uid), { diagnosisCount: 0, lastDiagnosisDate: today });
    }

    const dailyLimit = isPremium ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;

    if (count >= dailyLimit) {
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
    // Pass current language to the AI
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
