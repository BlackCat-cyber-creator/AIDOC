'use client';

import React, { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  User,
  ChevronRight,
  Calendar,
  Stethoscope,
  AlertTriangle,
  Info,
  MapPin,
  ArrowRightCircle,
} from 'lucide-react';
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
  const [user] = useAuthState(auth);
  const { t } = useTranslation();
  const [history, setHistory] = useState<DiagnosisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<DiagnosisHistoryItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;
      try {
        const historyRef = collection(db, 'users', user.uid, 'diagnoses');
        const q = query(historyRef, orderBy('createdAt', 'desc'), limit(20));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as DiagnosisHistoryItem[];
        setHistory(items);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [user]);

  const handleItemClick = (item: DiagnosisHistoryItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
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
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <Clock className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
          <p className="text-muted-foreground font-medium">{t('no_history_yet', 'No diagnosis history yet.')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-primary" /> {t('recent_diagnoses', 'Recent Diagnoses')}
        </h3>
        <div className="grid gap-3">
          {history.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden hover:border-primary/50 transition-all active:scale-[0.98] cursor-pointer group"
              onClick={() => handleItemClick(item)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-bold text-sm">{item.patientName}</span>
                    </div>
                    <h4 className="font-bold text-base text-primary leading-tight">
                      {item.output.diagnoses[0]?.condition}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {item.createdAt?.toDate ? format(item.createdAt.toDate(), 'PPP p') : 'Recently'}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant={item.output.diagnoses[0]?.urgency === 'urgent' ? 'destructive' : 'secondary'}
                      className="capitalize text-[10px] px-1.5 py-0"
                    >
                      {item.output.diagnoses[0]?.urgency}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
                <Card className="bg-primary/5 border-primary/10">
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
                        {t(selectedItem.input.profile.age)} • {t(selectedItem.input.profile.sex)}
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

                  <div className="grid grid-cols-2 gap-4 bg-muted/30 rounded-xl p-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">
                        {t('location', 'Location')}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedItem.input.symptoms.location.map((loc) => (
                          <Badge key={loc} variant="outline" className="text-[10px] bg-background">
                            {t(loc)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">
                        {t('severity', 'Severity')}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full max-w-[100px] bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              selectedItem.input.symptoms.severity > 7
                                ? 'bg-red-500'
                                : selectedItem.input.symptoms.severity > 4
                                  ? 'bg-amber-500'
                                  : 'bg-green-500'
                            )}
                            style={{ width: `${selectedItem.input.symptoms.severity * 10}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">{selectedItem.input.symptoms.severity}/10</span>
                      </div>
                    </div>
                  </div>

                  {selectedItem.input.symptoms.symptomImageUrl && (
                    <div className="rounded-xl overflow-hidden border shadow-sm">
                      <img
                        src={selectedItem.input.symptoms.symptomImageUrl}
                        alt="Symptom"
                        className="w-full h-auto object-cover max-h-60"
                      />
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
                    {selectedItem.output.diagnoses.map((diag, index) => (
                      <DiagnosisCard key={index} value={`hist-${index}`} diagnosis={diag} />
                    ))}
                  </Accordion>
                </div>

                {/* Disclaimer consistent with medical apps */}
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
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

          <div className="p-6 border-t mt-auto bg-background shrink-0">
            <Button className="w-full h-12 text-base font-bold shadow-lg" onClick={() => setIsDetailOpen(false)}>
              {t('close', 'Back to History')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
