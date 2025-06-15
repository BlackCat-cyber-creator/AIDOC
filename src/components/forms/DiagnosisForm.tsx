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
import { CircleCheck, CircleX } from 'lucide-react';

// --- SVG Icons for Age ---
const InfantFaceIcon = () => (
  <svg viewBox="0 0 100 100" width="80" height="80" className="text-primary">
    <circle cx="50" cy="50" r="40" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" />
    <circle cx="35" cy="40" r="5" fill="currentColor" />
    <circle cx="65" cy="40" r="5" fill="currentColor" />
    <path d="M40 60 Q50 65 60 60" stroke="currentColor" strokeWidth="4" fill="none" />
    <path d="M45 25 Q50 15 55 25" stroke="currentColor" strokeWidth="3" fill="none" />
  </svg>
);
const ToddlerFaceIcon = () => (
  <svg viewBox="0 0 100 100" width="80" height="80" className="text-primary">
    <circle cx="50" cy="50" r="38" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" />
    <circle cx="37" cy="42" r="5.5" fill="currentColor" />
    <circle cx="63" cy="42" r="5.5" fill="currentColor" />
    <path d="M38 63 Q50 70 62 63" stroke="currentColor" strokeWidth="4" fill="none" />
    <path d="M35 28 Q40 20 45 28 M50 28 Q55 20 60 28" stroke="currentColor" strokeWidth="2.5" fill="none" />
  </svg>
);
const PreschoolFaceIcon = () => (
  <svg viewBox="0 0 100 100" width="80" height="80" className="text-primary">
    <circle cx="50" cy="50" r="38" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" />
    <circle cx="38" cy="43" r="6" fill="currentColor" />
    <circle cx="62" cy="43" r="6" fill="currentColor" />
    <path d="M35 65 Q50 75 65 65" stroke="currentColor" strokeWidth="4" fill="none" />
    <path d="M35 30 Q38 22 43 30 M52 30 Q57 22 62 30" stroke="currentColor" strokeWidth="2.5" fill="none" />
  </svg>
);
const SchoolAgeFaceIcon = () => (
  <svg viewBox="0 0 100 100" width="80" height="80" className="text-primary">
    <circle cx="50" cy="50" r="38" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" />
    <ellipse cx="38" cy="45" rx="5.5" ry="6.5" fill="currentColor" />
    <ellipse cx="62" cy="45" rx="5.5" ry="6.5" fill="currentColor" />
    <path d="M38 68 Q50 73 62 68" stroke="currentColor" strokeWidth="3.5" fill="none" />
    <path d="M30 32 Q35 25 45 32 M55 32 Q65 25 70 32" stroke="currentColor" strokeWidth="2.5" fill="none" />
  </svg>
);
const AdolescentFaceIcon = () => (
  <svg viewBox="0 0 100 100" width="80" height="80" className="text-primary">
    <circle cx="50" cy="50" r="37" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" />
    <ellipse cx="38" cy="46" rx="5" ry="7" fill="currentColor" />
    <ellipse cx="62" cy="46" rx="5" ry="7" fill="currentColor" />
    <path d="M40 70 Q50 72 60 70" stroke="currentColor" strokeWidth="3.5" fill="none" />
    <path d="M28 35 Q40 28 50 35 Q60 28 72 35" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);
const YoungAdultFaceIcon = () => (
  <svg viewBox="0 0 100 100" width="80" height="80" className="text-primary">
    <circle cx="50" cy="50" r="36" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" />
    <ellipse cx="39" cy="47" rx="4.5" ry="6.5" fill="currentColor" />
    <ellipse cx="61" cy="47" rx="4.5" ry="6.5" fill="currentColor" />
    <path d="M42 71 Q50 73 58 71" stroke="currentColor" strokeWidth="3" fill="none" />
    <path d="M28 38 Q40 32 50 38 Q60 32 72 38" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);
const MiddleAgeAdultFaceIcon = () => (
  <svg viewBox="0 0 100 100" width="80" height="80" className="text-primary">
    <circle cx="50" cy="50" r="36" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" />
    <ellipse cx="39" cy="47" rx="4.5" ry="6" fill="currentColor" />
    <ellipse cx="61" cy="47" rx="4.5" ry="6" fill="currentColor" />
    <path d="M42 70 Q50 71 58 70" stroke="currentColor" strokeWidth="3" fill="none" />
    <path d="M32 36 Q35 33 38 36 M62 36 Q65 33 68 36" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M35 60 Q33 63 35 65 M65 60 Q67 63 65 65" stroke="currentColor" strokeWidth="1" fill="none" />
  </svg>
);
const OlderAdultFaceIcon = () => (
  <svg viewBox="0 0 100 100" width="80" height="80" className="text-primary">
    <circle cx="50" cy="50" r="36" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" />
    <ellipse cx="38" cy="46" rx="4.5" ry="6" fill="currentColor" />
    <ellipse cx="62" cy="46" rx="4.5" ry="6" fill="currentColor" />
    <path d="M42 70 Q50 68 58 70" stroke="currentColor" strokeWidth="3" fill="none" />
    <path d="M30 35 Q35 30 40 35 M60 35 Q65 30 70 35" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M35 58 Q32 62 35 64 M65 58 Q68 62 65 64" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

const getAgeIconAndLabel = (
  ageInput: number | string | undefined
): { IconComponent: React.ElementType; label: string } => {
  const numericAge =
    typeof ageInput === 'string' ? parseInt(ageInput, 10) : typeof ageInput === 'number' ? ageInput : 30;

  let IconComponent: React.ElementType = YoungAdultFaceIcon;
  if (numericAge === 0) IconComponent = InfantFaceIcon;
  else if (numericAge >= 1 && numericAge <= 3) IconComponent = ToddlerFaceIcon;
  else if (numericAge >= 4 && numericAge <= 5) IconComponent = PreschoolFaceIcon;
  else if (numericAge >= 6 && numericAge <= 12) IconComponent = SchoolAgeFaceIcon;
  else if (numericAge >= 13 && numericAge <= 18) IconComponent = AdolescentFaceIcon;
  else if (numericAge >= 19 && numericAge <= 40) IconComponent = YoungAdultFaceIcon;
  else if (numericAge >= 41 && numericAge <= 64) IconComponent = MiddleAgeAdultFaceIcon;
  else if (numericAge >= 65) IconComponent = OlderAdultFaceIcon;

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

interface BodyPart {
  id: string;
  label: string;
  shape: 'rect' | 'circle' | 'ellipse' | 'path';
  props: React.SVGProps<SVGRectElement | SVGCircleElement | SVGEllipseElement | SVGPathElement> & { opacity?: number };
  sex?: 'male' | 'female';
  textX: number;
  textY: number;
  shortLabel?: string;
}

const anatomyParts: BodyPart[] = [
  // == POSTERIOR (BACK VIEW) PARTS ==
  {
    id: 'neck-posterior',
    label: 'Neck (Posterior/Back)',
    shape: 'rect',
    props: { x: 115, y: 80, width: 20, height: 15, opacity: 0.25 },
    textX: 125,
    textY: 88,
    shortLabel: 'Neck(B)',
  },
  {
    id: 'upper-back',
    label: 'Upper Back / Shoulder Blades',
    shape: 'rect',
    props: { x: 90, y: 95, width: 70, height: 40, opacity: 0.25 },
    textX: 125,
    textY: 115,
    shortLabel: 'Up.Back',
  },
  {
    id: 'mid-back',
    label: 'Mid Back / Thoracic Spine',
    shape: 'rect',
    props: { x: 90, y: 135, width: 70, height: 40, opacity: 0.25 },
    textX: 125,
    textY: 155,
    shortLabel: 'Mid.Back',
  },
  {
    id: 'lower-back',
    label: 'Lower Back / Lumbar',
    shape: 'rect',
    props: { x: 90, y: 175, width: 70, height: 40, opacity: 0.25 },
    textX: 125,
    textY: 195,
    shortLabel: 'Low.Back',
  },
  {
    id: 'left-buttock',
    label: 'Left Buttock',
    shape: 'ellipse',
    props: { cx: 105, cy: 235, rx: 20, ry: 15, opacity: 0.25 },
    textX: 105,
    textY: 235,
    shortLabel: 'L.Butt',
  },
  {
    id: 'right-buttock',
    label: 'Right Buttock',
    shape: 'ellipse',
    props: { cx: 145, cy: 235, rx: 20, ry: 15, opacity: 0.25 },
    textX: 145,
    textY: 235,
    shortLabel: 'R.Butt',
  },
  {
    id: 'left-thigh-posterior',
    label: 'Left Thigh (Posterior/Back)',
    shape: 'rect',
    props: { x: 82, y: 240, width: 36, height: 60, rx: 10, opacity: 0.25 },
    textX: 100,
    textY: 270,
    shortLabel: 'L.Thigh(B)',
  },
  {
    id: 'right-thigh-posterior',
    label: 'Right Thigh (Posterior/Back)',
    shape: 'rect',
    props: { x: 132, y: 240, width: 36, height: 60, rx: 10, opacity: 0.25 },
    textX: 150,
    textY: 270,
    shortLabel: 'R.Thigh(B)',
  },
  {
    id: 'left-lower-leg-posterior',
    label: 'Left Lower Leg (Posterior/Calf)',
    shape: 'rect',
    props: { x: 88, y: 320, width: 24, height: 50, rx: 8, opacity: 0.25 },
    textX: 100,
    textY: 345,
    shortLabel: 'L.Calf',
  },
  {
    id: 'right-lower-leg-posterior',
    label: 'Right Lower Leg (Posterior/Calf)',
    shape: 'rect',
    props: { x: 138, y: 320, width: 24, height: 50, rx: 8, opacity: 0.25 },
    textX: 150,
    textY: 345,
    shortLabel: 'R.Calf',
  },

  // == ANTERIOR (FRONT VIEW) PARTS ==
  {
    id: 'scalp',
    label: 'Scalp',
    shape: 'path',
    props: { d: 'M100 5 Q125 0 150 5 L145 20 L125 25 L105 20 Z', opacity: 0.3 },
    textX: 125,
    textY: 15,
    shortLabel: 'Scalp',
  },
  {
    id: 'forehead',
    label: 'Forehead',
    shape: 'rect',
    props: { x: 105, y: 25, width: 40, height: 15, rx: 2, opacity: 0.3 },
    textX: 125,
    textY: 33,
    shortLabel: 'Forehead',
  },
  {
    id: 'left-eye',
    label: 'Left Eye',
    shape: 'ellipse',
    props: { cx: 115, cy: 45, rx: 8, ry: 4, opacity: 0.3 },
    textX: 115,
    textY: 45,
    shortLabel: 'L.Eye',
  },
  {
    id: 'right-eye',
    label: 'Right Eye',
    shape: 'ellipse',
    props: { cx: 135, cy: 45, rx: 8, ry: 4, opacity: 0.3 },
    textX: 135,
    textY: 45,
    shortLabel: 'R.Eye',
  },
  {
    id: 'left-ear',
    label: 'Left Ear',
    shape: 'ellipse',
    props: { cx: 98, cy: 48, rx: 5, ry: 10, opacity: 0.3 },
    textX: 90,
    textY: 48,
    shortLabel: 'L.Ear',
  },
  {
    id: 'right-ear',
    label: 'Right Ear',
    shape: 'ellipse',
    props: { cx: 152, cy: 48, rx: 5, ry: 10, opacity: 0.3 },
    textX: 160,
    textY: 48,
    shortLabel: 'R.Ear',
  },
  {
    id: 'nose',
    label: 'Nose',
    shape: 'path',
    props: { d: 'M122 45 Q125 50 128 45 L125 60 Z', opacity: 0.3 },
    textX: 125,
    textY: 52,
    shortLabel: 'Nose',
  },
  {
    id: 'left-cheek',
    label: 'Left Cheek',
    shape: 'rect',
    props: { x: 100, y: 50, width: 20, height: 20, rx: 5, opacity: 0.3 },
    textX: 110,
    textY: 60,
    shortLabel: 'L.Cheek',
  },
  {
    id: 'right-cheek',
    label: 'Right Cheek',
    shape: 'rect',
    props: { x: 130, y: 50, width: 20, height: 20, rx: 5, opacity: 0.3 },
    textX: 140,
    textY: 60,
    shortLabel: 'R.Cheek',
  },
  {
    id: 'mouth-throat',
    label: 'Mouth / Throat / Tongue',
    shape: 'ellipse',
    props: { cx: 125, cy: 65, rx: 15, ry: 5, opacity: 0.3 },
    textX: 125,
    textY: 65,
    shortLabel: 'Mouth',
  },
  {
    id: 'jaw',
    label: 'Jaw / Chin',
    shape: 'rect',
    props: { x: 110, y: 70, width: 30, height: 10, rx: 3, opacity: 0.3 },
    textX: 125,
    textY: 75,
    shortLabel: 'Jaw',
  },
  {
    id: 'neck-anterior',
    label: 'Neck (Anterior/Front)',
    shape: 'rect',
    props: { x: 115, y: 80, width: 20, height: 15, opacity: 0.3 },
    textX: 125,
    textY: 88,
    shortLabel: 'Neck(F)',
  },
  {
    id: 'upper-chest',
    label: 'Upper Chest',
    shape: 'rect',
    props: { x: 95, y: 95, width: 60, height: 30, rx: 5, opacity: 0.3 },
    textX: 125,
    textY: 110,
    shortLabel: 'Up.Chest',
  },
  {
    id: 'lower-chest',
    label: 'Lower Chest / Ribs',
    shape: 'rect',
    props: { x: 90, y: 125, width: 70, height: 30, rx: 5, opacity: 0.3 },
    textX: 125,
    textY: 140,
    shortLabel: 'Low.Chest',
  },
  {
    id: 'upper-abdomen',
    label: 'Upper Abdomen',
    shape: 'rect',
    props: { x: 95, y: 155, width: 60, height: 30, rx: 5, opacity: 0.3 },
    textX: 125,
    textY: 170,
    shortLabel: 'Up.Abdo',
  },
  {
    id: 'lower-abdomen',
    label: 'Lower Abdomen',
    shape: 'rect',
    props: { x: 95, y: 185, width: 60, height: 30, rx: 5, opacity: 0.3 },
    textX: 125,
    textY: 200,
    shortLabel: 'Low.Abdo',
  },
  {
    id: 'pelvis-anterior',
    label: 'Pelvis (Anterior/Front)',
    shape: 'rect',
    props: { x: 100, y: 215, width: 50, height: 20, rx: 5, opacity: 0.3 },
    textX: 125,
    textY: 225,
    shortLabel: 'Pelvis(F)',
  },
  {
    id: 'left-shoulder',
    label: 'Left Shoulder',
    shape: 'circle',
    props: { cx: 85, cy: 105, r: 15, opacity: 0.3 },
    textX: 85,
    textY: 105,
    shortLabel: 'L.Shldr',
  },
  {
    id: 'right-shoulder',
    label: 'Right Shoulder',
    shape: 'circle',
    props: { cx: 165, cy: 105, r: 15, opacity: 0.3 },
    textX: 165,
    textY: 105,
    shortLabel: 'R.Shldr',
  },
  {
    id: 'left-upper-arm',
    label: 'Left Upper Arm',
    shape: 'rect',
    props: { x: 60, y: 115, width: 25, height: 50, rx: 10, opacity: 0.3 },
    textX: 72,
    textY: 140,
    shortLabel: 'L.Up.Arm',
  },
  {
    id: 'right-upper-arm',
    label: 'Right Upper Arm',
    shape: 'rect',
    props: { x: 165, y: 115, width: 25, height: 50, rx: 10, opacity: 0.3 },
    textX: 177,
    textY: 140,
    shortLabel: 'R.Up.Arm',
  },
  {
    id: 'left-elbow',
    label: 'Left Elbow',
    shape: 'circle',
    props: { cx: 72, cy: 170, r: 10, opacity: 0.3 },
    textX: 72,
    textY: 170,
    shortLabel: 'L.Elbow',
  },
  {
    id: 'right-elbow',
    label: 'Right Elbow',
    shape: 'circle',
    props: { cx: 178, cy: 170, r: 10, opacity: 0.3 },
    textX: 178,
    textY: 170,
    shortLabel: 'R.Elbow',
  },
  {
    id: 'left-forearm',
    label: 'Left Forearm',
    shape: 'rect',
    props: { x: 55, y: 175, width: 20, height: 40, rx: 8, opacity: 0.3 },
    textX: 65,
    textY: 195,
    shortLabel: 'L.Forearm',
  },
  {
    id: 'right-forearm',
    label: 'Right Forearm',
    shape: 'rect',
    props: { x: 175, y: 175, width: 20, height: 40, rx: 8, opacity: 0.3 },
    textX: 185,
    textY: 195,
    shortLabel: 'R.Forearm',
  },
  {
    id: 'left-wrist',
    label: 'Left Wrist',
    shape: 'circle',
    props: { cx: 65, cy: 220, r: 8, opacity: 0.3 },
    textX: 65,
    textY: 220,
    shortLabel: 'L.Wrist',
  },
  {
    id: 'right-wrist',
    label: 'Right Wrist',
    shape: 'circle',
    props: { cx: 185, cy: 220, r: 8, opacity: 0.3 },
    textX: 185,
    textY: 220,
    shortLabel: 'R.Wrist',
  },
  {
    id: 'left-hand',
    label: 'Left Hand / Fingers',
    shape: 'rect',
    props: { x: 45, y: 225, width: 25, height: 30, rx: 5, opacity: 0.3 },
    textX: 57,
    textY: 240,
    shortLabel: 'L.Hand',
  },
  {
    id: 'right-hand',
    label: 'Right Hand / Fingers',
    shape: 'rect',
    props: { x: 180, y: 225, width: 25, height: 30, rx: 5, opacity: 0.3 },
    textX: 192,
    textY: 240,
    shortLabel: 'R.Hand',
  },
  {
    id: 'genitals-male',
    label: 'Genitals (Male)',
    shape: 'rect',
    props: { x: 112, y: 235, width: 26, height: 20, rx: 5, opacity: 0.3 },
    sex: 'male',
    textX: 125,
    textY: 245,
    shortLabel: 'Genitals',
  },
  {
    id: 'genitals-female',
    label: 'Genitals (Female)',
    shape: 'rect',
    props: { x: 112, y: 235, width: 26, height: 15, rx: 5, opacity: 0.3 },
    sex: 'female',
    textX: 125,
    textY: 242,
    shortLabel: 'Genitals',
  },
  {
    id: 'left-hip',
    label: 'Left Hip',
    shape: 'circle',
    props: { cx: 95, cy: 225, r: 12, opacity: 0.3 },
    textX: 95,
    textY: 225,
    shortLabel: 'L.Hip',
  },
  {
    id: 'right-hip',
    label: 'Right Hip',
    shape: 'circle',
    props: { cx: 155, cy: 225, r: 12, opacity: 0.3 },
    textX: 155,
    textY: 225,
    shortLabel: 'R.Hip',
  },
  {
    id: 'left-groin',
    label: 'Left Groin',
    shape: 'rect',
    props: { x: 100, y: 220, width: 15, height: 15, rx: 3, opacity: 0.3 },
    textX: 107,
    textY: 227,
    shortLabel: 'L.Groin',
  },
  {
    id: 'right-groin',
    label: 'Right Groin',
    shape: 'rect',
    props: { x: 135, y: 220, width: 15, height: 15, rx: 3, opacity: 0.3 },
    textX: 142,
    textY: 227,
    shortLabel: 'R.Groin',
  },
  {
    id: 'left-thigh-anterior',
    label: 'Left Thigh (Anterior/Front)',
    shape: 'rect',
    props: { x: 85, y: 240, width: 30, height: 60, rx: 10, opacity: 0.3 },
    textX: 100,
    textY: 270,
    shortLabel: 'L.Thigh(F)',
  },
  {
    id: 'right-thigh-anterior',
    label: 'Right Thigh (Anterior/Front)',
    shape: 'rect',
    props: { x: 135, y: 240, width: 30, height: 60, rx: 10, opacity: 0.3 },
    textX: 150,
    textY: 270,
    shortLabel: 'R.Thigh(F)',
  },
  {
    id: 'left-knee',
    label: 'Left Knee',
    shape: 'circle',
    props: { cx: 100, cy: 305, r: 12, opacity: 0.3 },
    textX: 100,
    textY: 305,
    shortLabel: 'L.Knee',
  },
  {
    id: 'right-knee',
    label: 'Right Knee',
    shape: 'circle',
    props: { cx: 150, cy: 305, r: 12, opacity: 0.3 },
    textX: 150,
    textY: 305,
    shortLabel: 'R.Knee',
  },
  {
    id: 'left-lower-leg-anterior',
    label: 'Left Lower Leg (Anterior/Shin)',
    shape: 'rect',
    props: { x: 90, y: 320, width: 20, height: 50, rx: 8, opacity: 0.3 },
    textX: 100,
    textY: 345,
    shortLabel: 'L.Shin',
  },
  {
    id: 'right-lower-leg-anterior',
    label: 'Right Lower Leg (Anterior/Shin)',
    shape: 'rect',
    props: { x: 140, y: 320, width: 20, height: 50, rx: 8, opacity: 0.3 },
    textX: 150,
    textY: 345,
    shortLabel: 'R.Shin',
  },
  {
    id: 'left-ankle',
    label: 'Left Ankle',
    shape: 'circle',
    props: { cx: 100, cy: 375, r: 10, opacity: 0.3 },
    textX: 100,
    textY: 375,
    shortLabel: 'L.Ankle',
  },
  {
    id: 'right-ankle',
    label: 'Right Ankle',
    shape: 'circle',
    props: { cx: 150, cy: 375, r: 10, opacity: 0.3 },
    textX: 150,
    textY: 375,
    shortLabel: 'R.Ankle',
  },
  {
    id: 'left-foot',
    label: 'Left Foot / Toes',
    shape: 'path',
    props: { d: 'M90 380 L85 400 L115 400 L110 380 Z', opacity: 0.3 },
    textX: 100,
    textY: 390,
    shortLabel: 'L.Foot',
  },
  {
    id: 'right-foot',
    label: 'Right Foot / Toes',
    shape: 'path',
    props: { d: 'M140 380 L135 400 L165 400 L160 380 Z', opacity: 0.3 },
    textX: 150,
    textY: 390,
    shortLabel: 'R.Foot',
  },
];

const sortedAllSymptomLocations = [
  { value: 'scalp', label: 'Scalp' },
  { value: 'forehead', label: 'Forehead' },
  { value: 'left-eye', label: 'Left Eye' },
  { value: 'right-eye', label: 'Right Eye' },
  { value: 'left-ear', label: 'Left Ear' },
  { value: 'right-ear', label: 'Right Ear' },
  { value: 'nose', label: 'Nose' },
  { value: 'left-cheek', label: 'Left Cheek' },
  { value: 'right-cheek', label: 'Right Cheek' },
  { value: 'mouth-throat', label: 'Mouth / Throat / Tongue' },
  { value: 'jaw', label: 'Jaw / Chin' },
  { value: 'neck-anterior', label: 'Neck (Anterior/Front)' },
  { value: 'neck-posterior', label: 'Neck (Posterior/Back)' },
  { value: 'upper-chest', label: 'Upper Chest' },
  { value: 'lower-chest', label: 'Lower Chest / Ribs' },
  { value: 'upper-abdomen', label: 'Upper Abdomen' },
  { value: 'lower-abdomen', label: 'Lower Abdomen' },
  { value: 'pelvis-anterior', label: 'Pelvis (Anterior/Front)' },
  { value: 'upper-back', label: 'Upper Back / Shoulder Blades' },
  { value: 'mid-back', label: 'Mid Back / Thoracic Spine' },
  { value: 'lower-back', label: 'Lower Back / Lumbar' },
  { value: 'left-buttock', label: 'Left Buttock' },
  { value: 'right-buttock', label: 'Right Buttock' },
  { value: 'left-shoulder', label: 'Left Shoulder' },
  { value: 'right-shoulder', label: 'Right Shoulder' },
  { value: 'left-upper-arm', label: 'Left Upper Arm' },
  { value: 'right-upper-arm', label: 'Right Upper Arm' },
  { value: 'left-elbow', label: 'Left Elbow' },
  { value: 'right-elbow', label: 'Right Elbow' },
  { value: 'left-forearm', label: 'Left Forearm' },
  { value: 'right-forearm', label: 'Right Forearm' },
  { value: 'left-wrist', label: 'Left Wrist' },
  { value: 'right-wrist', label: 'Right Wrist' },
  { value: 'left-hand', label: 'Left Hand / Fingers' },
  { value: 'right-hand', label: 'Right Hand / Fingers' },
  { value: 'genitals-male', label: 'Genitals (Male)' },
  { value: 'genitals-female', label: 'Genitals (Female)' },
  { value: 'left-hip', label: 'Left Hip' },
  { value: 'right-hip', label: 'Right Hip' },
  { value: 'left-groin', label: 'Left Groin' },
  { value: 'right-groin', label: 'Right Groin' },
  { value: 'left-thigh-anterior', label: 'Left Thigh (Anterior/Front)' },
  { value: 'right-thigh-anterior', label: 'Right Thigh (Anterior/Front)' },
  { value: 'left-thigh-posterior', label: 'Left Thigh (Posterior/Back)' },
  { value: 'right-thigh-posterior', label: 'Right Thigh (Posterior/Back)' },
  { value: 'left-knee', label: 'Left Knee' },
  { value: 'right-knee', label: 'Right Knee' },
  { value: 'left-lower-leg-anterior', label: 'Left Lower Leg (Anterior/Shin)' },
  { value: 'right-lower-leg-anterior', label: 'Right Lower Leg (Anterior/Shin)' },
  { value: 'left-lower-leg-posterior', label: 'Left Lower Leg (Posterior/Calf)' },
  { value: 'right-lower-leg-posterior', label: 'Right Lower Leg (Posterior/Calf)' },
  { value: 'left-ankle', label: 'Left Ankle' },
  { value: 'right-ankle', label: 'Right Ankle' },
  { value: 'left-foot', label: 'Left Foot / Toes' },
  { value: 'right-foot', label: 'Right Foot / Toes' },
].sort((a, b) => a.label.localeCompare(b.label));

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
  { value: 'hearing-loss-new', label: 'Hearing Loss (New or Sudden)' },
  { value: 'irritability-agitation-unusual', label: 'Irritability or Agitation (Unusual)' },
  { value: 'itching-persistent', label: 'Itching (Persistent or Severe)' },
  { value: 'lightheadedness', label: 'Lightheadedness' },
  { value: 'lump-mass-new', label: 'Lump or Mass (New)' },
  { value: 'malaise-general-unwellness', label: 'Malaise / General Feeling of Unwellness' },
  { value: 'memory-problems-new', label: 'Memory Problems (New or Worsening)' },
  { value: 'nausea', label: 'Nausea' },
  { value: 'numbness', label: 'Numbness' },
  { value: 'other-symptom', label: 'Other Symptom (Describe in Extras)' },
  { value: 'pain-ache', label: 'Pain / Ache' },
  { value: 'rash', label: 'Rash' },
  { value: 'shortness-of-breath', label: 'Shortness of Breath / Difficulty Breathing' },
  { value: 'skin-discoloration-new', label: 'Skin Discoloration (New)' },
  { value: 'skin-lesion-new', label: 'Skin Lesion (New or Changing)' },
  { value: 'sweats-excessive', label: 'Sweats (Excessive or Night Sweats)' },
  { value: 'swelling-edema', label: 'Swelling / Edema' },
  { value: 'tingling-pins-needles', label: 'Tingling / Pins and Needles' },
  { value: 'tinnitus-ringing-ears', label: 'Tinnitus (Ringing in Ears)' },
  { value: 'urinary-issues', label: 'Urinary Issues (e.g., Pain, Frequency, Blood, Odor)' },
  { value: 'vision-blurred-double', label: 'Vision - Blurred or Double' },
  { value: 'vision-loss-partial-complete', label: 'Vision - Partial or Complete Loss' },
  { value: 'vomiting', label: 'Vomiting' },
  { value: 'weakness-muscle', label: 'Weakness (Muscle)' },
].sort((a, b) => a.label.localeCompare(b.label));

const commonLocationsForAllSymptoms = sortedAllSymptomLocations.map((loc) => loc.value);

const symptomTypeToLocationMapping: Record<string, string[]> = {
  'abdominal-pain-discomfort': ['upper-abdomen', 'lower-abdomen', 'pelvis-anterior'],
  'anxiety-new-worsening': ['whole-body'],
  bleeding: commonLocationsForAllSymptoms,
  'bruising-unexplained': commonLocationsForAllSymptoms,
  chills: ['whole-body', 'skin'],
  'confusion-disorientation': ['scalp', 'forehead', 'whole-body'],
  constipation: ['lower-abdomen', 'pelvis-anterior', 'whole-body'],
  cough: ['upper-chest', 'lower-chest', 'neck-anterior', 'mouth-throat', 'whole-body'],
  'depression-new-worsening': ['whole-body'],
  diarrhea: ['lower-abdomen', 'pelvis-anterior', 'whole-body'],
  'discharge-abnormal': [
    'left-eye',
    'right-eye',
    'left-ear',
    'right-ear',
    'nose',
    'mouth-throat',
    'genitals-male',
    'genitals-female',
    'skin',
    'upper-chest',
    'left-buttock',
    'right-buttock',
  ],
  dizziness: ['scalp', 'forehead', 'left-ear', 'right-ear', 'left-eye', 'right-eye', 'whole-body'],
  'ear-pain-or-discharge': ['left-ear', 'right-ear'],
  'eye-pain-or-redness': ['left-eye', 'right-eye'],
  'fainting-syncope': ['scalp', 'forehead', 'whole-body'],
  'fatigue-extreme': ['whole-body'],
  fever: ['whole-body', 'skin', 'scalp', 'forehead'],
  'hearing-loss-new': ['left-ear', 'right-ear'],
  'irritability-agitation-unusual': ['whole-body'],
  'itching-persistent': commonLocationsForAllSymptoms.filter(
    (loc) =>
      ![
        'left-knee',
        'right-knee',
        'left-elbow',
        'right-elbow',
        'left-ankle',
        'right-ankle',
        'left-wrist',
        'right-wrist',
        'joints',
      ].includes(loc)
  ),
  lightheadedness: ['scalp', 'forehead', 'left-ear', 'right-ear', 'left-eye', 'right-eye', 'whole-body'],
  'lump-mass-new': commonLocationsForAllSymptoms,
  'malaise-general-unwellness': ['whole-body'],
  'memory-problems-new': ['scalp', 'forehead', 'whole-body'],
  nausea: ['upper-abdomen', 'lower-abdomen', 'mouth-throat', 'whole-body'],
  numbness: commonLocationsForAllSymptoms,
  'other-symptom': commonLocationsForAllSymptoms,
  'pain-ache': commonLocationsForAllSymptoms,
  rash: commonLocationsForAllSymptoms.filter(
    (loc) =>
      ![
        'left-knee',
        'right-knee',
        'left-elbow',
        'right-elbow',
        'left-ankle',
        'right-ankle',
        'left-wrist',
        'right-wrist',
        'joints',
      ].includes(loc)
  ),
  'shortness-of-breath': ['upper-chest', 'lower-chest', 'neck-anterior', 'whole-body'],
  'skin-discoloration-new': commonLocationsForAllSymptoms.filter(
    (loc) =>
      ![
        'left-knee',
        'right-knee',
        'left-elbow',
        'right-elbow',
        'left-ankle',
        'right-ankle',
        'left-wrist',
        'right-wrist',
        'joints',
      ].includes(loc)
  ),
  'skin-lesion-new': commonLocationsForAllSymptoms.filter(
    (loc) =>
      ![
        'left-knee',
        'right-knee',
        'left-elbow',
        'right-elbow',
        'left-ankle',
        'right-ankle',
        'left-wrist',
        'right-wrist',
        'joints',
      ].includes(loc)
  ),
  'sweats-excessive': ['whole-body', 'skin'],
  'swelling-edema': commonLocationsForAllSymptoms,
  'tingling-pins-needles': commonLocationsForAllSymptoms,
  'tinnitus-ringing-ears': ['left-ear', 'right-ear'],
  'urinary-issues': [
    'lower-abdomen',
    'pelvis-anterior',
    'genitals-male',
    'genitals-female',
    'lower-back',
    'left-groin',
    'right-groin',
  ],
  'vision-blurred-double': ['left-eye', 'right-eye'],
  'vision-loss-partial-complete': ['left-eye', 'right-eye'],
  vomiting: ['upper-abdomen', 'lower-abdomen', 'mouth-throat', 'whole-body'],
  'weakness-muscle': commonLocationsForAllSymptoms,
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

const nonAnatomyLocationOptions = [{ value: 'skin', label: 'Skin (General / Multiple Areas)' }];

interface HumanAnatomySelectorProps {
  selectedLocations: string[];
  onLocationToggle: (locationValue: string) => void;
  selectedSex?: 'male' | 'female' | 'other';
  disabled?: boolean;
}

const HumanAnatomySelector: React.FC<HumanAnatomySelectorProps> = ({
  selectedLocations,
  onLocationToggle,
  selectedSex,
  disabled = false,
}) => {
  const baseFill = 'hsl(var(--muted))';
  const selectedFill = 'hsl(var(--primary))';
  const hoverFillBase = 'hsl(var(--primary))';

  const baseStroke = 'hsl(var(--border))';
  const selectedStroke = 'hsl(var(--primary))';

  const textFillColor = 'hsl(var(--foreground))';
  const selectedTextFillColor = 'hsl(var(--primary-foreground))';

  return (
    <svg
      viewBox="0 0 250 450"
      className={cn('mx-auto w-full max-w-md', disabled && 'cursor-not-allowed opacity-50')}
      aria-label="Human anatomy model for symptom location selection"
      aria-describedby="anatomy-desc"
    >
      <title>Interactive Human Anatomy Model</title>
      <desc id="anatomy-desc">Click on body parts to select symptom locations.</desc>
      {anatomyParts.map((part) => {
        if (part.sex && part.sex !== selectedSex && selectedSex !== 'other') {
          return null;
        }

        const isSelected = selectedLocations.includes(part.id);
        const baseOpacity = part.props.opacity !== undefined ? part.props.opacity : 0.3;
        const currentFill = isSelected ? selectedFill : baseFill;
        const currentOpacity = isSelected ? 1.0 : baseOpacity;
        const currentStroke = isSelected ? selectedStroke : baseStroke;
        const currentStrokeWidth = isSelected ? 1.5 : 1;

        let svgElement = null;
        switch (part.shape) {
          case 'rect':
            svgElement = (
              <rect
                aria-label={part.label}
                tabIndex={disabled ? -1 : 0}
                role="button"
                aria-pressed={isSelected}
                {...(part.props as React.SVGProps<SVGRectElement>)}
                fill={currentFill}
                stroke={currentStroke}
                strokeWidth={currentStrokeWidth}
                className={cn(
                  'transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  !disabled && 'cursor-pointer'
                )}
                style={{ ...part.props.style, opacity: currentOpacity }}
                onMouseEnter={(e) => {
                  if (!disabled) {
                    const currentTarget = e.currentTarget as SVGElement;
                    if (!isSelected) {
                      currentTarget.style.fill = hoverFillBase;
                      currentTarget.style.opacity = '0.5';
                      currentTarget.style.stroke = selectedStroke;
                      currentTarget.style.strokeWidth = '1.5';
                    }
                  }
                }}
                onMouseLeave={(e) => {
                  if (!disabled) {
                    const currentTarget = e.currentTarget as SVGElement;
                    currentTarget.style.fill = isSelected ? selectedFill : baseFill;
                    currentTarget.style.opacity = (isSelected ? 1.0 : baseOpacity).toString();
                    currentTarget.style.stroke = isSelected ? selectedStroke : baseStroke;
                    currentTarget.style.strokeWidth = (isSelected ? 1.5 : 1).toString();
                  }
                }}
                onClick={() => !disabled && onLocationToggle(part.id)}
                onKeyDown={(e) => {
                  if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                    onLocationToggle(part.id);
                  }
                }}
              />
            );
            break;
          case 'circle':
            svgElement = (
              <circle
                aria-label={part.label}
                tabIndex={disabled ? -1 : 0}
                role="button"
                aria-pressed={isSelected}
                {...(part.props as React.SVGProps<SVGCircleElement>)}
                fill={currentFill}
                stroke={currentStroke}
                strokeWidth={currentStrokeWidth}
                className={cn(
                  'transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  !disabled && 'cursor-pointer'
                )}
                style={{ ...part.props.style, opacity: currentOpacity }}
                onMouseEnter={(e) => {
                  if (!disabled) {
                    const currentTarget = e.currentTarget as SVGElement;
                    if (!isSelected) {
                      currentTarget.style.fill = hoverFillBase;
                      currentTarget.style.opacity = '0.5';
                      currentTarget.style.stroke = selectedStroke;
                      currentTarget.style.strokeWidth = '1.5';
                    }
                  }
                }}
                onMouseLeave={(e) => {
                  if (!disabled) {
                    const currentTarget = e.currentTarget as SVGElement;
                    currentTarget.style.fill = isSelected ? selectedFill : baseFill;
                    currentTarget.style.opacity = (isSelected ? 1.0 : baseOpacity).toString();
                    currentTarget.style.stroke = isSelected ? selectedStroke : baseStroke;
                    currentTarget.style.strokeWidth = (isSelected ? 1.5 : 1).toString();
                  }
                }}
                onClick={() => !disabled && onLocationToggle(part.id)}
                onKeyDown={(e) => {
                  if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                    onLocationToggle(part.id);
                  }
                }}
              />
            );
            break;
          case 'ellipse':
            svgElement = (
              <ellipse
                aria-label={part.label}
                tabIndex={disabled ? -1 : 0}
                role="button"
                aria-pressed={isSelected}
                {...(part.props as React.SVGProps<SVGEllipseElement>)}
                fill={currentFill}
                stroke={currentStroke}
                strokeWidth={currentStrokeWidth}
                className={cn(
                  'transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  !disabled && 'cursor-pointer'
                )}
                style={{ ...part.props.style, opacity: currentOpacity }}
                onMouseEnter={(e) => {
                  if (!disabled) {
                    const currentTarget = e.currentTarget as SVGElement;
                    if (!isSelected) {
                      currentTarget.style.fill = hoverFillBase;
                      currentTarget.style.opacity = '0.5';
                      currentTarget.style.stroke = selectedStroke;
                      currentTarget.style.strokeWidth = '1.5';
                    }
                  }
                }}
                onMouseLeave={(e) => {
                  if (!disabled) {
                    const currentTarget = e.currentTarget as SVGElement;
                    currentTarget.style.fill = isSelected ? selectedFill : baseFill;
                    currentTarget.style.opacity = (isSelected ? 1.0 : baseOpacity).toString();
                    currentTarget.style.stroke = isSelected ? selectedStroke : baseStroke;
                    currentTarget.style.strokeWidth = (isSelected ? 1.5 : 1).toString();
                  }
                }}
                onClick={() => !disabled && onLocationToggle(part.id)}
                onKeyDown={(e) => {
                  if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                    onLocationToggle(part.id);
                  }
                }}
              />
            );
            break;
          case 'path':
            svgElement = (
              <path
                aria-label={part.label}
                tabIndex={disabled ? -1 : 0}
                role="button"
                aria-pressed={isSelected}
                {...(part.props as React.SVGProps<SVGPathElement>)}
                fill={currentFill}
                stroke={currentStroke}
                strokeWidth={currentStrokeWidth}
                className={cn(
                  'transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  !disabled && 'cursor-pointer'
                )}
                style={{ ...part.props.style, opacity: currentOpacity }}
                onMouseEnter={(e) => {
                  if (!disabled) {
                    const currentTarget = e.currentTarget as SVGElement;
                    if (!isSelected) {
                      currentTarget.style.fill = hoverFillBase;
                      currentTarget.style.opacity = '0.5';
                      currentTarget.style.stroke = selectedStroke;
                      currentTarget.style.strokeWidth = '1.5';
                    }
                  }
                }}
                onMouseLeave={(e) => {
                  if (!disabled) {
                    const currentTarget = e.currentTarget as SVGElement;
                    currentTarget.style.fill = isSelected ? selectedFill : baseFill;
                    currentTarget.style.opacity = (isSelected ? 1.0 : baseOpacity).toString();
                    currentTarget.style.stroke = isSelected ? selectedStroke : baseStroke;
                    currentTarget.style.strokeWidth = (isSelected ? 1.5 : 1).toString();
                  }
                }}
                onClick={() => !disabled && onLocationToggle(part.id)}
                onKeyDown={(e) => {
                  if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                    onLocationToggle(part.id);
                  }
                }}
              />
            );
            break;
        }
        return (
          <g key={part.id + (part.sex || '')}>
            {svgElement}
            {part.shortLabel && (
              <text
                x={part.textX}
                y={part.textY}
                fontSize="6px"
                fill={isSelected ? selectedTextFillColor : textFillColor}
                textAnchor="middle"
                dominantBaseline="central"
                pointerEvents="none"
                className="font-sans"
                style={{ opacity: isSelected ? 1 : baseOpacity > 0.2 ? 0.9 : 0.7 }}
              >
                {part.shortLabel}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

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
      if (
        selectedLocations.length === 0 ||
        selectedLocations.some((sl) => nonAnatomyLocationOptions.map((o) => o.value).includes(sl))
      ) {
        return sortedSimplifiedSymptomTypes;
      }
      return [];
    }

    const displayableSymptomTypeValues = new Set<string>();
    sortedSimplifiedSymptomTypes.forEach((st) => {
      if (st.value === 'other-symptom') {
        displayableSymptomTypeValues.add(st.value);
        return;
      }
      const allowedLocationsForType = symptomTypeToLocationMapping[st.value] || [];
      const isRelevant = selectedLocations.some(
        (sl) =>
          allowedLocationsForType.includes(sl) ||
          allowedLocationsForType.includes('whole-body') ||
          allowedLocationsForType.includes('skin') ||
          allowedLocationsForType.includes('joints')
      );

      if (isRelevant) {
        displayableSymptomTypeValues.add(st.value);
      }
    });

    if (selectedLocations.some((sl) => ['skin', 'joints', 'whole-body'].includes(sl))) {
      return sortedSimplifiedSymptomTypes;
    }

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
    { value: 'male', label: 'Male', Icon: MaleSexIcon },
    { value: 'female', label: 'Female', Icon: FemaleSexIcon },
    { value: 'other', label: 'Other / Prefer not to say', Icon: OtherSexIcon },
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
                              'group flex-1 p-3 border rounded-md flex flex-col items-center justify-center gap-2 transition-all duration-150 ease-in-out',
                              'hover:shadow-md hover:border-primary/70 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                              field.value === option.value
                                ? 'border-primary ring-2 ring-primary ring-offset-2 bg-primary/10 shadow-lg'
                                : 'border-input bg-card hover:bg-muted/50'
                            )}
                            aria-label={option.label}
                          >
                            <option.Icon />
                            <span
                              className={cn(
                                'text-xs text-center font-medium',
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
                              {hasError && <CircleX className="absolute right-3 top-3 h-4 w-4 text-destructive" />}
                              {isValid && <CircleCheck className="absolute right-3 top-3 h-4 w-4 text-primary" />}
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
                              {hasError && <CircleX className="absolute right-3 top-3 h-4 w-4 text-destructive" />}
                              {isValid && <CircleCheck className="absolute right-3 top-3 h-4 w-4 text-primary" />}
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
                              {hasError && <CircleX className="absolute right-3 top-3 h-4 w-4 text-destructive" />}
                              {isValid && <CircleCheck className="absolute right-3 top-3 h-4 w-4 text-primary" />}
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
                        <HumanAnatomySelector
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
                        {!selectedSex && (
                          <p className="mt-2 text-sm text-center text-muted-foreground">
                            Please select a sex in the "Patient Profile" step to enable body part selection.
                          </p>
                        )}
                        <div className="mt-4 space-y-2">
                          <FormLabel className="text-sm font-medium">General Locations:</FormLabel>
                          {nonAnatomyLocationOptions.map((option) => (
                            <FormItem
                              key={option.value}
                              className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 shadow-sm hover:bg-muted/50 has-[input:checked]:bg-primary/10 has-[input:checked]:border-primary"
                            >
                              <FormControl>
                                <Checkbox
                                  disabled={
                                    !selectedSex && option.value !== 'whole-body' && option.value !== 'other-location'
                                  }
                                  checked={field.value?.includes(option.value)}
                                  onCheckedChange={(checked) => {
                                    if (
                                      !selectedSex &&
                                      option.value !== 'whole-body' &&
                                      option.value !== 'other-location'
                                    )
                                      return;
                                    return checked
                                      ? field.onChange([...(field.value || []), option.value])
                                      : field.onChange((field.value || []).filter((value) => value !== option.value));
                                  }}
                                  id={`location-checkbox-${option.value}`}
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor={`location-checkbox-${option.value}`}
                                className="text-sm font-normal text-foreground/80 cursor-pointer flex-1"
                              >
                                {option.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
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
                        <CircleX className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                      )}
                      {isValid && (
                        <CircleCheck className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
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
                          {hasError && (
                            <CircleX className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                          )}
                          {isValid && (
                            <CircleCheck className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                          )}
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
                          {hasError && <CircleX className="absolute right-3 top-3 h-4 w-4 text-destructive" />}
                          {isValid && <CircleCheck className="absolute right-3 top-3 h-4 w-4 text-primary" />}
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
                          {hasError && <CircleX className="absolute right-3 top-3 h-4 w-4 text-destructive" />}
                          {isValid && <CircleCheck className="absolute right-3 top-3 h-4 w-4 text-primary" />}
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
