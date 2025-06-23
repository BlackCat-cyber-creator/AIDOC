'use client';

import * as React from 'react';
import type { UseFormReturn, FieldPath, FieldErrors } from 'react-hook-form';
import {
  Form as FormProviderComponent, // Renamed for clarity
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
import type { FormValues } from '@/lib/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Check, X as XIcon, IdCard, MapPin, ListChecks, ClipboardList } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { HumanAnatomy3D } from '@/components/3d/HumanAnatomy3D';
import { AppIcon3D } from '@/components/3d/AppIcon3D';
import { Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { AnimationMixer } from 'three';
import Image from 'next/image';

// --- SVG Icons for Age ---
const InfantFaceIcon = () => (
  <Image
    src="/images/age_icons/infant.webp"
    alt="Infant Face Icon"
    width={80}
    height={80}
    className="object-contain transition-opacity duration-300"
  />
);
const ToddlerFaceIcon = () => (
  <Image
    src="/images/age_icons/toddler.webp"
    alt="Toddler Face Icon"
    width={80}
    height={80}
    className="object-contain transition-opacity duration-300"
  />
);
const PreschoolFaceIcon = () => (
  <Image
    src="/images/age_icons/preschooler.webp"
    alt="Preschooler Face Icon"
    width={80}
    height={80}
    className="object-contain transition-opacity duration-300"
  />
);
const SchoolAgeFaceIcon = () => (
  <Image
    src="/images/age_icons/schoolage.webp"
    alt="School Age Face Icon"
    width={80}
    height={80}
    className="object-contain transition-opacity duration-300"
  />
);
const AdolescentFaceIcon = () => (
  <Image
    src="/images/age_icons/adolescent.webp"
    alt="Adolescent Face Icon"
    width={80}
    height={80}
    className="object-contain transition-opacity duration-300"
  />
);
const YoungAdultFaceIcon = () => (
  <Image
    src="/images/age_icons/youngadult.webp"
    alt="Young Adult Face Icon"
    width={80}
    height={80}
    className="object-contain transition-opacity duration-300"
  />
);
const MiddleAgeAdultFaceIcon = () => (
  <Image
    src="/images/age_icons/middleageadult.webp"
    alt="Middle Age Adult Face Icon"
    width={80}
    height={80}
    className="object-contain transition-opacity duration-300"
  />
);
const OlderAdultFaceIcon = () => (
  <Image
    src="/images/age_icons/olderadult.webp"
    alt="Older Adult Face Icon"
    width={80}
    height={80}
    className="object-contain transition-opacity duration-300"
  />
);

const getAgeIconAndLabel = (
  ageInput: number | string | undefined
): { IconComponent: React.FC<object>; label: string } => {
  const numericAge =
    typeof ageInput === 'string' ? parseInt(ageInput, 10) : typeof ageInput === 'number' ? ageInput : 0;

  let IconComponent: React.FC<object>;
  if (numericAge === 0) IconComponent = InfantFaceIcon;
  else if (numericAge >= 1 && numericAge <= 3) IconComponent = ToddlerFaceIcon;
  else if (numericAge >= 4 && numericAge <= 5) IconComponent = PreschoolFaceIcon;
  else if (numericAge >= 6 && numericAge <= 12) IconComponent = SchoolAgeFaceIcon;
  else if (numericAge >= 13 && numericAge <= 18) IconComponent = AdolescentFaceIcon;
  else if (numericAge >= 19 && numericAge <= 40) IconComponent = YoungAdultFaceIcon;
  else if (numericAge >= 41 && numericAge <= 64) IconComponent = MiddleAgeAdultFaceIcon;
  else if (numericAge >= 65) IconComponent = OlderAdultFaceIcon;
  else IconComponent = YoungAdultFaceIcon;

  let labelText = `${numericAge}`;
  if (numericAge >= 65) {
    labelText = '65+';
  }
  return { IconComponent, label: `Selected Age: ${labelText}` };
};

const MaleSexIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-primary group-aria-checked:text-primary"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <circle cx="10" cy="14" r="5" className="group-aria-checked:fill-primary/20" />
    <line x1="10" y1="4" x2="10" y2="9" />
    <line x1="13" y1="7" x2="7" y2="7" />
  </svg>
);
const FemaleSexIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-primary group-aria-checked:text-primary"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <circle cx="12" cy="9" r="5" className="group-aria-checked:fill-primary/20" />
    <line x1="12" y1="14" x2="12" y2="21" />
    <line x1="9" y1="18" x2="15" y2="18" />
  </svg>
);
const OtherSexIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-primary group-aria-checked:text-primary"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <circle cx="12" cy="12" r="4" className="group-aria-checked:fill-primary/20" />
    <path d="M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0 -18" strokeDasharray="3 3" />
  </svg>
);

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

const commonChronicConditions = [
  'Type 2 Diabetes',
  'Hypertension',
  'Asthma',
  'Coronary Artery Disease',
  'Chronic Kidney Disease',
  'Rheumatoid Arthritis',
  "Crohn's Disease",
  'Ulcerative Colitis',
  'Hypothyroidism',
  'Migraine',
  'Osteoarthritis',
  'Depression',
  'Anxiety Disorder',
  'Fibromyalgia',
  'Gastroesophageal Reflux Disease (GERD)',
  'Irritable Bowel Syndrome (IBS)',
  'Chronic Obstructive Pulmonary Disease (COPD)',
  'Psoriasis',
  'Epilepsy',
  'Multiple Sclerosis',
  "Parkinson's Disease",
  "Alzheimer's Disease",
  'Obesity',
  'Sleep Apnea',
  'Polycystic Ovary Syndrome (PCOS)',
  'Endometriosis',
  'Celiac Disease',
  'Lupus',
  "Sjögren's Syndrome",
  'Anemia',
].sort();

const commonMedications = [
  'Lisinopril',
  'Metformin',
  'Atorvastatin',
  'Levothyroxine',
  'Amlodipine',
  'Omeprazole',
  'Albuterol',
  'Hydrochlorothiazide',
  'Gabapentin',
  'Sertraline',
  'Losartan',
  'Ventolin',
  'Propranolol',
  'Metoprolol',
  'Warfarin',
  'Aspirin',
  'Ibuprofen',
  'Acetaminophen',
  'Amoxicillin',
  'Azithromycin',
  'Prednisone',
  'Insulin Glargine',
  'Insulin Lispro',
  'Duloxetine',
  'Escitalopram',
  'Furosemide',
  'Simvastatin',
  'Tramadol',
  'Vitamin D',
  'Folic Acid',
  'Calcium Carbonate',
].sort();

const commonAllergies = [
  'Penicillin',
  'Amoxicillin',
  'Sulfa Drugs',
  'Codeine',
  'Morphine',
  'Aspirin',
  'Ibuprofen',
  'Latex',
  'Peanuts',
  'Tree Nuts',
  'Shellfish',
  'Dairy',
  'Eggs',
  'Soy',
  'Wheat',
  'Gluten',
  'Dust Mites',
  'Pollen',
  'Animal Dander',
  'Insect Stings (Bee, Wasp)',
  'Nickel',
  'Fragrances',
  'Dyes',
  'Local Anesthetics (e.g., Lidocaine)',
  'Contrast Dye',
  'Iodine',
  'Flu Shot',
].sort();

const nonAnatomyLocationOptions: { value: string; label: string }[] = [];

interface DiagnosisFormProps {
  form: UseFormReturn<FormValues>;
  onSubmit: (values: FormValues) => void;
  isLoading: boolean;
  currentStep: number;
  setCurrentStep: (step: number | ((prevStep: number) => number)) => void;
  totalSteps: number;
}

const stepTitles = ['Patient Profile', 'Symptom Location(s)', 'Symptom Type(s)', 'Symptom Details'];

const stepIcons: Record<number, React.ElementType> = {
  0: IdCard,
  1: MapPin,
  2: ListChecks,
  3: ClipboardList,
};

// Add types for SexIcon3D props
interface SexIcon3DProps {
  modelPath: string;
  scale?: number;
  className?: string;
  animate?: boolean;
  position?: [number, number, number];
}

function SexIcon3D({
  modelPath,
  scale = 1.3,
  className = 'w-36 h-36',
  animate = false,
  position = [0, 0, 0],
}: SexIcon3DProps) {
  function Model() {
    const { scene, animations }: any = useGLTF(modelPath);
    const mixer = React.useRef<AnimationMixer | null>(null);
    React.useEffect(() => {
      if (animate && animations && animations.length > 0 && scene) {
        mixer.current = new AnimationMixer(scene);
        animations.forEach((clip: any) => {
          mixer.current?.clipAction(clip).play();
        });
      }
      return () => {
        if (mixer.current) {
          mixer.current.stopAllAction();
        }
      };
    }, [animate, animations, scene]);
    useFrame((state, delta) => {
      if (mixer.current && animate) {
        mixer.current.update(delta);
      }
    });
    return <primitive object={scene} />;
  }
  return (
    <div className={className + ' flex items-center justify-center'}>
      <Canvas camera={{ fov: 55, position: [0, 2, 3] }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[0, 0, 5]} intensity={1} />
        <Suspense fallback={null}>
          <group scale={scale} position={position}>
            <Model />
          </group>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 5} // Allow rotation down to 45 degrees from top pole
            maxPolarAngle={(3 * Math.PI) / 5} // Allow rotation up to 45 degrees from bottom pole
            target={[0, 0.8, 0]} // Ensure the camera targets the model correctly
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

export function DiagnosisForm({
  form,
  onSubmit,
  isLoading,
  currentStep,
  setCurrentStep,
  totalSteps,
}: DiagnosisFormProps) {
  const [symptomTypePopoverOpen, setSymptomTypePopoverOpen] = React.useState(false);

  const selectedSex = form.watch('profile.sex');
  const selectedLocations = form.watch('symptoms.location') || [];
  const currentAge = form.watch('profile.age');

  const { IconComponent: AgeIconToRender, label: ageLabel } = getAgeIconAndLabel(currentAge);

  const formErrors: FieldErrors<FormValues> = form.formState.errors;

  React.useEffect(() => {
    const currentLocs = form.getValues('symptoms.location');
    if (!Array.isArray(currentLocs) || !selectedSex || selectedSex === 'other') return;

    let changed = false;
    const newLocations = currentLocs.filter((locId) => {
      const partDefinition = anatomyParts.find((p) => p.id === locId);
      if (partDefinition?.sex && partDefinition.sex !== selectedSex) {
        changed = true;
        return false;
      }
      return true;
    });

    if (changed || newLocations.length !== currentLocs.length) {
      form.setValue('symptoms.location', newLocations, { shouldValidate: true });
    }
  }, [selectedSex, form]);

  const filteredSymptomTypesForDropdown = React.useMemo(() => {
    if (!selectedLocations || selectedLocations.length === 0) {
      return sortedSimplifiedSymptomTypes;
    }
    const displayableSymptomTypeValues = new Set<string>();
    sortedSimplifiedSymptomTypes.forEach((st) => {
      const allowedRegions = symptomTypeToLocationMapping[st.value] || [];
      if (allowedRegions.length === 0) {
        // Show if not region-specific
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

  React.useEffect(() => {
    const currentSelectedTypes = form.getValues('symptoms.type') || [];
    if (
      filteredSymptomTypesForDropdown.length === 0 &&
      selectedLocations.length > 0 &&
      currentSelectedTypes.length > 0 &&
      !selectedLocations.some((sl) => nonAnatomyLocationOptions.map((o) => o.value).includes(sl))
    ) {
      form.setValue('symptoms.type', [], { shouldValidate: true });
    } else if (currentSelectedTypes.length > 0) {
      const validFilteredValues = new Set(filteredSymptomTypesForDropdown.map((st) => st.value));
      const newSelectedTypes = currentSelectedTypes.filter((typeValue) => validFilteredValues.has(typeValue));

      if (newSelectedTypes.length !== currentSelectedTypes.length) {
        form.setValue('symptoms.type', newSelectedTypes, { shouldValidate: true });
      }
    }
  }, [filteredSymptomTypesForDropdown, form, selectedLocations]);

  const sexOptions = [
    {
      value: 'male',
      label: 'Male',
      Icon: () => null, // will be handled in render
    },
    {
      value: 'female',
      label: 'Female',
      Icon: () => null, // will be handled in render
    },
    {
      value: 'other',
      label: 'Other / Prefer not to say',
      Icon: OtherSexIcon, // fallback to SVG for 'other'
    },
  ];

  const fieldsForStep: FieldPath<FormValues>[][] = [
    ['profile.age', 'profile.sex'],
    ['symptoms.location'],
    ['symptoms.type'],
    ['symptoms.severity', 'symptoms.duration', 'symptoms.onset'],
  ];

  const handleNext = async () => {
    const fieldsToValidate = fieldsForStep[currentStep];
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
    } else {
      const firstErrorField = fieldsToValidate.find((field) => {
        const fieldState = form.getFieldState(field);
        return fieldState.error?.message;
      });

      if (firstErrorField) {
        const element = document.getElementsByName(firstErrorField)[0];
        element?.focus({ preventScroll: true });
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
  };

  return (
    <FormProviderComponent {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 md:space-y-12 animate-fade-in max-w-2xl mx-auto px-2 md:px-0"
        aria-label="Patient diagnosis form"
      >
        <div className="mb-6 rounded-md border bg-muted/30 p-3 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Step {currentStep + 1} of {totalSteps}:{' '}
            <span className="font-semibold text-primary">{stepTitles[currentStep]}</span>
          </p>
          <Progress value={((currentStep + 1) / totalSteps) * 100} className="mt-2 h-2 w-full" />

          {/* Enhanced Step Indicator */}
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
                {React.createElement(stepIcons[0] || IdCard, { className: 'h-6 w-6 text-primary/80' })}
                {stepTitles[0]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="profile.age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Age <span className="text-destructive">*</span>
                    </FormLabel>
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex w-1/4 flex-shrink-0 items-center justify-center">
                        <AgeIconToRender />
                      </div>
                      <div className="flex-1 space-y-2">
                        <FormControl>
                          <Slider
                            value={[Number(field.value) || 0]}
                            min={0}
                            max={80}
                            step={1}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                            aria-label="Age slider"
                            valueLabel={ageLabel.replace('Selected Age: ', '')}
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
                name="profile.sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Sex <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-3">
                        {sexOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={field.value === option.value}
                            onClick={() => field.onChange(option.value as 'male' | 'female' | 'other')}
                            className={cn(
                              'group flex-1 p-6 border rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-150 ease-in-out',
                              'hover:shadow-lg hover:border-primary/70 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                              field.value === option.value
                                ? 'border-primary ring-2 ring-primary ring-offset-2 bg-primary/10 shadow-xl'
                                : 'border-input bg-card hover:bg-muted/50'
                            )}
                            aria-label={option.label}
                            style={{ minHeight: '220px' }}
                          >
                            {option.value === 'male' || option.value === 'female' ? (
                              <SexIcon3D
                                modelPath={
                                  option.value === 'male' ? '/models/male_walking.glb' : '/models/female_walking.glb'
                                }
                                scale={option.value === 'male' ? 1.4 : 1.3}
                                className="w-36 h-36"
                                animate={field.value === option.value}
                                position={option.value === 'female' ? [0, -0.4, 0] : [0, -0.4, 0]}
                              />
                            ) : (
                              <option.Icon />
                            )}
                            <span
                              className={cn(
                                'text-base text-center font-medium',
                                field.value === option.value ? 'text-primary' : 'text-foreground/80'
                              )}
                            >
                              {option.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="profile.chronic_conditions"
                render={({ field }) => {
                  const hasError = formErrors.profile?.chronic_conditions && formErrors.profile?.chronic_conditions;
                  const isValid = !hasError && formErrors.profile?.chronic_conditions;
                  const [popoverOpen, setPopoverOpen] = React.useState(false);
                  const [inputValue, setInputValue] = React.useState(
                    Array.isArray(field.value)
                      ? field.value.join('\n')
                      : typeof field.value === 'string'
                        ? field.value
                        : ''
                  );

                  const filteredSuggestions = commonChronicConditions.filter(
                    (condition) =>
                      condition.toLowerCase().includes(inputValue.split('\n').pop()?.toLowerCase() || '') &&
                      !(Array.isArray(field.value) ? field.value : []).some(
                        (existing) => existing.toLowerCase() === condition.toLowerCase()
                      )
                  );

                  React.useEffect(() => {
                    const currentFieldValue = Array.isArray(field.value)
                      ? field.value.join('\n')
                      : typeof field.value === 'string'
                        ? field.value
                        : '';
                    if (currentFieldValue !== inputValue) {
                      setInputValue(currentFieldValue);
                    }
                  }, [field.value]);

                  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setInputValue(e.target.value);
                    const value = e.target.value;
                    field.onChange(value); // Pass the string value directly
                    setPopoverOpen(true); // Open popover on input change
                  };

                  const handleSelectSuggestion = (suggestion: string) => {
                    const lines = inputValue.split('\n');
                    lines[lines.length - 1] = suggestion; // Replace last line with suggestion
                    const newValue = lines.join('\n');
                    setInputValue(newValue);
                    field.onChange(newValue); // Pass the new string value directly
                    setPopoverOpen(false);
                  };

                  return (
                    <FormItem>
                      <FormLabel>Chronic Conditions (Optional)</FormLabel>
                      <FormControl>
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                          <PopoverTrigger asChild>
                            <div className="relative">
                              <Textarea
                                placeholder="e.g., Type 2 Diabetes,&#x0a;Hypertension (one per line)"
                                value={inputValue}
                                onChange={handleInputChange}
                                className={cn(
                                  hasError && 'border-destructive focus-visible:ring-destructive',
                                  isValid && 'border-primary focus-visible:ring-primary'
                                )}
                              />
                              {hasError && <XIcon className="absolute right-3 top-3 h-4 w-4 text-destructive" />}
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput
                                placeholder="Search conditions..."
                                className="h-9"
                                value={inputValue.split('\n').pop() || ''}
                                onValueChange={(value) => {
                                  const lines = inputValue.split('\n');
                                  lines[lines.length - 1] = value;
                                  const newValue = lines.join('\n');
                                  setInputValue(newValue);
                                  field.onChange(newValue); // Pass the new string value directly
                                }}
                              />
                              <ScrollArea className="h-[200px]">
                                <CommandList>
                                  <CommandEmpty>No condition found.</CommandEmpty>
                                  <CommandGroup>
                                    {filteredSuggestions.map((condition) => (
                                      <CommandItem
                                        key={condition}
                                        value={condition}
                                        onSelect={() => handleSelectSuggestion(condition)}
                                      >
                                        {condition}
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
              <FormField
                control={form.control}
                name="profile.medications"
                render={({ field }) => {
                  const hasError = formErrors.profile?.medications && formErrors.profile?.medications;
                  const isValid = !hasError && formErrors.profile?.medications;
                  const [popoverOpen, setPopoverOpen] = React.useState(false);
                  const [inputValue, setInputValue] = React.useState(
                    Array.isArray(field.value)
                      ? field.value.join('\n')
                      : typeof field.value === 'string'
                        ? field.value
                        : ''
                  );

                  const filteredSuggestions = commonMedications.filter(
                    (medication) =>
                      medication.toLowerCase().includes(inputValue.split('\n').pop()?.toLowerCase() || '') &&
                      !(Array.isArray(field.value) ? field.value : []).some(
                        (existing) => existing.toLowerCase() === medication.toLowerCase()
                      )
                  );

                  React.useEffect(() => {
                    const currentFieldValue = Array.isArray(field.value)
                      ? field.value.join('\n')
                      : typeof field.value === 'string'
                        ? field.value
                        : '';
                    if (currentFieldValue !== inputValue) {
                      setInputValue(currentFieldValue);
                    }
                  }, [field.value]);

                  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setInputValue(e.target.value);
                    const value = e.target.value;
                    field.onChange(value); // Pass the string value directly
                    setPopoverOpen(true); // Open popover on input change
                  };

                  const handleSelectSuggestion = (suggestion: string) => {
                    const lines = inputValue.split('\n');
                    lines[lines.length - 1] = suggestion; // Replace last line with suggestion
                    const newValue = lines.join('\n');
                    setInputValue(newValue);
                    field.onChange(newValue); // Pass the new string value directly
                    setPopoverOpen(false);
                  };

                  return (
                    <FormItem>
                      <FormLabel>Medications (Optional)</FormLabel>
                      <FormControl>
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                          <PopoverTrigger asChild>
                            <div className="relative">
                              <Textarea
                                placeholder="e.g., Metformin, Lisinopril, Ibuprofen (one per line)"
                                value={inputValue}
                                onChange={handleInputChange}
                                className={cn(
                                  hasError && 'border-destructive focus-visible:ring-destructive',
                                  isValid && 'border-primary focus-visible:ring-primary'
                                )}
                              />
                              {hasError && <XIcon className="absolute right-3 top-3 h-4 w-4 text-destructive" />}
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput
                                placeholder="Search medications..."
                                className="h-9"
                                value={inputValue.split('\n').pop() || ''}
                                onValueChange={(value) => {
                                  const lines = inputValue.split('\n');
                                  lines[lines.length - 1] = value;
                                  const newValue = lines.join('\n');
                                  setInputValue(newValue);
                                  field.onChange(newValue); // Pass the new string value directly
                                }}
                              />
                              <ScrollArea className="h-[200px]">
                                <CommandList>
                                  <CommandEmpty>No medication found.</CommandEmpty>
                                  <CommandGroup>
                                    {filteredSuggestions.map((medication) => (
                                      <CommandItem
                                        key={medication}
                                        value={medication}
                                        onSelect={() => handleSelectSuggestion(medication)}
                                      >
                                        {medication}
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
              <FormField
                control={form.control}
                name="profile.allergies"
                render={({ field }) => {
                  const hasError = formErrors.profile?.allergies && formErrors.profile?.allergies;
                  const isValid = !hasError && formErrors.profile?.allergies;
                  const [popoverOpen, setPopoverOpen] = React.useState(false);
                  const [inputValue, setInputValue] = React.useState(
                    Array.isArray(field.value)
                      ? field.value.join('\n')
                      : typeof field.value === 'string'
                        ? field.value
                        : ''
                  );

                  const filteredSuggestions = commonAllergies.filter(
                    (allergy) =>
                      allergy.toLowerCase().includes(inputValue.split('\n').pop()?.toLowerCase() || '') &&
                      !(Array.isArray(field.value) ? field.value : []).some(
                        (existing) => existing.toLowerCase() === allergy.toLowerCase()
                      )
                  );

                  React.useEffect(() => {
                    const currentFieldValue = Array.isArray(field.value)
                      ? field.value.join('\n')
                      : typeof field.value === 'string'
                        ? field.value
                        : '';
                    if (currentFieldValue !== inputValue) {
                      setInputValue(currentFieldValue);
                    }
                  }, [field.value]);

                  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setInputValue(e.target.value);
                    const value = e.target.value;
                    field.onChange(value); // Pass the string value directly
                    setPopoverOpen(true); // Open popover on input change
                  };

                  const handleSelectSuggestion = (suggestion: string) => {
                    const lines = inputValue.split('\n');
                    lines[lines.length - 1] = suggestion; // Replace last line with suggestion
                    const newValue = lines.join('\n');
                    setInputValue(newValue);
                    field.onChange(newValue); // Pass the new string value directly
                    setPopoverOpen(false);
                  };

                  return (
                    <FormItem>
                      <FormLabel>Allergies (Optional)</FormLabel>
                      <FormControl>
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                          <PopoverTrigger asChild>
                            <div className="relative">
                              <Textarea
                                placeholder="e.g., Penicillin, Peanuts, Bee stings (one per line)"
                                value={inputValue}
                                onChange={handleInputChange}
                                className={cn(
                                  hasError && 'border-destructive focus-visible:ring-destructive',
                                  isValid && 'border-primary focus-visible:ring-primary'
                                )}
                              />
                              {hasError && <XIcon className="absolute right-3 top-3 h-4 w-4 text-destructive" />}
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput
                                placeholder="Search allergies..."
                                className="h-9"
                                value={inputValue.split('\n').pop() || ''}
                                onValueChange={(value) => {
                                  const lines = inputValue.split('\n');
                                  lines[lines.length - 1] = value;
                                  const newValue = lines.join('\n');
                                  setInputValue(newValue);
                                  field.onChange(newValue); // Pass the new string value directly
                                }}
                              />
                              <ScrollArea className="h-[200px]">
                                <CommandList>
                                  <CommandEmpty>No allergy found.</CommandEmpty>
                                  <CommandGroup>
                                    {filteredSuggestions.map((allergy) => (
                                      <CommandItem
                                        key={allergy}
                                        value={allergy}
                                        onSelect={() => handleSelectSuggestion(allergy)}
                                      >
                                        {allergy}
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
            </CardContent>
          </Card>
        )}

        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                {React.createElement(stepIcons[1] || MapPin, { className: 'h-6 w-6 text-primary/80' })}
                {stepTitles[1]}
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
                      <div className={cn(!selectedSex && 'opacity-50')}>
                        <HumanAnatomy3D
                          selectedLocations={field.value || []}
                          onLocationToggle={(locationValue) => {
                            const currentValues = field.value || [];
                            const newValues = currentValues.includes(locationValue)
                              ? currentValues.filter((v) => v !== locationValue)
                              : [...currentValues, locationValue];
                            field.onChange(newValues);
                          }}
                          selectedSex={selectedSex}
                          disabled={!selectedSex}
                        />
                        {/* Checkbox for Skin (General) */}
                        <FormField
                          control={form.control}
                          name="symptoms.location"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md shadow-sm">
                              <FormControl>
                                <Checkbox
                                  checked={(field.value || []).includes('skin-general')}
                                  onCheckedChange={(checked) => {
                                    const currentValues = field.value || [];
                                    const newValues = checked
                                      ? [...currentValues, 'skin-general']
                                      : currentValues.filter((v) => v !== 'skin-general');
                                    field.onChange(newValues);
                                  }}
                                  aria-label="Select Skin (General) as a location"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Skin (General)</FormLabel>
                                <FormDescription>
                                  Select for symptoms affecting the skin broadly, not a specific anatomical region.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        {!selectedSex && (
                          <p className="mt-2 text-sm text-center text-muted-foreground">
                            Please select a sex in the "Patient Profile" step to enable body part selection.
                          </p>
                        )}
                      </div>
                    </FormControl>
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
                {React.createElement(stepIcons[2] || ListChecks, { className: 'h-6 w-6 text-primary/80' })}
                {stepTitles[2]}
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
                            role="combobox"
                            aria-expanded={symptomTypePopoverOpen}
                            aria-controls="symptom-type-list"
                            tabIndex={selectedLocations.length === 0 ? -1 : 0}
                            className={cn(
                              'flex flex-wrap w-full items-center gap-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[2.5rem] cursor-pointer',
                              selectedLocations.length === 0 && 'cursor-not-allowed opacity-50'
                            )}
                          >
                            {field.value && field.value.length > 0 ? (
                              field.value.map((value) => {
                                const symptom = sortedSimplifiedSymptomTypes.find((s) => s.value === value);
                                return (
                                  <Badge
                                    variant="secondary"
                                    key={value}
                                    className="flex items-center gap-1"
                                    onClick={(e) => e.stopPropagation()} // Prevent popover from closing when clicking badge itself
                                  >
                                    {symptom ? symptom.label : value}
                                    <button
                                      type="button"
                                      aria-label={`Remove ${symptom ? symptom.label : value}`}
                                      className="rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-1"
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevent popover from toggling
                                        field.onChange(field.value?.filter((v) => v !== value));
                                      }}
                                    >
                                      <XIcon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </button>
                                  </Badge>
                                );
                              })
                            ) : (
                              <span className="text-muted-foreground">
                                {selectedLocations.length > 0 ? 'Select symptom types...' : 'Select location(s) first'}
                              </span>
                            )}
                          </div>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Search symptom types..." />
                          <ScrollArea className="h-[200px]">
                            <CommandList id="symptom-type-list">
                              <CommandEmpty>
                                {selectedLocations.length === 0
                                  ? 'Please select a location first.'
                                  : 'No symptom type found for selected location(s).'}
                              </CommandEmpty>
                              <CommandGroup>
                                {filteredSymptomTypesForDropdown.map((symptom) => {
                                  const isSelected = field.value?.includes(symptom.value);
                                  return (
                                    <CommandItem
                                      key={symptom.value}
                                      value={symptom.label}
                                      onSelect={() => {
                                        const currentValues = field.value || [];
                                        if (isSelected) {
                                          field.onChange(currentValues.filter((v) => v !== symptom.value));
                                        } else {
                                          field.onChange([...currentValues, symptom.value]);
                                        }
                                        // Keep popover open for multiple selections
                                        // setSymptomTypePopoverOpen(true);
                                      }}
                                    >
                                      <Check className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')} />
                                      {symptom.label}
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </ScrollArea>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {selectedLocations.length === 0 && (
                      <FormDescription className="mt-2">
                        Please select symptom location(s) first to enable symptom type selection.
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                {React.createElement(stepIcons[3] || ClipboardList, { className: 'h-6 w-6 text-primary/80' })}
                {stepTitles[3]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                          onValueChange={(value) => field.onChange(value[0])}
                          className="w-[85%]"
                          aria-label="Severity slider"
                        />
                        <span className="w-[10%] text-right text-sm tabular-nums">{Number(field.value) || 5}</span>
                      </div>
                    </FormControl>
                    <FormDescription>1-3: Mild, 4-7: Moderate, 8-10: Severe</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="symptoms.duration"
                render={({ field }) => {
                  const hasError = formErrors.symptoms?.duration && formErrors.symptoms?.duration;
                  const isValid = !hasError && formErrors.symptoms?.duration;
                  const [durationValue, setDurationValue] = React.useState<{ number: string; unit: string }>({
                    number: '',
                    unit: 'days',
                  });

                  React.useEffect(() => {
                    if (field.value) {
                      const parts = field.value.match(/^(\d+)\s*(day|week|month|year)s?$/i);
                      if (parts) {
                        setDurationValue({
                          number: parts[1],
                          unit: parts[2].toLowerCase() + (parts[2].toLowerCase().endsWith('s') ? '' : 's'),
                        });
                      } else {
                        // If the existing value doesn't match the new format, reset to empty number and default unit
                        setDurationValue({ number: '', unit: 'days' });
                      }
                    }
                  }, [field.value]);

                  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const newNumber = e.target.value;
                    setDurationValue((prev) => ({ ...prev, number: newNumber }));
                    if (newNumber && durationValue.unit) {
                      field.onChange(`${newNumber} ${durationValue.unit}`);
                    } else {
                      field.onChange('');
                    }
                  };

                  const handleUnitChange = (newUnit: string) => {
                    setDurationValue((prev) => ({ ...prev, unit: newUnit }));
                    if (durationValue.number && newUnit) {
                      field.onChange(`${durationValue.number} ${newUnit}`);
                    } else {
                      field.onChange('');
                    }
                  };

                  return (
                    <FormItem>
                      <FormLabel>
                        Duration <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative flex items-center space-x-2">
                          <Input
                            type="number"
                            placeholder="e.g., 2"
                            value={durationValue.number}
                            onChange={handleNumberChange}
                            min={1} // Ensures the input cannot go below 1
                            max={66} // Ensures the input cannot go above 66
                            className={cn(
                              'flex-grow',
                              hasError && 'border-destructive focus-visible:ring-destructive',
                              isValid && 'border-primary focus-visible:ring-primary'
                            )}
                          />
                          <Select onValueChange={handleUnitChange} value={durationValue.unit}>
                            <SelectTrigger
                              className={cn(
                                'w-[120px]',
                                hasError && 'border-destructive focus-visible:ring-destructive',
                                isValid && 'border-primary focus-visible:ring-primary'
                              )}
                            >
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="days">Day(s)</SelectItem>
                              <SelectItem value="weeks">Week(s)</SelectItem>
                              <SelectItem value="months">Month(s)</SelectItem>
                              <SelectItem value="years">Year(s)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </FormControl>
                      {hasError && (
                        <XIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                      )}
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger
                          aria-haspopup="listbox"
                          aria-expanded={!!field.value}
                          aria-controls="onset-listbox"
                          aria-required={true}
                        >
                          <SelectValue placeholder="Select onset" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent id="onset-listbox">
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
                render={({ field }) => {
                  const hasError = formErrors.symptoms?.radiation && formErrors.symptoms?.radiation;
                  const isValid = !hasError && formErrors.symptoms?.radiation;
                  return (
                    <FormItem>
                      <FormLabel>Radiation (if any)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="e.g., To the left arm, Down the leg"
                            {...field}
                            className={cn(
                              hasError && 'border-destructive focus-visible:ring-destructive',
                              isValid && 'border-primary focus-visible:ring-primary'
                            )}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Describes if the symptom (e.g., pain) spreads from its main location to other areas.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="symptoms.triggers"
                render={({ field }) => {
                  const hasError = formErrors.symptoms?.triggers && formErrors.symptoms?.triggers;
                  const isValid = !hasError && formErrors.symptoms?.triggers;
                  return (
                    <FormItem>
                      <FormLabel>Triggers (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Textarea
                            placeholder="e.g., Certain foods, Stress, Physical exertion (one per line)"
                            value={
                              Array.isArray(field.value)
                                ? field.value.join('\n')
                                : typeof field.value === 'string'
                                  ? field.value
                                  : ''
                            }
                            onChange={(e) => field.onChange(e.target.value)}
                            className={cn(
                              hasError && 'border-destructive focus-visible:ring-destructive',
                              isValid && 'border-primary focus-visible:ring-primary'
                            )}
                          />
                          {hasError && <XIcon className="absolute right-3 top-3 h-4 w-4 text-destructive" />}
                          {isValid && <XIcon className="absolute right-3 top-3 h-4 w-4 text-primary" />}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="symptoms.extras"
                render={({ field }) => {
                  const hasError = formErrors.symptoms?.extras && formErrors.symptoms?.extras;
                  const isValid = !hasError && formErrors.symptoms?.extras;
                  return (
                    <FormItem>
                      <FormLabel>Extra Information (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Textarea
                            placeholder="Describe the qualities of your symptoms (e.g., for 'Pain', mention if it's sharp, dull, throbbing; for 'Rash', describe its appearance). You can also list any other symptoms not covered."
                            value={
                              Array.isArray(field.value)
                                ? field.value.join('\n')
                                : typeof field.value === 'string'
                                  ? field.value
                                  : ''
                            }
                            onChange={(e) => field.onChange(e.target.value)}
                            className={cn(
                              hasError && 'border-destructive focus-visible:ring-destructive',
                              isValid && 'border-primary focus-visible:ring-primary'
                            )}
                          />
                          {hasError && <XIcon className="absolute right-3 top-3 h-4 w-4 text-destructive" />}
                          {isValid && <XIcon className="absolute right-3 top-3 h-4 w-4 text-primary" />}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Use this field to provide more details about your selected symptoms or add anything else
                        relevant.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </CardContent>
          </Card>
        )}

        <div className="mt-8 flex items-center justify-between">
          <div>
            {currentStep > 0 && (
              <Button type="button" variant="outline" onClick={handlePrev} className="min-w-[100px]">
                Previous
              </Button>
            )}
          </div>
          <div>
            {currentStep < totalSteps - 1 && (
              <Button type="button" onClick={handleNext} className="min-w-[100px]">
                Next
              </Button>
            )}
            {currentStep === totalSteps - 1 && (
              <Button type="submit" className="min-w-[150px]" disabled={isLoading || !form.formState.isValid}>
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Getting Diagnosis...</span>
                  </span>
                ) : (
                  'Get Diagnosis'
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </FormProviderComponent>
  );
}
