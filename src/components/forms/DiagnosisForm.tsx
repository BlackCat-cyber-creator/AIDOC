'use client';

import * as React from 'react';
import type { UseFormReturn, FieldPath } from 'react-hook-form';
import {
  Form as FormProviderComponent,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import type { FormValues, PatientProfile } from '@/lib/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Check, X as XIcon, MapPin, ListChecks, ClipboardList, Camera, Crown, Upload } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { HumanAnatomy3D } from '@/components/3d/HumanAnatomy3D';
import { auth, db, storage } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useTranslation } from 'react-i18next';
import imageCompression from 'browser-image-compression';
import { MultiStepLoader } from '@/components/ui/multi-step-loader';
import { symptomTypesByLanguage, regionIds3D, symptomTypeToLocationMapping } from '@/lib/symptoms-data';

interface DiagnosisFormProps {
  form: UseFormReturn<FormValues>;
  onSubmit: (values: FormValues) => void;
  isLoading: boolean;
  currentStep: number;
  setCurrentStep: (step: number | ((prevStep: number) => number)) => void;
  totalSteps: number;
  patientProfile: PatientProfile;
}

export const DiagnosisForm = React.memo(function DiagnosisForm({
  form,
  onSubmit,
  isLoading,
  currentStep,
  setCurrentStep,
  totalSteps,
  patientProfile,
}: DiagnosisFormProps) {
  const { t, i18n } = useTranslation();
  const [user] = useAuthState(auth);
  const [isPremium, setIsPremium] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [symptomTypePopoverOpen, setSymptomTypePopoverOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const stepTitles = [t('symptom_location'), t('symptom_type'), t('symptom_details')];
  const stepIcons: Record<number, React.ElementType> = {
    0: MapPin,
    1: ListChecks,
    2: ClipboardList,
  };

  React.useEffect(() => {
    async function checkSubscription() {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setIsPremium(userDoc.data().isPremium || false);
        }
      }
    }
    checkSubscription();
  }, [user]);

  const selectedSex = patientProfile.sex;
  const selectedLocations = form.watch('symptoms.location') || [];
  const imageUrl = form.watch('symptoms.symptomImageUrl');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      const storageRef = ref(storage, `users/${user.uid}/symptoms/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, compressedFile);
      const downloadURL = await getDownloadURL(storageRef);
      form.setValue('symptoms.symptomImageUrl', downloadURL, { shouldValidate: true });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const currentSymptomTypes = React.useMemo(() => {
    const lang = i18n.language?.split('-')[0] || 'en';
    return symptomTypesByLanguage[lang] || symptomTypesByLanguage['en'];
  }, [i18n.language]);

  const filteredSymptomTypesForDropdown = React.useMemo(() => {
    if (!selectedLocations || selectedLocations.length === 0) {
      return currentSymptomTypes;
    }
    const displayableSymptomTypeValues = new Set<string>();
    currentSymptomTypes.forEach((st) => {
      const allowedRegions = symptomTypeToLocationMapping[st.value] || [];
      if (allowedRegions.length === 0) {
        displayableSymptomTypeValues.add(st.value);
        return;
      }
      const isRelevant = selectedLocations.some((sl) => allowedRegions.includes(sl));
      if (isRelevant) {
        displayableSymptomTypeValues.add(st.value);
      }
    });
    return currentSymptomTypes.filter((st) => displayableSymptomTypeValues.has(st.value));
  }, [selectedLocations, currentSymptomTypes]);

  const handleNext = async () => {
    // Only trigger validation for the fields in the CURRENT step
    const fieldsForStep: FieldPath<FormValues>[][] = [
      ['symptoms.location'],
      ['symptoms.type'],
      [
        'symptoms.severity',
        'symptoms.duration',
        'symptoms.onset',
        'symptoms.triggers',
        'symptoms.extras',
        'symptoms.symptomImageUrl',
      ],
    ];

    // Validate only current step fields before moving forward
    const isValid = await form.trigger(fieldsForStep[currentStep], { shouldFocus: true });
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const loadingStates = [
    { text: t('collecting_patient_data') },
    { text: t('analyzing_symptoms') },
    { text: t('correlating_data') },
    { text: t('running_analysis') },
    { text: t('generating_report') },
    { text: t('finalizing_diagnosis') },
  ];

  return (
    <FormProviderComponent {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 md:space-y-12 animate-fade-in max-w-2xl mx-auto px-2 md:px-0"
      >
        <div className="mb-6 rounded-md border bg-muted/30 p-3 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            {t('step')} {currentStep + 1} {t('of')} {totalSteps}:{' '}
            <span className="font-semibold text-primary">{stepTitles[currentStep]}</span>
          </p>
          <Progress value={((currentStep + 1) / totalSteps) * 100} className="mt-2 h-2 w-full" />
          <div className="mt-4 flex justify-between gap-2 text-xs font-medium text-muted-foreground">
            {stepTitles.map((title, index) => (
              <div
                key={index}
                className={cn(
                  'flex flex-col items-center flex-1 text-center',
                  currentStep >= index ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {React.createElement(stepIcons[index], {
                  className: cn('h-5 w-5 mb-1', currentStep >= index ? 'text-primary' : 'text-muted-foreground'),
                })}
                <span className={cn(currentStep === index ? 'font-semibold' : '', 'text-sm hidden sm:block')}>
                  {title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {currentStep === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary/80" /> {stepTitles[0]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="symptoms.location"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      {t('symptom_location')} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div>
                        <HumanAnatomy3D
                          selectedLocations={field.value || []}
                          onLocationToggle={(loc) => {
                            const cur = field.value || [];
                            field.onChange(cur.includes(loc) ? cur.filter((v) => v !== loc) : [...cur, loc]);
                          }}
                          selectedSex={selectedSex as any}
                          disabled={selectedSex === 'other'}
                        />
                        <FormField
                          control={form.control}
                          name="symptoms.location"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md shadow-sm">
                              <FormControl>
                                <Checkbox
                                  checked={(field.value || []).includes('skin-general')}
                                  onCheckedChange={(checked) => {
                                    const cur = field.value || [];
                                    field.onChange(
                                      checked ? [...cur, 'skin-general'] : cur.filter((v) => v !== 'skin-general')
                                    );
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>{t('skin_general')}</FormLabel>
                                <FormDescription>{t('skin_general_desc')}</FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <ListChecks className="h-6 w-6 text-primary/80" /> {stepTitles[1]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="symptoms.type"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      {t('symptom_type')} <span className="text-destructive">*</span>
                    </FormLabel>
                    <Popover open={symptomTypePopoverOpen} onOpenChange={setSymptomTypePopoverOpen}>
                      <PopoverTrigger asChild disabled={selectedLocations.length === 0}>
                        <FormControl>
                          <div
                            className={cn(
                              'flex flex-wrap w-full items-center gap-1 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[2.5rem] cursor-pointer',
                              selectedLocations.length === 0 && 'cursor-not-allowed opacity-50'
                            )}
                          >
                            {field.value?.length ? (
                              field.value.map((val) => (
                                <Badge variant="secondary" key={val} className="flex items-center gap-1">
                                  {currentSymptomTypes.find((s) => s.value === val)?.label || val}
                                  <XIcon
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      field.onChange(field.value.filter((v) => v !== val));
                                    }}
                                  />
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground">
                                {selectedLocations.length ? `${t('next')}...` : t('symptom_location')}
                              </span>
                            )}
                          </div>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder={`${t('next')}...`} />
                          <ScrollArea className="h-[200px]">
                            <CommandList>
                              <CommandEmpty>{t('none')}</CommandEmpty>
                              <CommandGroup>
                                {filteredSymptomTypesForDropdown.map((s) => (
                                  <CommandItem
                                    key={s.value}
                                    value={s.label}
                                    onSelect={() => {
                                      const cur = field.value || [];
                                      field.onChange(
                                        cur.includes(s.value) ? cur.filter((v) => v !== s.value) : [...cur, s.value]
                                      );
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        field.value?.includes(s.value) ? 'opacity-100' : 'opacity-0'
                                      )}
                                    />
                                    {s.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </ScrollArea>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <ClipboardList className="h-6 w-6 text-primary/80" /> {stepTitles[2]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="symptoms.symptomImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      {t('upload_photo')} ({t('optional')})
                      <Crown className={cn('h-3 w-3', isPremium ? 'text-yellow-500' : 'text-muted-foreground')} />
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                        />
                        <div
                          className={cn(
                            'h-48 w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center bg-muted/30 overflow-hidden relative transition-all group',
                            isPremium
                              ? 'cursor-pointer hover:border-primary hover:bg-primary/5'
                              : 'opacity-60 cursor-not-allowed grayscale'
                          )}
                          onClick={() => isPremium && fileInputRef.current?.click()}
                        >
                          {isUploading ? (
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              <p className="text-xs font-medium animate-pulse">Uploading...</p>
                            </div>
                          ) : imageUrl ? (
                            <>
                              <img src={imageUrl} alt="Symptom" className="h-full w-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <p className="text-white text-sm font-bold flex items-center gap-2">
                                  <Upload className="h-4 w-4" /> Change Photo
                                </p>
                              </div>
                            </>
                          ) : (
                            <div className="text-center p-6 space-y-2">
                              <Camera className="h-10 w-10 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
                              <div>
                                <p className="text-sm font-semibold">{t('upload_photo')}</p>
                                <p className="text-xs text-muted-foreground">
                                  {isPremium ? 'Use camera or select file' : t('upgrade_premium')}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="symptoms.severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('severity')} (1-10) <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4 pt-2">
                        <Slider
                          value={[Number(field.value) || 5]}
                          min={1}
                          max={10}
                          step={1}
                          onValueChange={(v) => field.onChange(v[0])}
                          className="w-[85%]"
                        />
                        <span className="w-[10%] text-right text-sm">{field.value}</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="symptoms.duration"
                render={({ field }) => {
                  const rawValue = field.value || '';
                  const parts = rawValue.split(' ');
                  const num = parts[0] || '';
                  const unit = parts[1] || 'days';

                  return (
                    <FormItem>
                      <FormLabel>
                        {t('duration')} <span className="text-destructive">*</span>
                      </FormLabel>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="e.g., 2"
                          value={num}
                          min="0"
                          onChange={(e) => {
                            const val = e.target.value;
                            if (Number(val) < 0) return;
                            field.onChange(`${val} ${unit}`);
                          }}
                          className="flex-grow"
                        />
                        <Select value={unit} onValueChange={(v) => field.onChange(`${num || '0'} ${v}`)}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="days">{t('days')}</SelectItem>
                            <SelectItem value="weeks">{t('weeks')}</SelectItem>
                            <SelectItem value="months">{t('months')}</SelectItem>
                            <SelectItem value="years">{t('years')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="symptoms.onset"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('onset')} <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('onset')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sudden">{t('sudden')}</SelectItem>
                        <SelectItem value="gradual">{t('gradual')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="symptoms.radiation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('radiation')}</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., To the left arm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="symptoms.triggers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('triggers')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Certain foods, Stress"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="symptoms.extras"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('extra_info')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Sharp pain, dull ache"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        <div className="mt-8 flex items-center justify-between">
          <div className="w-[100px]">
            {currentStep > 0 && (
              <Button type="button" variant="outline" onClick={handlePrev}>
                {t('previous')}
              </Button>
            )}
          </div>
          {currentStep < totalSteps - 1 ? (
            <Button type="button" onClick={handleNext}>
              {t('next')}
            </Button>
          ) : (
            <Button type="submit" disabled={isLoading || !form.formState.isValid || isUploading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('analyzing')}
                </>
              ) : (
                t('get_diagnosis')
              )}
            </Button>
          )}
        </div>
      </form>
      <MultiStepLoader loadingStates={loadingStates} loading={isLoading} duration={1500} />
    </FormProviderComponent>
  );
});
