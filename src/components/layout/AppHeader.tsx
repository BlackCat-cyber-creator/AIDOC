import { Stethoscope } from 'lucide-react';
import { ThemeToggleButton } from './ThemeToggleButton';

export function AppHeader() {
  return (
    <header className="py-6 mb-8 border-b border-border">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Stethoscope className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-headline font-semibold text-primary">AIDOC</h1>
        </div>
        <ThemeToggleButton />
      </div>
    </header>
  );
}
