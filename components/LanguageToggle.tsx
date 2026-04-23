'use client';

import { cn } from '@/lib/utils';

export type Lang = 'tr' | 'en';

export function LanguageToggle({
  value,
  onChange,
  className,
}: {
  value: Lang;
  onChange: (l: Lang) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex rounded-full border border-border bg-surface-muted p-0.5 text-xs font-semibold',
        className
      )}
      role="group"
      aria-label="Language toggle"
    >
      {(['tr', 'en'] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={cn(
            'rounded-full px-3 py-1 uppercase transition-colors',
            value === l
              ? 'bg-brand text-white'
              : 'text-fg-muted hover:text-fg'
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
