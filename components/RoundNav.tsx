'use client';

import { ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatRoundLabel } from '@/lib/leagues';
import type { Lang } from './LanguageToggle';

type Props = {
  league: string;
  round: string;
  rounds: string[];
  activeRound?: number | null;
  lang: Lang;
  onChange: (round: string) => void;
};

export function RoundNav({ league, round, rounds, activeRound, lang, onChange }: Props) {
  const idx = rounds.indexOf(round);
  const canPrev = idx > 0;
  const canNext = idx >= 0 && idx < rounds.length - 1;

  const go = (delta: number) => {
    const next = rounds[idx + delta];
    if (next) onChange(next);
  };

  const goActive = () => {
    if (activeRound != null) onChange(String(activeRound));
  };

  const isAtActive = activeRound != null && String(activeRound) === round;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="icon"
        disabled={!canPrev}
        onClick={() => go(-1)}
        aria-label="Previous round"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Select value={round} onValueChange={onChange}>
        <SelectTrigger className="min-w-[160px]">
          <SelectValue placeholder={lang === 'tr' ? 'Hafta seç' : 'Select round'} />
        </SelectTrigger>
        <SelectContent>
          {rounds.map((r) => (
            <SelectItem key={r} value={r}>
              {formatRoundLabel(league, r, lang)}
              {activeRound != null && String(activeRound) === r && (
                <span className="ml-1 text-brand">•</span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="secondary"
        size="icon"
        disabled={!canNext}
        onClick={() => go(1)}
        aria-label="Next round"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {activeRound != null && !isAtActive && (
        <Button variant="ghost" size="sm" onClick={goActive} className="gap-1.5">
          <Target className="h-3.5 w-3.5" />
          {lang === 'tr' ? 'Bu hafta' : 'Current'}
        </Button>
      )}
    </div>
  );
}
