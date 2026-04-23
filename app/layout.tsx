import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'WhatIf FC — Futbol Tahmin Simülatörü',
  description:
    'Avrupa liglerinin canlı fikstür ve puan durumunu takip et, oynanmamış maçlara tahmin girerek puan tablosunun nasıl değişeceğini gör.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`dark ${inter.variable}`}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
