'use client';

import { useLanguage } from '../lib/LanguageProvider';

export default function AppHeader() {
  const { lang, setLang } = useLanguage();

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 3 L13.5 7.5 L18 8 L14.5 11 L15.5 15.5 L12 13 L8.5 15.5 L9.5 11 L6 8 L10.5 7.5 Z"
                fill="currentColor" opacity="0.9" />
            </svg>
          </span>
          <span>WhatIf FC</span>
        </div>
        <div className="lang-toggle" role="group" aria-label="Language">
          <button
            className={lang === 'tr' ? 'active' : ''}
            onClick={() => setLang('tr')}
            aria-pressed={lang === 'tr'}
          >TR</button>
          <button
            className={lang === 'en' ? 'active' : ''}
            onClick={() => setLang('en')}
            aria-pressed={lang === 'en'}
          >EN</button>
        </div>
      </div>
    </header>
  );
}
