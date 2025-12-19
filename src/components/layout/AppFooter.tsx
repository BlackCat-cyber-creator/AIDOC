import React from 'react';
import Iridescence from '../Iridescence';
import { useTheme } from 'next-themes';

export function AppFooter() {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();

  return (
    <footer className="py-10 border-b border-border relative h-21 sm:h-25 md:h-29 lg:h-33">
      <div className="absolute inset-0 z-0">
        <Iridescence color={[1, 0.9, 0.9]} mouseReact={false} amplitude={0} speed={0.5} horizontalStretch={0.4} />
      </div>
      <div className="container mx-auto px-2 text-center text-sm text-muted-foreground sm:text-base relative z-10">
        <p className="font-semibold">Disclaimer:</p>
        <p>
          AIDOC © {currentYear}. This tool provides information for educational purposes only and is not a substitute
          for professional medical advice.
        </p>
      </div>
    </footer>
  );
}
