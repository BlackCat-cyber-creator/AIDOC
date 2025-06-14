import React from 'react';
import { render, screen } from '@testing-library/react';
import { DiagnosisCard } from './DiagnosisCard';
import type { GenerateDiagnosesOutput } from '@/ai/flows/generate-diagnoses';

const sampleDiagnosis: GenerateDiagnosesOutput['diagnoses'][0] = {
  condition: 'Test Condition',
  explanation: 'This is a test explanation.',
  urgency: 'urgent',
  next_steps: 'Call your doctor immediately.',
};

describe('DiagnosisCard', () => {
  it('renders all diagnosis fields', () => {
    render(<DiagnosisCard diagnosis={sampleDiagnosis} />);
    expect(screen.getByText('Test Condition')).toBeInTheDocument();
    expect(screen.getByText('This is a test explanation.')).toBeInTheDocument();
    expect(screen.getByText('Urgent')).toBeInTheDocument();
    expect(screen.getByText('Recommended Next Steps:')).toBeInTheDocument();
    expect(screen.getByText('Call your doctor immediately.')).toBeInTheDocument();
  });
});
