import { z } from 'zod';

export const patientProfileSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required.'),
  age: z.coerce.number().min(0, 'Age cannot be negative.').max(120, 'Age seems too high.'),
  sex: z.enum(['male', 'female', 'other'], { required_error: 'Sex is required.' }),
  chronic_conditions: z.string().optional().default(''),
  medications: z.string().optional().default(''),
  allergies: z.string().optional().default(''),
});

export type PatientProfile = z.infer<typeof patientProfileSchema>;

export const FormSchema = z.object({
  profile: patientProfileSchema.optional(),
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
    onset: z.enum(['sudden', 'gradual'], { required_error: 'Onset is required.' }),
    radiation: z.string().optional().default(''),
    triggers: z.string().optional().default(''),
    extras: z.string().optional().default(''),
    symptomImageUrl: z.string().optional().default(''),
  }),
});

export type FormValues = z.infer<typeof FormSchema>;
