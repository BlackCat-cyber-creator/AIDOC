'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DiagnosisList } from './DiagnosisList';
import type { GenerateDiagnosesOutput } from '@/ai/flows/generate-diagnoses';

interface DiagnosisResultProps {
  result: GenerateDiagnosesOutput | undefined;
  onStartNewDiagnosis: () => void;
  isSubmitting: boolean;
  error: Error | null;
}

export function DiagnosisResult({ result, onStartNewDiagnosis, isSubmitting, error }: DiagnosisResultProps) {
  if (isSubmitting) {
    return <DiagnosisList diagnoses={null} isLoading={true} />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-8" aria-live="polite">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Generating Diagnosis</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Button
        onClick={onStartNewDiagnosis}
        variant="outline"
        className="relative z-50 mb-8 w-full md:w-auto"
        aria-label="Start New Diagnosis"
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Start New Diagnosis
      </Button>
      <DiagnosisList diagnoses={result?.diagnoses ?? null} isLoading={false} />
    </>
  );
}
