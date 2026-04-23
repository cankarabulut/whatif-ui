export type LeagueMeta = {
  code: string;
  name: string;
  short: string;
  country?: string;
  accent?: string; // tailwind color class (border/bg)
};

export const LEAGUES: LeagueMeta[] = [
  { code: 'PL',  name: 'Premier League',                short: 'PL',  country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', accent: 'from-purple-500/40 to-indigo-500/20' },
  { code: 'PD',  name: 'La Liga',                       short: 'LL',  country: '🇪🇸', accent: 'from-red-500/40 to-amber-500/20' },
  { code: 'SA',  name: 'Serie A',                       short: 'SA',  country: '🇮🇹', accent: 'from-sky-500/40 to-emerald-500/20' },
  { code: 'BL1', name: 'Bundesliga',                    short: 'BL',  country: '🇩🇪', accent: 'from-red-500/40 to-black/20' },
  { code: 'FL1', name: 'Ligue 1',                       short: 'L1',  country: '🇫🇷', accent: 'from-blue-500/40 to-sky-300/20' },
  { code: 'DED', name: 'Eredivisie',                    short: 'ER',  country: '🇳🇱', accent: 'from-orange-500/40 to-red-500/20' },
  { code: 'PPL', name: 'Primeira Liga',                 short: 'PR',  country: '🇵🇹', accent: 'from-green-600/40 to-red-600/20' },
  { code: 'BSA', name: 'Campeonato Brasileiro Série A', short: 'BR',  country: '🇧🇷', accent: 'from-green-500/40 to-yellow-400/20' },
  { code: 'ELC', name: 'Championship',                  short: 'CH',  country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', accent: 'from-blue-700/40 to-purple-500/20' },
  { code: 'CL',  name: 'Champions League',              short: 'CL',  country: '⭐', accent: 'from-blue-700/50 to-indigo-500/20' },
];

export function getLeague(code: string): LeagueMeta | undefined {
  return LEAGUES.find((l) => l.code === code);
}

export function formatRoundLabel(league: string, round: string, lang: 'tr' | 'en' = 'tr'): string {
  const rs = String(round);
  if (league === 'CL') {
    const mapEN: Record<string, string> = {
      'Group Stage': 'Group Stage',
      'Round of 16': 'Round of 16',
      'Quarter-finals': 'Quarter-finals',
      'Semi-finals': 'Semi-finals',
      'Final': 'Final',
    };
    const mapTR: Record<string, string> = {
      'Group Stage': 'Grup Aşaması',
      'Round of 16': 'Son 16',
      'Quarter-finals': 'Çeyrek Final',
      'Semi-finals': 'Yarı Final',
      'Final': 'Final',
    };
    const parts = rs.split(/\s*-\s*/);
    const stage = parts[0];
    const rest = parts.slice(1).join(' - ');
    const label = lang === 'tr' ? (mapTR[stage] || stage) : (mapEN[stage] || stage);
    return rest ? `${label} - ${rest}` : label;
  }
  const m = rs.match(/(\d+)$/);
  if (m) {
    const n = m[1];
    return lang === 'tr' ? `Hafta ${n}` : `Round ${n}`;
  }
  return rs;
}

export function formatSeasonLabel(code: string, season: string): string {
  const y = parseInt(season, 10);
  if (Number.isFinite(y)) {
    // Football-Data season "2025" => 2025/26
    return `${y}/${String((y + 1) % 100).padStart(2, '0')}`;
  }
  return season;
}
