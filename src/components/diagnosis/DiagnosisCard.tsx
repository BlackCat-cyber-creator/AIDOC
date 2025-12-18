import type { GenerateDiagnosesOutput } from '@/ai/flows/generate-diagnoses';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { AlertTriangle, CheckCircle2, Info, LucideIcon, ArrowRightCircle } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

type DiagnosisItem = GenerateDiagnosesOutput['diagnoses'][0];

interface DiagnosisCardProps {
  diagnosis: DiagnosisItem;
  value: string;
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
    className: 'bg-green-500/20 text-green-700 border-green-500/50 hover:bg-green-500/30',
  },
};

export function DiagnosisCard({ diagnosis, value }: DiagnosisCardProps) {
  const urgencyInfo = UrgencyDetails[diagnosis.urgency];
  const confidence = diagnosis.confidence || 0;

  // Determine color for progress bar
  let progressColor = 'bg-primary';
  if (confidence > 80) progressColor = 'bg-green-600';
  else if (confidence > 50) progressColor = 'bg-yellow-500';
  else progressColor = 'bg-gray-400';

  return (
    <AccordionItem value={value} className="border rounded-lg bg-card shadow-sm px-2">
      <AccordionTrigger className="hover:no-underline py-4 px-2">
        <div className="flex flex-col gap-3 w-full text-left">
          <div className="flex justify-between items-start w-full pr-4">
            <span className="font-headline text-lg md:text-xl font-semibold text-primary">{diagnosis.condition}</span>
            <Badge
              variant={urgencyInfo.variant}
              className={cn('flex items-center gap-1.5 shrink-0 ml-2', urgencyInfo.className)}
            >
              <urgencyInfo.Icon className="h-3 w-3" />
              {urgencyInfo.label}
            </Badge>
          </div>

          <div className="w-full pr-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Confidence Match</span>
              <span className="font-medium">{confidence}%</span>
            </div>
            <Progress value={confidence} className="h-2" indicatorClassName={progressColor} />
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-2 pb-4">
        <div className="space-y-6 pt-2">
          <p className="text-base text-foreground/90 leading-relaxed">{diagnosis.explanation}</p>

          {diagnosis.next_steps && (
            <div className="bg-muted/30 p-4 rounded-md border border-border/50">
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center">
                <ArrowRightCircle className="h-4 w-4 mr-2 text-primary" />
                Recommended Next Steps
              </h3>
              <p className="text-sm text-foreground/80 pl-6">{diagnosis.next_steps}</p>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
