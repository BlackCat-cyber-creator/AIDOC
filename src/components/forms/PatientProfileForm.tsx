'use client';

import React, { useRef, useState } from 'react';
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
import { Loader2, Upload, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { medicalData, getAgeIconAndLabel } from '@/lib/medical-data';
import { FormTextAreaWithSuggestions } from '@/components/forms/FormTextAreaWithSuggestions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import imageCompression from 'browser-image-compression';

interface PatientProfileFormProps {
  onSubmit: (values: PatientProfile) => Promise<void>;
  initialData?: Partial<PatientProfile>;
  isLoading?: boolean;
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
  const [profilePreview, setProfilePreview] = useState<string | null>(initialData?.profile_picture || null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PatientProfile>({
    resolver: zodResolver(patientProfileSchema),
    defaultValues: initialData || {
      name: '',
      age: 25,
      sex: 'other',
      chronic_conditions: '',
      medications: '',
      allergies: '',
      profile_picture: '',
    },
  });

  const currentAge = form.watch('age');
  const { iconPath: AgeIconToRender, label: ageLabel } = getAgeIconAndLabel(currentAge, t);

  const sexOptions = [
    { value: 'male', label: t('male') },
    { value: 'female', label: t('female') },
    { value: 'other', label: t('other') },
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);

        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setProfilePreview(result);
          form.setValue('profile_picture', result);
          setIsCompressing(false);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error compressing image:', error);
        // Fallback to original file if compression fails
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setProfilePreview(result);
          form.setValue('profile_picture', result);
          setIsCompressing(false);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeProfilePicture = () => {
    setProfilePreview(null);
    form.setValue('profile_picture', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <FormProviderComponent {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('profiles_title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-primary/20">
                  <AvatarImage src={profilePreview || ''} className="object-cover" />
                  <AvatarFallback className="text-2xl font-semibold bg-primary/5">
                    {isCompressing ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : form.watch('name') ? (
                      form.watch('name').charAt(0).toUpperCase()
                    ) : (
                      '?'
                    )}
                  </AvatarFallback>
                </Avatar>
                {profilePreview && !isCompressing && (
                  <button
                    type="button"
                    onClick={removeProfilePicture}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                  disabled={isCompressing}
                >
                  {isCompressing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {t('upload_profile')}
                </Button>
              </div>
            </div>

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
          <Button type="submit" disabled={isLoading || isCompressing}>
            {(isLoading || isCompressing) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitButtonText || t('save_profile')}
          </Button>
        </div>
      </form>
    </FormProviderComponent>
  );
}
