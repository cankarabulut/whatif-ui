'use client';

import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Match } from '@/lib/api';
import type { Lang } from './LanguageToggle';

export type Prediction = {
  id: string | number;
  home: number | null;
  away: number | null;
  outcome?: 'H' | 'D' | 'A';
};

type Props = {
  data: Match[];
  predictions: Record<string | number, Prediction>;
  onPredict: (p: Prediction) => void;
  lang: Lang;
};

const FINISHED_STATUSES = new Set(['FINISHED', 'FT', 'AET', 'PEN']);
const LIVE_STATUSES = new Set(['IN_PLAY', 'LIVE', '1H', '2H', 'HT', 'PAUSED']);

function matchStatusVariant(status: string) {
  const s = status.toUpperCase();
  if (FINISHED_STATUSES.has(s)) return 'finished' as const;
  if (LIVE_STATUSES.has(s)) return 'live' as const;
  return 'upcoming' as const;
}

function readScore(m: Match) {
  const home =
    m?.score?.fullTime?.home ??
    m?.score?.ft?.home ??
    m?.score?.homeTeam ??
    m?.score?.home ??
    m?.result?.home ??
    null;
  const away =
    m?.score?.fullTime?.away ??
    m?.score?.ft?.away ??
    m?.score?.awayTeam ??
    m?.score?.away ??
    m?.result?.away ??
    null;
  return { home, away };
}

function teamInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .slice(0, 3)
    .join('');
}

function TeamBadge({ name }: { name: string }) {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-muted text-[10px] font-bold tracking-tight text-fg-muted"
      aria-hidden
    >
      {teamInitials(name)}
    </div>
  );
}

function formatDate(iso: string, lang: Lang) {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    weekday: 'short',
  }).format(d);
  const time = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
  return { date, time };
}

export default function FixturesList({ data, predictions, onPredict, lang }: Props) {
  const items = useMemo(
    () => [...data].sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()),
    [data]
  );

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface-muted/50 py-12 text-center text-sm text-fg-muted">
        {lang === 'tr' ? 'Seçili hafta için maç bulunamadı.' : 'No fixtures for the selected round.'}
      </div>
    );
  }

  return (
    <div className="grid gap-2.5">
      {items.map((m) => {
        const k = String(m.id);
        const p =
          predictions[k] ||
          ({ id: m.id, home: null, away: null, outcome: undefined } as Prediction);
        const statusVariant = matchStatusVariant(m.status);
        const isFinished = statusVariant === 'finished';
        const { date, time } = formatDate(m.utcDate, lang);
        const { home: scoreHome, away: scoreAway } = readScore(m);

        const setOutcome = (val: 'H' | 'D' | 'A') => {
          const outcome = p.outcome === val ? undefined : val;
          onPredict({ ...p, outcome });
        };

        return (
          <article
            key={k}
            className={cn(
              'group relative grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-border bg-surface p-3 md:p-4 transition-colors',
              'hover:border-border-strong hover:bg-surface-hover',
              statusVariant === 'live' && 'ring-1 ring-danger/40'
            )}
          >
            {/* Left: date/time/status */}
            <div className="flex w-16 md:w-20 flex-col items-start gap-1 border-r border-border-subtle pr-3">
              <div className="text-2xs uppercase tracking-wider text-fg-subtle">{date}</div>
              <div className="tabular text-sm font-semibold text-fg">{time}</div>
              <Badge
                variant={statusVariant}
                className="mt-0.5 !py-0 !text-[9px] !tracking-wider"
              >
                {statusVariant === 'live' && (
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-danger animate-pulse-dot" />
                )}
                {statusVariant === 'finished' ? 'FT' : statusVariant === 'live' ? 'LIVE' : (lang === 'tr' ? 'Yakında' : 'Upcoming')}
              </Badge>
            </div>

            {/* Middle: teams */}
            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="flex items-center gap-2.5">
                <TeamBadge name={m.home} />
                <span className="truncate text-sm md:text-base font-semibold text-fg">{m.home}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <TeamBadge name={m.away} />
                <span className="truncate text-sm md:text-base font-semibold text-fg">{m.away}</span>
              </div>
            </div>

            {/* Right: score or prediction controls */}
            <div className="flex items-center justify-end">
              {isFinished ? (
                <div className="flex flex-col items-end gap-1 tabular">
                  <div className="flex flex-col items-end rounded-xl border border-border bg-surface-muted px-3 py-1.5 leading-none">
                    <span className="text-base md:text-lg font-bold text-fg">{scoreHome ?? '-'}</span>
                    <span className="text-base md:text-lg font-bold text-fg-muted mt-0.5">{scoreAway ?? '-'}</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-end gap-2">
                  <div className="inline-flex overflow-hidden rounded-lg border border-border bg-bg-elevated">
                    {(['H', 'D', 'A'] as const).map((o) => {
                      const label = o === 'H' ? '1' : o === 'D' ? 'X' : '2';
                      const active = p.outcome === o;
                      return (
                        <button
                          key={o}
                          type="button"
                          onClick={() => setOutcome(o)}
                          className={cn(
                            'w-8 py-1 text-xs font-bold transition-colors',
                            active
                              ? 'bg-brand text-white'
                              : 'text-fg-muted hover:bg-surface-hover hover:text-fg'
                          )}
                          aria-pressed={active}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-1 tabular">
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={20}
                      value={p.home ?? ''}
                      onChange={(e) =>
                        onPredict({
                          ...p,
                          home: e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                      className="no-spin h-8 w-10 px-1 text-center text-sm font-bold"
                      placeholder="—"
                      aria-label={`${m.home} prediction`}
                    />
                    <span className="text-fg-subtle">:</span>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={20}
                      value={p.away ?? ''}
                      onChange={(e) =>
                        onPredict({
                          ...p,
                          away: e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                      className="no-spin h-8 w-10 px-1 text-center text-sm font-bold"
                      placeholder="—"
                      aria-label={`${m.away} prediction`}
                    />
                  </div>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
