import './globals.css';
import type { Metadata } from 'next';
import { LanguageProvider } from '../lib/LanguageProvider';
import AppHeader from '../components/AppHeader';

export const metadata: Metadata = {
  title: 'WhatIf FC',
  description: 'WhatIf FC – Canlı skorlar, fikstür ve puan durumu senaryoları',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <LanguageProvider>
          <AppHeader />
          <div className="container">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
