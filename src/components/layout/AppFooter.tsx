import React from 'react';
import Iridescence from '../Iridescence';
import { useTranslation } from 'react-i18next';

export function AppFooter() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="py-10 border-b border-border relative h-21 sm:h-25 md:h-29 lg:h-33">
      <div className="absolute inset-0 z-0">
        <Iridescence color={[1, 0.9, 0.9]} mouseReact={false} amplitude={0} speed={0.5} horizontalStretch={0.4} />
      </div>
      <div className="container mx-auto px-2 text-center text-sm text-muted-foreground sm:text-base relative z-10">
        <p className="font-semibold">{t('disclaimer_title')}</p>
        <p>{t('disclaimer_text', { year: currentYear })}</p>
      </div>
    </footer>
  );
}
