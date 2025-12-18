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
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { patientProfileSchema, PatientProfile } from '@/lib/schema';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { SexIcon3D } from '@/components/3d/SexIcon3D';
import { Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';

// Comprehensive localized medical data
const medicalData: Record<string, { conditions: string[]; meds: string[]; allergies: string[] }> = {
  en: {
    conditions: [
      'Diabetes',
      'Hypertension',
      'Asthma',
      'Heart Disease',
      'CKD',
      'Arthritis',
      'Migraine',
      'Anxiety',
      'Depression',
      'Obesity',
      'Epilepsy',
      'COPD',
      'Lupus',
      'Anemia',
    ],
    meds: [
      'Metformin',
      'Lisinopril',
      'Atorvastatin',
      'Amlodipine',
      'Omeprazole',
      'Albuterol',
      'Gabapentin',
      'Sertraline',
      'Aspirin',
      'Ibuprofen',
      'Acetaminophen',
      'Amoxicillin',
      'Insulin',
    ],
    allergies: [
      'Penicillin',
      'Peanuts',
      'Shellfish',
      'Latex',
      'Dust Mites',
      'Pollen',
      'Bee Stings',
      'Dairy',
      'Eggs',
      'Soy',
      'Wheat',
      'Iodine',
    ],
  },
  id: {
    conditions: [
      'Diabetes',
      'Hipertensi',
      'Asma',
      'Penyakit Jantung',
      'Gagal Ginjal',
      'Artritis',
      'Migrain',
      'Kecemasan',
      'Depresi',
      'Obesitas',
      'Epilepsi',
      'PPOK',
      'Lupus',
      'Anemia',
    ],
    meds: [
      'Metformin',
      'Lisinopril',
      'Atorvastatin',
      'Amlodipine',
      'Omeprazole',
      'Salbutamol',
      'Gabapentin',
      'Sertraline',
      'Aspirin',
      'Ibuprofen',
      'Parasetamol',
      'Amoksisilin',
      'Insulin',
    ],
    allergies: [
      'Penisilin',
      'Kacang-kacangan',
      'Seafood',
      'Lateks',
      'Debu',
      'Serbuk Sari',
      'Sengatan Lebah',
      'Produk Susu',
      'Telur',
      'Kedelai',
      'Gandum',
      'Iodium',
    ],
  },
  es: {
    conditions: [
      'Diabetes',
      'Hipertensión',
      'Asma',
      'Cardiopatía',
      'ERC',
      'Artritis',
      'Migraña',
      'Ansiedad',
      'Depresión',
      'Obesidad',
      'Epilepsia',
      'EPOC',
      'Lupus',
      'Anemia',
    ],
    meds: [
      'Metformina',
      'Lisinopril',
      'Atorvastatina',
      'Amlodipino',
      'Omeprazol',
      'Albuterol',
      'Gabapentina',
      'Sertralina',
      'Aspirina',
      'Ibuprofeno',
      'Acetaminofén',
      'Amoxicilina',
      'Insulina',
    ],
    allergies: [
      'Penicilina',
      'Maní',
      'Mariscos',
      'Látex',
      'Ácaros',
      'Polen',
      'Picadura de abeja',
      'Lácteos',
      'Huevos',
      'Soya',
      'Trigo',
      'Yodo',
    ],
  },
  fr: {
    conditions: [
      'Diabète',
      'Hypertension',
      'Asthme',
      'Maladie Cardiaque',
      'Insuffisance Rénale',
      'Arthrite',
      'Migraine',
      'Anxiété',
      'Dépression',
      'Obésité',
      'Épilepsie',
      'BPCO',
      'Lupus',
      'Anémie',
    ],
    meds: [
      'Metformine',
      'Lisinopril',
      'Atorvastatine',
      'Amlodipine',
      'Oméprazole',
      'Albutérol',
      'Gabapentine',
      'Sertraline',
      'Aspirine',
      'Ibuprofène',
      'Paracétamol',
      'Amoxicilline',
      'Insuline',
    ],
    allergies: [
      'Pénicilline',
      'Arachides',
      'Fruits de mer',
      'Latex',
      'Acariens',
      'Pollen',
      "Piqûre d'abeille",
      'Produits laitiers',
      'Oeufs',
      'Soja',
      'Blé',
      'Iode',
    ],
  },
};

const ageIconMap: { [key: string]: string } = {
  infant: '/images/age_icons/infant.webp',
  toddler: '/images/age_icons/toddler.webp',
  preschooler: '/images/age_icons/preschooler.webp',
  schoolage: '/images/age_icons/schoolage.webp',
  adolescent: '/images/age_icons/adolescent.webp',
  youngadult: '/images/age_icons/youngadult.webp',
  middleageadult: '/images/age_icons/middleageadult.webp',
  olderadult: '/images/age_icons/olderadult.webp',
};

const getAgeIconAndLabel = (ageInput: number | undefined, t: any): { iconPath: string; label: string } => {
  const numericAge = ageInput ?? 0;
  let iconKey: keyof typeof ageIconMap;
  if (numericAge === 0) iconKey = 'infant';
  else if (numericAge >= 1 && numericAge <= 3) iconKey = 'toddler';
  else if (numericAge >= 4 && numericAge <= 5) iconKey = 'preschooler';
  else if (numericAge >= 6 && numericAge <= 12) iconKey = 'schoolage';
  else if (numericAge >= 13 && numericAge <= 18) iconKey = 'adolescent';
  else if (numericAge >= 19 && numericAge <= 40) iconKey = 'youngadult';
  else if (numericAge >= 41 && numericAge <= 64) iconKey = 'middleageadult';
  else if (numericAge >= 65) iconKey = 'olderadult';
  else iconKey = 'youngadult';

  let labelText = `${numericAge}`;
  if (numericAge >= 65) labelText = '65+';
  return { iconPath: ageIconMap[iconKey], label: `${t('age')}: ${labelText}` };
};

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

  const renderSuggestiveTextarea = (
    name: keyof PatientProfile,
    label: string,
    suggestions: string[],
    placeholder: string
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const [popoverOpen, setPopoverOpen] = React.useState(false);
        const [inputValue, setInputValue] = React.useState(field.value?.toString() || '');

        const filteredSuggestions = suggestions.filter((item) =>
          item.toLowerCase().includes(inputValue.split('\n').pop()?.toLowerCase() || '')
        );

        const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
          const value = e.target.value;
          setInputValue(value);
          field.onChange(value);
          setPopoverOpen(true);
        };

        const handleSelectSuggestion = (suggestion: string) => {
          const lines = inputValue.split('\n');
          lines[lines.length - 1] = suggestion;
          const newValue = lines.join('\n') + '\n';
          setInputValue(newValue);
          field.onChange(newValue);
          setPopoverOpen(false);
        };

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Textarea placeholder={placeholder} value={inputValue} onChange={handleInputChange} />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder={`${t('next')}...`} />
                    <ScrollArea className="h-[200px]">
                      <CommandList>
                        <CommandEmpty>{t('none')}</CommandEmpty>
                        <CommandGroup>
                          {filteredSuggestions.map((item) => (
                            <CommandItem key={item} value={item} onSelect={() => handleSelectSuggestion(item)}>
                              {item}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </ScrollArea>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );

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
            {renderSuggestiveTextarea(
              'chronic_conditions',
              t('chronic_conditions_label'),
              langData.conditions,
              'e.g., Type 2 Diabetes'
            )}
            {renderSuggestiveTextarea('medications', t('medications_label'), langData.meds, 'e.g., Metformin')}
            {renderSuggestiveTextarea('allergies', t('allergies'), langData.allergies, 'e.g., Penicillin')}
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
