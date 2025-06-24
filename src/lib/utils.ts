import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { FormValues } from './schema';
import type { GenerateDiagnosesInput } from '@/ai/flows/generate-diagnoses';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function transformFormDataForAI(values: FormValues): GenerateDiagnosesInput {
  const numericAge = Number(values.profile.age);
  const ageForAI = numericAge >= 65 ? '65+' : String(numericAge);

  const symptomsForAI: GenerateDiagnosesInput['symptoms'] = {
    location: values.symptoms.location,
    type: values.symptoms.type,
    severity: values.symptoms.severity,
    duration: values.symptoms.duration,
    onset: values.symptoms.onset,
    triggers: values.symptoms.triggers.filter(Boolean),
    extras: values.symptoms.extras.filter(Boolean),
  };

  if (values.symptoms.radiation && values.symptoms.radiation.trim() !== '') {
    symptomsForAI.radiation = values.symptoms.radiation;
  }

  return {
    profile: {
      age: ageForAI,
      sex: values.profile.sex,
      chronic_conditions: values.profile.chronic_conditions.filter(Boolean),
      medications: values.profile.medications.filter(Boolean),
      allergies: values.profile.allergies.filter(Boolean),
    },
    symptoms: symptomsForAI,
  };
}
