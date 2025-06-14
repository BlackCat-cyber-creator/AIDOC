import type { GenerateDiagnosesOutput } from '@/ai/flows/generate-diagnoses';
import { DiagnosisCard } from './DiagnosisCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '../ui/card';

interface DiagnosisListProps {
  diagnoses: GenerateDiagnosesOutput['diagnoses'] | null;
  isLoading: boolean;
}

function DiagnosisSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/5" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </CardContent>
    </Card>
  );
}

export function DiagnosisList({ diagnoses, isLoading }: DiagnosisListProps) {
  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-headline font-semibold mb-4 text-primary">Potential Diagnoses</h2>
        <div className="space-y-4">
          <DiagnosisSkeleton />
          <DiagnosisSkeleton />
          <DiagnosisSkeleton />
        </div>
      </div>
    );
  }

  if (!diagnoses || diagnoses.length === 0) {
    return null; // Or a message like "No diagnoses generated yet."
  }

  return (
    <div className="mt-12 mb-8">
      <h2 className="text-2xl font-headline font-semibold mb-6 text-primary">Potential Diagnoses</h2>
      <div className="space-y-6">
        {diagnoses.map((diag, index) => (
          <DiagnosisCard key={index} diagnosis={diag} />
        ))}
      </div>
    </div>
  );
}
