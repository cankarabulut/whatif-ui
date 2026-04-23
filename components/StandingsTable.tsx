'use client';

import { cn } from '@/lib/utils';
import type { StandingsRow } from '@/lib/api';
import type { Lang } from './LanguageToggle';

type Props = {
  data: StandingsRow[];
  lang: Lang;
  league?: string;
};

function getZoneAccent(league: string | undefined, rank: number, total: number): string | null {
  // Sadece domestic ligler için zone renkleri uygulayalım; CL vb. için skip.
  if (!league || league === 'CL') return null;
  // Premier League örneği: 1-4 UCL, 5 UEL, 6 UEC, 18-20 düşme
  if (rank <= 4) return 'border-l-zone-ucl';
  if (rank === 5) return 'border-l-zone-uel';
  if (rank === 6) return 'border-l-zone-uec';
  if (rank > total - 3) return 'border-l-zone-relegate';
  return null;
}

function teamInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .slice(0, 3)
    .join('');
}

export default function StandingsTable({ data, lang, league }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface-muted/50 py-12 text-center text-sm text-fg-muted">
        {lang === 'tr' ? 'Puan durumu yok.' : 'No standings available.'}
      </div>
    );
  }

  const tr = lang === 'tr';
  const H = {
    team: tr ? 'Takım' : 'Team',
    played: tr ? 'O' : 'P',
    won: tr ? 'G' : 'W',
    draw: tr ? 'B' : 'D',
    lost: tr ? 'M' : 'L',
    gd: tr ? 'AV' : 'GD',
    points: tr ? 'P' : 'Pts',
  };

  const total = data.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="max-h-[70vh] overflow-auto scrollbar-thin">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-surface-muted backdrop-blur">
            <tr className="text-2xs uppercase tracking-wider text-fg-subtle">
              <th className="px-3 py-2.5 text-left font-semibold">#</th>
              <th className="px-3 py-2.5 text-left font-semibold">{H.team}</th>
              <th className="px-2 py-2.5 text-right font-semibold">{H.played}</th>
              <th className="px-2 py-2.5 text-right font-semibold">{H.won}</th>
              <th className="px-2 py-2.5 text-right font-semibold">{H.draw}</th>
              <th className="px-2 py-2.5 text-right font-semibold">{H.lost}</th>
              <th className="px-2 py-2.5 text-right font-semibold">{H.gd}</th>
              <th className="px-3 py-2.5 text-right font-semibold text-fg">{H.points}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => {
              const accent = getZoneAccent(league, r.rank, total);
              return (
                <tr
                  key={`${r.rank}-${r.team}`}
                  className={cn(
                    'border-t border-border-subtle transition-colors hover:bg-surface-hover',
                    accent && 'border-l-2',
                    accent
                  )}
                >
                  <td className="px-3 py-2 text-left tabular text-fg-muted font-semibold w-10">{r.rank}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface-muted text-[9px] font-bold text-fg-muted">
                        {teamInitials(r.team)}
                      </div>
                      <span className="truncate font-medium text-fg">{r.team}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-right tabular text-fg-muted">{r.played}</td>
                  <td className="px-2 py-2 text-right tabular text-fg-muted">{r.won}</td>
                  <td className="px-2 py-2 text-right tabular text-fg-muted">{r.draw}</td>
                  <td className="px-2 py-2 text-right tabular text-fg-muted">{r.lost}</td>
                  <td
                    className={cn(
                      'px-2 py-2 text-right tabular',
                      r.goalDiff > 0 && 'text-success',
                      r.goalDiff < 0 && 'text-danger',
                      r.goalDiff === 0 && 'text-fg-muted'
                    )}
                  >
                    {r.goalDiff > 0 ? `+${r.goalDiff}` : r.goalDiff}
                  </td>
                  <td className="px-3 py-2 text-right tabular font-bold text-fg">{r.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
