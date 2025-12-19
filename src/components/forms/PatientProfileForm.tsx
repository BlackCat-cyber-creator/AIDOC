'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form as FormProviderComponent,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { patientProfileSchema, PatientProfile } from '@/lib/schema';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { SexIcon3D } from '@/components/3d/SexIcon3D';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { medicalData, ageIconMap, getAgeIconAndLabel } from '@/lib/medical-data';
import { FormTextAreaWithSuggestions } from '@/components/forms/FormTextAreaWithSuggestions';

interface PatientProfileFormProps {
  onSubmit: (values: PatientProfile) => Promise<void>;
  initialData?: Partial<PatientProfile>;
  isLoading: boolean;
  isPremium: boolean;
  submitButtonText?: string;
}

export function PatientProfileForm({
  onSubmit,
  initialData,
  isLoading,
  isPremium,
  submitButtonText,
}: PatientProfileFormProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.split('-')[0] || 'en';
  const langData = medicalData[currentLang] || medicalData.en;

  const form = useForm<PatientProfile>({
    resolver: zodResolver(patientProfileSchema),
    defaultValues: initialData || {
      name: '',
      age: 25,
      sex: 'other',
      chronic_conditions: '',
      medications: '',
      allergies: '',
    },
  });

  const currentAge = form.watch('age');
  const { iconPath: AgeIconToRender, label: ageLabel } = getAgeIconAndLabel(currentAge, t);

  const sexOptions = [
    { value: 'male', label: t('male') },
    { value: 'female', label: t('female') },
    { value: 'other', label: t('other') },
  ];

  return (
    <FormProviderComponent {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('profiles_title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('name')}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('age')}</FormLabel>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex w-1/4 flex-shrink-0 items-center justify-center">
                      <Image src={AgeIconToRender} alt="Age Icon" width={80} height={80} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <FormControl>
                        <Slider
                          value={[Number(field.value) || 0]}
                          min={0}
                          max={80}
                          step={1}
                          onValueChange={(v) => field.onChange(v[0])}
                        />
                      </FormControl>
                      <div className="text-center text-sm text-muted-foreground tabular-nums">{ageLabel}</div>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('sex')}</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-3">
                      {sexOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.onChange(opt.value)}
                          className={cn(
                            'p-4 border rounded-xl flex flex-col items-center justify-center gap-2 transition-all',
                            field.value === opt.value
                              ? 'border-primary bg-primary/10 ring-2 ring-primary'
                              : 'border-input hover:bg-muted/50'
                          )}
                          style={{ minHeight: '160px' }}
                        >
                          {opt.value !== 'other' ? (
                            <SexIcon3D
                              modelPath={`/models/${opt.value}_walking.glb`}
                              scale={1.2}
                              className="w-24 h-24"
                              animate={field.value === opt.value}
                              position={[0, -0.3, 0]}
                            />
                          ) : (
                            <div className="w-24 h-24 flex items-center justify-center text-2xl">?</div>
                          )}
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('medical_history')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormTextAreaWithSuggestions
              control={form.control}
              name="chronic_conditions"
              label={t('chronic_conditions_label')}
              suggestions={langData.conditions}
              placeholder="e.g., Type 2 Diabetes"
            />
            <FormTextAreaWithSuggestions
              control={form.control}
              name="medications"
              label={t('medications_label')}
              suggestions={langData.meds}
              placeholder="e.g., Metformin"
            />
            <FormTextAreaWithSuggestions
              control={form.control}
              name="allergies"
              label={t('allergies')}
              suggestions={langData.allergies}
              placeholder="e.g., Penicillin"
            />
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitButtonText || t('save_profile')}
          </Button>
        </div>
      </form>
    </FormProviderComponent>
  );
}
