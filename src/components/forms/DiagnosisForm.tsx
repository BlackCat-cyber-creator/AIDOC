'use client';

import * as React from 'react';
import type { UseFormReturn, FieldPath, FieldErrors } from 'react-hook-form';
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
import { Loader2, Check, X as XIcon, MapPin, ListChecks, ClipboardList, Camera, Crown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { HumanAnatomy3D } from '@/components/3d/HumanAnatomy3D';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

const sortedSimplifiedSymptomTypes = [
  { value: 'abdominal-pain-discomfort', label: 'Abdominal Pain / Discomfort' },
  { value: 'anxiety-new-worsening', label: 'Anxiety (New or Worsening)' },
  { value: 'bleeding', label: 'Bleeding' },
  { value: 'bruising-unexplained', label: 'Bruising (Unexplained or Excessive)' },
  { value: 'chills', label: 'Chills' },
  { value: 'confusion-disorientation', label: 'Confusion or Disorientation' },
  { value: 'constipation', label: 'Constipation' },
  { value: 'cough', label: 'Cough (Persistent or Severe)' },
  { value: 'depression-new-worsening', label: 'Depression (New or Worsening)' },
  { value: 'diarrhea', label: 'Diarrhea' },
  { value: 'discharge-abnormal', label: 'Discharge (Abnormal)' },
  { value: 'dizziness', label: 'Dizziness' },
  { value: 'ear-pain-or-discharge', label: 'Ear Pain or Discharge' },
  { value: 'eye-pain-or-redness', label: 'Eye Pain or Redness' },
  { value: 'fainting-syncope', label: 'Fainting / Syncope' },
  { value: 'fatigue-extreme', label: 'Fatigue (Extreme or Prolonged)' },
  { value: 'fever', label: 'Fever' },
  { value: 'headache', label: 'Headache' },
  { value: 'hearing-loss-new', label: 'Hearing Loss (New or Sudden)' },
  { value: 'irritability-agitation-unusual', label: 'Irritability or Agitation (Unusual)' },
  { value: 'itching-persistent', label: 'Itching (Persistent or Severe)' },
  { value: 'jaw-pain', label: 'Jaw Pain' },
  { value: 'joint-pain', label: 'Joint Pain' },
  { value: 'lightheadedness', label: 'Lightheadedness' },
  { value: 'lump-mass-new', label: 'Lump or Mass (New)' },
  { value: 'malaise-general-unwellness', label: 'Malaise / General Feeling of Unwellness' },
  { value: 'memory-problems-new', label: 'Memory Problems (New or Worsening)' },
  { value: 'muscle-cramps', label: 'Muscle Cramps' },
  { value: 'nasal-congestion', label: 'Nasal Congestion' },
  { value: 'nausea', label: 'Nausea' },
  { value: 'numbness', label: 'Numbness' },
  { value: 'other-symptom', label: 'Other Symptom (Describe in Extras)' },
  { value: 'pain-ache', label: 'Pain / Ache' },
  { value: 'rash', label: 'Rash' },
  { value: 'runny-nose', label: 'Runny Nose' },
  { value: 'shortness-of-breath', label: 'Shortness of Breath / Difficulty Breathing' },
  { value: 'skin-discoloration-new', label: 'Skin Discoloration (New)' },
  { value: 'skin-lesion-new', label: 'Skin Lesion (New or Changing)' },
  { value: 'sore-throat', label: 'Sore Throat' },
  { value: 'stiff-neck', label: 'Stiff Neck' },
  { value: 'sweats-excessive', label: 'Sweats (Excessive or Night Sweats)' },
  { value: 'swelling-edema', label: 'Swelling / Edema' },
  { value: 'tingling-pins-needles', label: 'Tingling / Pins and Needles' },
  { value: 'tinnitus-ringing-ears', label: 'Tinnitus (Ringing in Ears)' },
  { value: 'urinary-issues', label: 'Urinary Issues (e.g., Pain, Frequency, Blood, Odor)' },
  { value: 'vision-blurred-double', label: 'Vision - Blurred or Double' },
  { value: 'vision-loss-partial-complete', label: 'Vision - Partial or Complete Loss' },
  { value: 'vomiting', label: 'Vomiting' },
  { value: 'weakness-muscle', label: 'Weakness (Muscle)' },
  { value: 'bloating', label: 'Bloating' },
  { value: 'heartburn', label: 'Heartburn' },
  { value: 'back-pain', label: 'Back Pain' },
].sort((a, b) => a.label.localeCompare(b.label));

const regionIds3D = [
  'head',
  'neck',
  'chest',
  'abdomen',
  'pelvis',
  'left-shoulder',
  'right-shoulder',
  'left-arm',
  'right-arm',
  'left-hand',
  'right-hand',
  'left-leg',
  'right-leg',
  'left-foot',
  'right-foot',
  'back',
  'breast',
  'genitals-male',
  'genitals-female',
];

const symptomTypeToLocationMapping: Record<string, string[]> = {
  'abdominal-pain-discomfort': ['abdomen', 'pelvis'],
  'anxiety-new-worsening': [],
  bleeding: regionIds3D,
  'bruising-unexplained': regionIds3D,
  chills: [],
  'confusion-disorientation': ['head'],
  constipation: ['abdomen', 'pelvis'],
  cough: ['chest', 'neck'],
  'depression-new-worsening': [],
  diarrhea: ['abdomen', 'pelvis'],
  'discharge-abnormal': ['breast', 'genitals-male', 'genitals-female'],
  dizziness: ['head'],
  'ear-pain-or-discharge': [],
  'eye-pain-or-redness': [],
  'fainting-syncope': ['head'],
  'fatigue-extreme': [],
  fever: [],
  headache: ['head'],
  'hearing-loss-new': [],
  heartburn: ['abdomen'],
  'irritability-agitation-unusual': [],
  'itching-persistent': regionIds3D,
  'jaw-pain': ['head'],
  'joint-pain': [
    'left-shoulder',
    'right-shoulder',
    'left-arm',
    'right-arm',
    'left-hand',
    'right-hand',
    'left-leg',
    'right-leg',
    'left-foot',
    'right-foot',
  ],
  lightheadedness: ['head'],
  'lump-mass-new': regionIds3D,
  'malaise-general-unwellness': [],
  'memory-problems-new': ['head'],
  'muscle-cramps': [
    'left-arm',
    'right-arm',
    'left-leg',
    'right-leg',
    'left-hand',
    'right-hand',
    'left-foot',
    'right-foot',
  ],
  'nasal-congestion': ['head'],
  nausea: ['abdomen'],
  numbness: regionIds3D,
  'other-symptom': regionIds3D,
  'pain-ache': regionIds3D,
  rash: regionIds3D,
  'runny-nose': ['head'],
  'shortness-of-breath': ['chest', 'neck'],
  'skin-discoloration-new': regionIds3D,
  'skin-lesion-new': regionIds3D,
  'sore-throat': ['neck', 'head'],
  'stiff-neck': ['neck'],
  'sweats-excessive': [],
  'swelling-edema': regionIds3D,
  'tingling-pins-needles': regionIds3D,
  'tinnitus-ringing-ears': [],
  'urinary-issues': ['abdomen', 'pelvis', 'genitals-male', 'genitals-female'],
  'vision-blurred-double': [],
  'vision-loss-partial-complete': [],
  vomiting: ['abdomen'],
  'weakness-muscle': regionIds3D,
  bloating: [],
  'back-pain': ['back'],
};

interface DiagnosisFormProps {
  form: UseFormReturn<FormValues>;
  onSubmit: (values: FormValues) => void;
  isLoading: boolean;
  currentStep: number;
  setCurrentStep: (step: number | ((prevStep: number) => number)) => void;
  totalSteps: number;
  patientProfile: PatientProfile;
}

const stepTitles = ['Symptom Location(s)', 'Symptom Type(s)', 'Symptom Details'];

const stepIcons: Record<number, React.ElementType> = {
  0: MapPin,
  1: ListChecks,
  2: ClipboardList,
};

export const DiagnosisForm = React.memo(function DiagnosisForm({
  form,
  onSubmit,
  isLoading,
  currentStep,
  setCurrentStep,
  totalSteps,
  patientProfile,
}: DiagnosisFormProps) {
  const [user] = useAuthState(auth);
  const [isPremium, setIsPremium] = React.useState(false);
  const [symptomTypePopoverOpen, setSymptomTypePopoverOpen] = React.useState(false);

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

  const filteredSymptomTypesForDropdown = React.useMemo(() => {
    if (!selectedLocations || selectedLocations.length === 0) {
      return sortedSimplifiedSymptomTypes;
    }
    const displayableSymptomTypeValues = new Set<string>();
    sortedSimplifiedSymptomTypes.forEach((st) => {
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
    return sortedSimplifiedSymptomTypes.filter((st) => displayableSymptomTypeValues.has(st.value));
  }, [selectedLocations]);

  const handleNext = async () => {
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
    const isValid = await form.trigger(fieldsForStep[currentStep]);
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

  return (
    <FormProviderComponent {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 md:space-y-12 animate-fade-in max-w-2xl mx-auto px-2 md:px-0"
      >
        <div className="mb-6 rounded-md border bg-muted/30 p-3 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Step {currentStep + 1} of {totalSteps}:{' '}
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
                      Location(s) <span className="text-destructive">*</span>
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
                                <FormLabel>Skin (General)</FormLabel>
                                <FormDescription>Symptoms affecting the skin broadly.</FormDescription>
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
                      Type of Symptoms <span className="text-destructive">*</span>
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
                                  {sortedSimplifiedSymptomTypes.find((s) => s.value === val)?.label || val}
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
                                {selectedLocations.length ? 'Select symptom types...' : 'Select location(s) first'}
                              </span>
                            )}
                          </div>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Search symptom types..." />
                          <ScrollArea className="h-[200px]">
                            <CommandList>
                              <CommandEmpty>No results found.</CommandEmpty>
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
                      Upload Photo of Symptom (Optional)
                      <Crown className={cn('h-3 w-3', isPremium ? 'text-yellow-500' : 'text-muted-foreground')} />
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <div className="flex gap-4 items-center">
                          <div className="h-32 w-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-muted/30 overflow-hidden">
                            {imageUrl ? (
                              <img src={imageUrl} alt="Symptom" className="h-full w-full object-contain" />
                            ) : (
                              <div className="text-center p-4">
                                <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground font-medium">
                                  Premium users can add a photo for better AI analysis.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <Input
                          placeholder="Paste image URL here (e.g., from a cloud drive)"
                          {...field}
                          disabled={!isPremium}
                          className="w-full"
                        />
                      </div>
                    </FormControl>
                    {!isPremium && (
                      <FormDescription>
                        PRO members can include photos of rashes, swelling, etc., for more accurate AI detection.
                      </FormDescription>
                    )}
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
                      Severity (1-10) <span className="text-destructive">*</span>
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
                  const [num, unit] = (field.value || '2 days').split(' ');
                  return (
                    <FormItem>
                      <FormLabel>
                        Duration <span className="text-destructive">*</span>
                      </FormLabel>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={num}
                          onChange={(e) => field.onChange(`${e.target.value} ${unit || 'days'}`)}
                          className="flex-grow"
                        />
                        <Select value={unit || 'days'} onValueChange={(v) => field.onChange(`${num || '0'} ${v}`)}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="days">Day(s)</SelectItem>
                            <SelectItem value="weeks">Week(s)</SelectItem>
                            <SelectItem value="months">Month(s)</SelectItem>
                            <SelectItem value="years">Year(s)</SelectItem>
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
                      Onset <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select onset" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sudden">Sudden</SelectItem>
                        <SelectItem value="gradual">Gradual</SelectItem>
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
                    <FormLabel>Radiation (if any)</FormLabel>
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
                    <FormLabel>Triggers (Optional)</FormLabel>
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
                    <FormLabel>Extra Information (Optional)</FormLabel>
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
                Previous
              </Button>
            )}
          </div>
          {currentStep < totalSteps - 1 ? (
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isLoading || !form.formState.isValid}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Getting Diagnosis...
                </>
              ) : (
                'Get Diagnosis'
              )}
            </Button>
          )}
        </div>
      </form>
    </FormProviderComponent>
  );
});
