'use client';

import { Trophy, CalendarDays, Radio } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getLeague, formatSeasonLabel, formatRoundLabel } from '@/lib/leagues';
import { LanguageToggle, type Lang } from './LanguageToggle';

type Props = {
  league: string;
  season: string;
  round: string;
  seasonActive?: boolean;
  lang: Lang;
  onLangChange: (l: Lang) => void;
};

export function AppHeader({ league, season, round, seasonActive, lang, onLangChange }: Props) {
  const meta = getLeague(league);
  const seasonLabel = formatSeasonLabel(league, season);
  const roundLabel = round ? formatRoundLabel(league, round, lang) : '';

  return (
    <header className="relative overflow-hidden border-b border-border-subtle">
      <div
        className={cn(
          'absolute inset-0 -z-10 bg-gradient-to-br opacity-60',
          meta?.accent ?? 'from-brand/20 to-info/10'
        )}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-bg/40 to-bg" />

      <div className="container flex items-center justify-between gap-4 py-5 md:py-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border-strong bg-surface text-brand shadow-card">
            <Trophy className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-fg-muted text-2xs uppercase tracking-[0.18em]">
              {meta?.country && <span className="text-base leading-none">{meta.country}</span>}
              <span>{lang === 'tr' ? 'Ne olsaydı' : 'What-if'}</span>
            </div>
            <h1 className="truncate text-lg md:text-2xl font-bold leading-tight text-fg">
              {meta?.name ?? league}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge variant="neutral" className="gap-1">
                <CalendarDays className="h-3 w-3" />
                {seasonLabel}
              </Badge>
              {roundLabel && (
                <Badge variant={seasonActive ? 'default' : 'neutral'} className="gap-1">
                  {seasonActive && <Radio className="h-3 w-3 animate-pulse-dot" />}
                  {roundLabel}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <LanguageToggle value={lang} onChange={onLangChange} />
      </div>
    </header>
  );
}
