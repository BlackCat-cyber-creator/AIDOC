'use client';

import React from 'react';

export function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border py-4">
      <div className="container mx-auto px-2 text-center text-sm text-muted-foreground sm:text-base">
        <p className="font-semibold">Disclaimer:</p>
        <p>
          AIDOC © {currentYear}. This tool provides information for educational purposes only and is not a substitute
          for professional medical advice, diagnosis, or treatment.
        </p>
      </div>
    </footer>
  );
}
