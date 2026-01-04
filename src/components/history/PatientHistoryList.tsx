'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, ChevronRight, Calendar, Stethoscope, AlertTriangle, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { DiagnosisCard } from '../diagnosis/DiagnosisCard';
import { Accordion } from '@/components/ui/accordion';
import { useFirestore } from '@/hooks/db/useFirestore';
import { orderBy, limit } from 'firebase/firestore';

interface DiagnosisHistoryItem {
  id: string;
  patientName: string;
  patientProfileId: string;
  createdAt: any;
  input: {
    symptoms: {
      location: string[];
      type: string[];
      severity: number;
      duration: string;
      onset: string;
      radiation?: string;
      triggers: string[];
      extras: string[];
      symptomImageUrl?: string;
    };
    profile: {
      age: string;
      sex: string;
    };
  };
  output: {
    diagnoses: Array<{
      condition: string;
      explanation: string;
      urgency: 'urgent' | 'non-urgent' | 'self-care';
      next_steps: string;
      confidence: number;
    }>;
  };
}

export function PatientHistoryList() {
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState<DiagnosisHistoryItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: history, loading } = useFirestore<DiagnosisHistoryItem>('diagnoses', [
    orderBy('createdAt', 'desc'),
    limit(20),
  ]);

  const handleItemClick = (item: DiagnosisHistoryItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const getUrgencyStyles = (urgency: string | undefined) => {
    switch (urgency) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200';
      case 'non-urgent':
        return 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200';
      case 'self-care':
        return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="border-dashed bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Clock className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <p className="text-muted-foreground font-medium">{t('no_history_yet', 'No diagnosis history yet.')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4 animate-fade-in">
        <h3 className="font-semibold flex items-center gap-2 mb-4 text-sm uppercase tracking-wider text-muted-foreground">
          <Clock className="h-4 w-4" /> {t('recent_diagnoses', 'Recent Diagnoses')}
        </h3>
        <div className="grid gap-3">
          {history.map((item) => {
            const primaryDiagnosis = item.output?.diagnoses?.[0];
            const urgency = primaryDiagnosis?.urgency;

            return (
              <Card
                key={item.id}
                className="overflow-hidden hover:border-primary/50 transition-all active:scale-[0.98] cursor-pointer group shadow-sm hover:shadow-md"
                onClick={() => handleItemClick(item)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="font-semibold text-sm text-foreground/80">{item.patientName}</span>
                      </div>
                      <h4 className="font-bold text-lg text-foreground leading-tight">
                        {primaryDiagnosis?.condition || 'Unknown Condition'}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {item.createdAt?.toDate ? format(item.createdAt.toDate(), 'PPP p') : 'Just now'}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          'capitalize text-[10px] px-2 py-0.5 shadow-sm border font-bold',
                          getUrgencyStyles(urgency)
                        )}
                      >
                        {urgency || 'Unknown'}
                      </Badge>
                      <div className="h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-white" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[650px] h-[95vh] sm:h-[90vh] flex flex-col p-0 overflow-hidden rounded-t-2xl sm:rounded-xl">
          <DialogHeader className="p-6 pb-2 shrink-0">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-primary" />
              {t('diagnosis_detail', 'Diagnosis Detail')}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.createdAt?.toDate ? format(selectedItem.createdAt.toDate(), 'PPPP p') : ''}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-grow p-6 pt-2">
            {selectedItem && (
              <div className="space-y-8 pb-10">
                {/* Patient Summary Card */}
                <Card className="bg-primary/5 border-primary/10 shadow-sm">
                  <CardContent className="p-4 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                        {t('patient', 'Patient Name')}
                      </p>
                      <p className="font-bold text-base">{selectedItem.patientName}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                        {t('profile', 'Bio Data')}
                      </p>
                      <p className="text-sm font-medium">
                        {t(selectedItem.input?.profile?.age)} • {t(selectedItem.input?.profile?.sex)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Symptom Context */}
                <div className="space-y-4">
                  <h5 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                    <AlertTriangle className="h-4 w-4" />
                    {t('reported_symptoms', 'Reported Symptoms')}
                  </h5>

                  <div className="grid grid-cols-2 gap-4 bg-muted/30 rounded-xl p-4 border border-border/50">
                    <div className="space-y-2">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">
                        {t('location', 'Location')}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedItem.input?.symptoms?.location?.map((loc) => (
                          <Badge
                            key={loc}
                            variant="outline"
                            className="text-[10px] bg-background shadow-sm border-border"
                          >
                            {t(loc)}
                          </Badge>
                        )) || <span className="text-xs text-muted-foreground">-</span>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">
                        {t('severity', 'Severity')}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full max-w-[100px] bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              (selectedItem.input?.symptoms?.severity ?? 0) > 7
                                ? 'bg-red-500'
                                : (selectedItem.input?.symptoms?.severity ?? 0) > 4
                                  ? 'bg-amber-500'
                                  : 'bg-green-500'
                            )}
                            style={{ width: `${(selectedItem.input?.symptoms?.severity ?? 0) * 10}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">{selectedItem.input?.symptoms?.severity ?? '?'}/10</span>
                      </div>
                    </div>
                  </div>

                  {selectedItem.input?.symptoms?.symptomImageUrl && (
                    <div className="rounded-xl overflow-hidden border shadow-sm group">
                      <div className="relative">
                        <img
                          src={selectedItem.input.symptoms.symptomImageUrl}
                          alt="Symptom"
                          className="w-full h-auto object-cover max-h-60 transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
                        <div className="absolute bottom-2 left-3">
                          <span className="text-[10px] text-white/90 font-medium px-2 py-1 bg-black/40 rounded-full backdrop-blur-sm">
                            Uploaded Image
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Consistent Diagnosis List Style */}
                <div className="space-y-4">
                  <h5 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-primary">
                    <Info className="h-4 w-4" />
                    {t('ai_analysis', 'AI Analysis Results')}
                  </h5>

                  <Accordion type="single" collapsible className="w-full space-y-4">
                    {selectedItem.output?.diagnoses?.map((diag, index) => (
                      <DiagnosisCard key={index} value={`hist-${index}`} diagnosis={diag} />
                    )) || (
                      <p className="text-sm text-muted-foreground p-4 text-center italic">Analysis data incomplete.</p>
                    )}
                  </Accordion>
                </div>

                {/* Disclaimer consistent with medical apps */}
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-800 leading-relaxed italic">
                    {t(
                      'medical_disclaimer',
                      'DISCLAIMER: This analysis is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.'
                    )}
                  </p>
                </div>
              </div>
            )}
          </ScrollArea>

          <div className="p-6 border-t mt-auto bg-background shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <Button className="w-full h-12 text-base font-bold shadow-lg" onClick={() => setIsDetailOpen(false)}>
              {t('close', 'Back to History')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
