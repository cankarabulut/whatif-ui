'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Lang = 'tr' | 'en';

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('tr');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lang');
      if (saved === 'tr' || saved === 'en') setLangState(saved);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem('lang', l); } catch {}
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
