import type { GenerateDiagnosesOutput } from '@/ai/flows/generate-diagnoses';
import { DiagnosisCard } from './DiagnosisCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Accordion } from '@/components/ui/accordion';

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
        <h2 className="text-2xl font-headline font-semibold mb-4 text-primary">Analyzing Symptoms...</h2>
        <div className="space-y-4">
          <DiagnosisSkeleton />
          <DiagnosisSkeleton />
          <DiagnosisSkeleton />
        </div>
      </div>
    );
  }

  if (!diagnoses || diagnoses.length === 0) {
    return (
      <div className="mt-8 text-center p-8 border rounded-lg bg-muted/20">
        <h3 className="text-lg font-semibold">No diagnoses found.</h3>
        <p className="text-muted-foreground">Try adjusting your symptom details or adding more information.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 mb-12">
      <h2 className="text-2xl font-headline font-semibold mb-6 text-primary flex items-center justify-between">
        Potential Diagnoses
        <span className="text-sm font-normal text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {diagnoses.length} Result{diagnoses.length !== 1 ? 's' : ''} Found
        </span>
      </h2>

      {/* Removed defaultValue="item-0" to start collapsed */}
      <Accordion type="single" collapsible className="w-full space-y-4">
        {diagnoses.map((diag, index) => (
          <DiagnosisCard key={index} value={`item-${index}`} diagnosis={diag} />
        ))}
      </Accordion>
    </div>
  );
}
