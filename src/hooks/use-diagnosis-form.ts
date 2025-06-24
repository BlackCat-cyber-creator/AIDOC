'use client';

import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import {
  generateDiagnoses,
  type GenerateDiagnosesInput,
  type GenerateDiagnosesOutput,
} from '@/ai/flows/generate-diagnoses';
import { FormSchema, type FormValues } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';
import { transformFormDataForAI } from '@/lib/utils';
import { useState } from 'react';

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
  setCurrentStep: (step: number) => void;
}

const TOTAL_FORM_STEPS = 4;

export function useDiagnosisForm(): DiagnosisFormState {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('form');

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

  const mutation: UseMutationResult<GenerateDiagnosesOutput, Error, GenerateDiagnosesInput> = useMutation<
    GenerateDiagnosesOutput,
    Error,
    GenerateDiagnosesInput
  >({
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

  const handleSubmit = (values: FormValues) => {
    const inputForAI = transformFormDataForAI(values);
    mutation.mutate(inputForAI);
  };

  const handleStartNewDiagnosis = () => {
    form.reset();
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
