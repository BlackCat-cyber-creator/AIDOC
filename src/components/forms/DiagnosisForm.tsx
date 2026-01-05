'use client';

import * as React from 'react';
import dynamic from 'next/dynamic'; // Added for Lazy Loading
import type { UseFormReturn, FieldPath } from 'react-hook-form';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import type { FormValues, PatientProfile } from '@/lib/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Loader2,
  Check,
  X as XIcon,
  MapPin,
  ListChecks,
  ClipboardList,
  Camera,
  Crown,
  Upload,
  ArrowLeft,
  Zap,
  TrendingUp,
  Calendar,
  Activity,
  AlertCircle,
  ChevronRight,
  Mic,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
// import { HumanAnatomy3D } from '@/components/3d/HumanAnatomy3D'; // Removed static import
import { auth, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useTranslation } from 'react-i18next';
import imageCompression from 'browser-image-compression';
import { MultiStepLoader } from '@/components/ui/multi-step-loader';
import { symptomTypesByLanguage, symptomTypeToLocationMapping } from '@/lib/symptoms-data';
import { useUser } from '@/components/UserProvider';
import { useLoading } from '@/components/LoadingProvider';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the heavy 3D component
const HumanAnatomy3D = dynamic(() => import('@/components/3d/HumanAnatomy3D').then((mod) => mod.HumanAnatomy3D), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] flex items-center justify-center bg-muted/10 rounded-2xl animate-pulse">
      <div className="flex flex-col items-center gap-4">
        <Activity className="h-10 w-10 text-muted-foreground/50 animate-bounce" />
        <p className="text-sm text-muted-foreground font-medium">Loading 3D Model...</p>
      </div>
    </div>
  ),
});

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
  const { settings } = useUser();
  const { setIsLoading } = useLoading();
  const [isUploading, setIsUploading] = React.useState(false);
  const [symptomTypePopoverOpen, setSymptomTypePopoverOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isPremium = settings.isPremium;

  const stepTitles = [t('symptom_location'), t('symptom_type'), t('symptom_details')];

  const selectedSex = patientProfile.sex;
  const selectedLocations = form.watch('symptoms.location') || [];
  const imageUrl = form.watch('symptoms.symptomImageUrl');
  const severityValue = form.watch('symptoms.severity');

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

  const handleNext = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

    const isValid = await form.trigger(fieldsForStep[currentStep], { shouldFocus: true });
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsLoading(true);
      window.location.assign('/profiles');
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

  // Helper for step indicator
  const StepIndicator = ({ step, current }: { step: number; current: number }) => {
    const isActive = step === current;
    const isCompleted = step < current;
    return (
      <div
        className={cn(
          'flex-1 h-1.5 rounded-full transition-all duration-500',
          isActive ? 'bg-primary' : isCompleted ? 'bg-primary/40' : 'bg-muted'
        )}
      />
    );
  };

  return (
    <FormProviderComponent {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col min-h-[calc(100vh-140px)] max-w-xl mx-auto px-4 pb-6"
      >
        {/* Modern Step Indicator */}
        <div className="flex gap-2 mb-8 pt-2">
          {stepTitles.map((_, i) => (
            <StepIndicator key={i} step={i} current={currentStep} />
          ))}
        </div>

        <div className="flex-grow space-y-6">
          <div className="space-y-1 mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{stepTitles[currentStep]}</h2>
            <p className="text-sm text-muted-foreground">
              {currentStep === 0 && t('step1_desc', 'Tap on the body model to select affected areas.')}
              {currentStep === 1 && t('step2_desc', 'Select all symptoms that apply to the areas you chose.')}
              {currentStep === 2 && t('step3_desc', 'Provide details to help the AI understand your condition.')}
            </p>
          </div>

          {currentStep === 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <FormField
                control={form.control}
                name="symptoms.location"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-4">
                    <FormControl>
                      <div className="bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden relative">
                        <HumanAnatomy3D
                          selectedLocations={field.value || []}
                          onLocationToggle={(loc) => {
                            const cur = field.value || [];
                            field.onChange(cur.includes(loc) ? cur.filter((v) => v !== loc) : [...cur, loc]);
                          }}
                          selectedSex={selectedSex as any}
                          disabled={selectedSex === 'other'}
                        />

                        <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-md p-3 rounded-xl border border-border/50 shadow-sm flex items-center justify-between">
                          <div className="flex flex-wrap gap-1 max-h-[60px] overflow-y-auto w-full no-scrollbar">
                            {(field.value || []).length === 0 ? (
                              <span className="text-xs text-muted-foreground italic flex items-center gap-2">
                                <Activity className="h-3 w-3" /> {t('tap_to_select', 'Tap body parts to select')}
                              </span>
                            ) : (
                              (field.value || []).map((loc) => (
                                <Badge key={loc} variant="secondary" className="text-[10px] px-1.5 h-5">
                                  {t(loc)}
                                  <XIcon
                                    className="h-2 w-2 ml-1 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const cur = field.value || [];
                                      field.onChange(cur.filter((v) => v !== loc));
                                    }}
                                  />
                                </Badge>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </FormControl>

                    <FormField
                      control={form.control}
                      name="symptoms.location"
                      render={({ field }) => (
                        <div
                          className={cn(
                            'flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer',
                            (field.value || []).includes('skin-general')
                              ? 'bg-primary/5 border-primary/30'
                              : 'bg-card border-border hover:bg-muted/50'
                          )}
                          onClick={() => {
                            const cur = field.value || [];
                            const isChecked = cur.includes('skin-general');
                            field.onChange(
                              isChecked ? cur.filter((v) => v !== 'skin-general') : [...cur, 'skin-general']
                            );
                          }}
                        >
                          <Checkbox
                            checked={(field.value || []).includes('skin-general')}
                            onCheckedChange={() => {}} // Handled by parent click
                            className="h-5 w-5 rounded-full border-2"
                          />
                          <div className="space-y-0.5">
                            <span className="text-sm font-semibold">{t('skin_general')}</span>
                            <p className="text-xs text-muted-foreground">{t('skin_general_desc')}</p>
                          </div>
                        </div>
                      )}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
              <FormField
                control={form.control}
                name="symptoms.type"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="sr-only">{t('symptom_type')}</FormLabel>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {field.value?.map((val) => (
                        <Badge
                          key={val}
                          className="pl-3 pr-2 py-1.5 text-sm gap-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          {currentSymptomTypes.find((s) => s.value === val)?.label || val}
                          <XIcon
                            className="h-3.5 w-3.5 cursor-pointer opacity-70 hover:opacity-100"
                            onClick={() => field.onChange(field.value.filter((v) => v !== val))}
                          />
                        </Badge>
                      ))}
                    </div>

                    <Popover open={symptomTypePopoverOpen} onOpenChange={setSymptomTypePopoverOpen}>
                      <PopoverTrigger asChild disabled={selectedLocations.length === 0}>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            'w-full justify-between h-14 text-base font-normal rounded-xl border-border/60 hover:bg-muted/30',
                            selectedLocations.length === 0 && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <span className={field.value?.length ? 'text-foreground' : 'text-muted-foreground'}>
                            {selectedLocations.length === 0
                              ? t('select_location_first', 'Please go back and select a location')
                              : t('add_symptom', '+ Add a symptom')}
                          </span>
                          <ChevronRight className="h-4 w-4 opacity-50 rotate-90" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[calc(100vw-32px)] sm:w-[500px] p-0 rounded-xl shadow-xl border-border/50"
                        align="center"
                      >
                        <Command className="rounded-xl">
                          <CommandInput
                            placeholder={t('search_symptoms', 'Search symptoms...')}
                            className="h-14 text-base border-none focus:ring-0"
                          />
                          <ScrollArea className="h-[300px]">
                            <CommandList>
                              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                                {t('no_symptoms_found', 'No symptoms found.')}
                              </CommandEmpty>
                              <CommandGroup>
                                {filteredSymptomTypesForDropdown.map((s) => (
                                  <CommandItem
                                    key={s.value}
                                    value={s.label}
                                    className="py-3 px-4 text-base cursor-pointer aria-selected:bg-primary/10"
                                    onSelect={() => {
                                      const cur = field.value || [];
                                      field.onChange(
                                        cur.includes(s.value) ? cur.filter((v) => v !== s.value) : [...cur, s.value]
                                      );
                                      setSymptomTypePopoverOpen(false);
                                    }}
                                  >
                                    <div
                                      className={cn(
                                        'mr-3 flex h-5 w-5 items-center justify-center rounded-full border transition-colors',
                                        field.value?.includes(s.value)
                                          ? 'bg-primary border-primary text-primary-foreground'
                                          : 'border-muted-foreground/30'
                                      )}
                                    >
                                      {field.value?.includes(s.value) && <Check className="h-3 w-3" />}
                                    </div>
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
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-300 pb-20">
              {/* Image Upload - Styled like a story uploader */}
              <FormField
                control={form.control}
                name="symptoms.symptomImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="space-y-3">
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
                            'relative h-48 w-full rounded-2xl overflow-hidden transition-all duration-300 border-2 border-dashed flex flex-col items-center justify-center',
                            imageUrl
                              ? 'border-transparent shadow-md'
                              : 'border-muted-foreground/20 bg-muted/20 hover:bg-muted/30 cursor-pointer',
                            !isPremium && !imageUrl && 'opacity-60 grayscale cursor-not-allowed'
                          )}
                          onClick={() => isPremium && fileInputRef.current?.click()}
                        >
                          {isUploading ? (
                            <div className="flex flex-col items-center gap-3">
                              <Loader2 className="h-10 w-10 animate-spin text-primary" />
                              <p className="text-xs font-semibold animate-pulse text-muted-foreground">
                                Compressing & Uploading...
                              </p>
                            </div>
                          ) : imageUrl ? (
                            <>
                              <img src={imageUrl} alt="Symptom" className="h-full w-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                <span className="text-white text-sm font-bold flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                                  <Camera className="h-4 w-4" /> Change
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="text-center p-6 space-y-1">
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                                <Camera className="h-6 w-6 text-primary" />
                              </div>
                              <p className="text-sm font-semibold">{t('add_photo', 'Add Photo')}</p>
                              <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                                {isPremium ? (
                                  t('optional')
                                ) : (
                                  <>
                                    <Crown className="h-3 w-3 text-amber-500" /> Premium Feature
                                  </>
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Severity - Gradient Slider */}
              <FormField
                control={form.control}
                name="symptoms.severity"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-4">
                      <FormLabel className="text-base font-semibold">{t('severity', 'Pain Severity')}</FormLabel>
                      <span
                        className={cn(
                          'text-xl font-black tabular-nums px-3 py-1 rounded-lg border',
                          field.value > 7
                            ? 'bg-red-50 text-red-600 border-red-200'
                            : field.value > 4
                              ? 'bg-amber-50 text-amber-600 border-amber-200'
                              : 'bg-green-50 text-green-600 border-green-200'
                        )}
                      >
                        {field.value}
                      </span>
                    </div>
                    <FormControl>
                      <div className="relative h-12 w-full touch-none">
                        <Slider
                          value={[Number(field.value) || 5]}
                          min={1}
                          max={10}
                          step={1}
                          onValueChange={(v) => field.onChange(v[0])}
                          className="w-full h-full z-10 relative cursor-pointer"
                        />
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-4 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 opacity-30 pointer-events-none" />
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-2 px-1">
                          <span>Mild</span>
                          <span>Moderate</span>
                          <span>Severe</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Duration & Onset Row */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="symptoms.duration"
                  render={({ field }) => {
                    // Parse existing value
                    const parts = (field.value || '').split(' ');
                    const num = parts[0] || '';
                    const unit = parts[1] || 'days';

                    return (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-sm font-semibold">{t('duration')}</FormLabel>
                        <div className="flex rounded-xl shadow-sm border border-border overflow-hidden focus-within:ring-1 focus-within:ring-primary">
                          <Input
                            type="number"
                            placeholder="2"
                            value={num}
                            min="0"
                            onChange={(e) => field.onChange(`${e.target.value} ${unit}`)}
                            className="border-none shadow-none h-12 text-center text-lg font-medium focus-visible:ring-0 rounded-none w-1/2 bg-card"
                          />
                          <div className="w-px bg-border my-2" />
                          <Select value={unit} onValueChange={(v) => field.onChange(`${num || '0'} ${v}`)}>
                            <SelectTrigger className="border-none shadow-none h-12 focus:ring-0 rounded-none w-1/2 bg-muted/5">
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
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-sm font-semibold">{t('onset')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl border-border bg-card">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sudden">
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-amber-500" />
                              <span>{t('sudden')}</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="gradual">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-blue-500" />
                              <span>{t('gradual')}</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Details Cards */}
              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  {t('additional_details', 'Additional Details')}
                </h3>

                <FormField
                  control={form.control}
                  name="symptoms.radiation"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder={t('radiation_placeholder', 'Does the pain move anywhere?')}
                            className="h-12 rounded-xl bg-card"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="symptoms.triggers"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Textarea
                            placeholder={t('triggers_placeholder', 'What makes it worse? (e.g. food, stress)')}
                            className="min-h-[80px] rounded-xl bg-card resize-none py-3"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="symptoms.extras"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder={t(
                            'extras_placeholder',
                            'Any other details? (e.g. Sharp pain, burning sensation)'
                          )}
                          className="min-h-[100px] rounded-xl bg-card p-4"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </div>

        {/* Floating Action Footer */}
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border mt-auto -mx-4 flex items-center gap-3 z-20">
          <Button
            type="button"
            variant="ghost"
            onClick={handlePrev}
            className="h-14 w-14 rounded-full shrink-0 border border-input bg-card hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>

          {currentStep < totalSteps - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1 h-14 rounded-full text-lg font-bold shadow-lg shadow-primary/25"
            >
              {t('next')}
            </Button>
          ) : (
            <Button
              type="submit"
              className="flex-1 h-14 rounded-full text-lg font-bold shadow-lg shadow-primary/25"
              disabled={isLoading || !form.formState.isValid || isUploading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('analyzing')}
                </>
              ) : (
                <>{t('get_diagnosis')}</>
              )}
            </Button>
          )}
        </div>
      </form>
      <MultiStepLoader loadingStates={loadingStates} loading={isLoading} duration={1500} />
    </FormProviderComponent>
  );
});
