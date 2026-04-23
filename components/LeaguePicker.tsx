'use client';

import { Trophy, CalendarDays } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LEAGUES, formatSeasonLabel } from '@/lib/leagues';
import type { Lang } from './LanguageToggle';

type Props = {
  league: string;
  season: string;
  seasons?: string[];
  lang: Lang;
  onChange: (p: Partial<{ league: string; season: string }>) => void;
};

const DEFAULT_SEASONS = ['2025', '2024', '2023'];

export default function LeaguePicker({ league, season, seasons = DEFAULT_SEASONS, lang, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <label className="flex flex-col gap-1.5 text-2xs font-semibold uppercase tracking-wider text-fg-subtle">
        <span className="flex items-center gap-1.5">
          <Trophy className="h-3 w-3" />
          {lang === 'tr' ? 'Lig' : 'League'}
        </span>
        <Select value={league} onValueChange={(v) => onChange({ league: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LEAGUES.map((l) => (
              <SelectItem key={l.code} value={l.code}>
                <span className="inline-flex items-center gap-2">
                  {l.country && <span className="text-base leading-none">{l.country}</span>}
                  <span>{l.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <label className="flex flex-col gap-1.5 text-2xs font-semibold uppercase tracking-wider text-fg-subtle">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-3 w-3" />
          {lang === 'tr' ? 'Sezon' : 'Season'}
        </span>
        <Select value={season} onValueChange={(v) => onChange({ season: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {seasons.map((y) => (
              <SelectItem key={y} value={y}>
                {formatSeasonLabel(league, y)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
    </div>
  );
}
