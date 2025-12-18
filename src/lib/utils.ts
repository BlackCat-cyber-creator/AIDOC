import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { FormValues } from './schema';
import type { GenerateDiagnosesInput } from '@/ai/flows/generate-diagnoses';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function transformFormDataForAI(
  values: FormValues,
  isPremium: boolean = false,
  language: string = 'en'
): GenerateDiagnosesInput {
  const numericAge = Number(values.profile?.age || 0);
  const ageForAI = numericAge >= 65 ? '65+' : String(numericAge);

  // Helper to split string into array if it's a string, or use as is if it's already an array (for safety)
  const stringToArray = (val: string | string[] | undefined) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    return val
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s !== '');
  };

  const symptomsForAI: GenerateDiagnosesInput['symptoms'] = {
    location: values.symptoms.location,
    type: values.symptoms.type,
    severity: values.symptoms.severity,
    duration: values.symptoms.duration,
    onset: values.symptoms.onset,
    triggers: stringToArray(values.symptoms.triggers),
    extras: stringToArray(values.symptoms.extras),
  };

  if (values.symptoms.radiation && values.symptoms.radiation.trim() !== '') {
    symptomsForAI.radiation = values.symptoms.radiation;
  }

  // Handle the profile data safely
  const profileData = values.profile || {
    age: 0,
    sex: 'other',
    chronic_conditions: '',
    medications: '',
    allergies: '',
  };

  return {
    profile: {
      age: ageForAI,
      sex: profileData.sex as any,
      chronic_conditions: stringToArray(profileData.chronic_conditions),
      medications: stringToArray(profileData.medications),
      allergies: stringToArray(profileData.allergies),
    },
    symptoms: symptomsForAI,
    isPremium: isPremium,
    language: language,
  };
}
