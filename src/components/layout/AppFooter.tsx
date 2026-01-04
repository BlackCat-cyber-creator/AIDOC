'use client';

import { useTranslation } from 'react-i18next';
import Iridescence from '../Iridescence';

export function AppFooter() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 relative min-h-[120px] rounded-xl overflow-hidden shadow-sm mx-0 md:mx-0 mb-2 md:mb-0 border border-border/50">
      <div className="absolute inset-0 z-0">
        <Iridescence color={[1, 0.9, 0.9]} mouseReact={false} amplitude={0} speed={0.5} horizontalStretch={0.4} />
      </div>
      <div className="container mx-auto px-4 flex flex-col items-center justify-center h-full relative z-10 space-y-2">
        <p className="font-bold text-sm sm:text-base text-foreground/80">{t('disclaimer_title')}</p>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl text-center leading-relaxed">
          {t('disclaimer_text', { year: currentYear })}
        </p>
      </div>
    </footer>
  );
}
