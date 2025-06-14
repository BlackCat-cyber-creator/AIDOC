import type { GenerateDiagnosesOutput } from '@/ai/flows/generate-diagnoses';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Info, LucideIcon, ArrowRightCircle } from 'lucide-react';
import { Separator } from '../ui/separator';
import React from 'react';

type DiagnosisItem = GenerateDiagnosesOutput['diagnoses'][0];

interface DiagnosisCardProps {
  diagnosis: DiagnosisItem;
}

const UrgencyDetails: Record<
  DiagnosisItem['urgency'],
  { label: string; Icon: LucideIcon; variant: 'destructive' | 'secondary' | 'default' | 'outline'; className?: string }
> = {
  urgent: {
    label: 'Urgent',
    Icon: AlertTriangle,
    variant: 'destructive',
    className: 'bg-destructive/20 text-destructive border-destructive/50 hover:bg-destructive/30',
  },
  'non-urgent': {
    label: 'Non-Urgent',
    Icon: Info,
    variant: 'secondary',
    className: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/50 hover:bg-yellow-500/30',
  },
  'self-care': {
    label: 'Self-Care',
    Icon: CheckCircle2,
    variant: 'default',
    className: 'bg-accent text-accent-foreground border-accent/50 hover:bg-accent/80',
  },
};

export function DiagnosisCard({ diagnosis }: DiagnosisCardProps) {
  const urgencyInfo = UrgencyDetails[diagnosis.urgency];

  return (
    <Card
      className="shadow-lg animate-fade-in rounded-lg p-0 md:p-0 w-full max-w-xl mx-auto"
      aria-label={`Diagnosis: ${diagnosis.condition}`}
    >
      <CardHeader className="pb-2 md:pb-4">
        <div className="flex justify-between items-start gap-2 md:gap-4">
          <CardTitle className="font-headline text-xl md:text-2xl text-primary break-words max-w-[70%]">
            {diagnosis.condition}
          </CardTitle>
          <Badge
            variant={urgencyInfo.variant}
            className={`flex items-center gap-1.5 ${urgencyInfo.className} px-3 py-1 text-sm md:text-base`}
          >
            <urgencyInfo.Icon className="h-4 w-4" />
            {urgencyInfo.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 md:space-y-8 pt-0 pb-4 md:pb-6 px-4 md:px-6">
        <CardDescription className="text-base md:text-lg text-foreground/80 leading-relaxed">
          {diagnosis.explanation}
        </CardDescription>
        {diagnosis.next_steps && (
          <>
            <Separator className="my-4 md:my-6" />
            <div>
              <h3 className="text-sm md:text-base font-semibold text-foreground mb-1.5 flex items-center accent">
                <ArrowRightCircle className="h-4 w-4 mr-2 text-primary/80" />
                <span className="accent">Recommended Next Steps:</span>
              </h3>
              <p className="text-sm md:text-base text-foreground/70 pl-6">{diagnosis.next_steps}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Add fade-in animation
// In globals.css or a component CSS module:
// .animate-fade-in { animation: fadeIn 0.5s ease; }
// @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
