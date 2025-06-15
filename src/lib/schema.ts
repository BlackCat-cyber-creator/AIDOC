import { z } from 'zod';

const StringToArrayTransformer = z.string().transform((val) => {
  if (val.trim() === '') return [];
  return val
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s !== '');
});

export const FormSchema = z.object({
  profile: z.object({
    age: z.coerce.number().min(0, 'Age cannot be negative.').max(120, 'Age seems too high.'),
    sex: z.enum(['male', 'female', 'other'], { required_error: 'Sex is required.' }),
    chronic_conditions: StringToArrayTransformer, // Apply transformer
    medications: StringToArrayTransformer, // Apply transformer
    allergies: StringToArrayTransformer, // Apply transformer
  }),
  symptoms: z.object({
    location: z.array(z.string()).min(1, 'At least one symptom location is required.'),
    type: z.array(z.string()).min(1, 'At least one symptom type is required.'),
    severity: z.coerce.number().min(1).max(10),
    duration: z
      .string()
      .regex(/^\d+\s+(day|week|month|year)s?$/, "Please enter a valid duration (e.g., '2 days', '1 week').")
      .refine((val) => {
        const numPart = parseInt(val.split(' ')[0]);
        return numPart > 0;
      }, 'Duration number must be greater than 0.')
      .refine((val) => {
        const numPart = parseInt(val.split(' ')[0]);
        return numPart <= 66;
      }, 'Duration number cannot exceed 66.'),
    onset: z.enum(['sudden', 'gradual'], { required_error: 'Onset is required.' }), // Made directly required
    radiation: z.string().default(''),
    triggers: StringToArrayTransformer.default([]), // Apply transformer
    extras: StringToArrayTransformer.default([]), // Apply transformer
  }),
}); // Removed .refine() as onset is now directly required

export type FormValues = z.infer<typeof FormSchema>;
