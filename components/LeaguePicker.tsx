'use client';

type Props = {
  league: string;
  season: string;
  round: string;
  rounds: Array<string | number>;
  onChange: (p: Partial<{ league: string; season: string; round: string }>) => void;
  t?: any;
};

const FD_LEAGUES = [
  { code: 'PL',  name: 'Premier League',              flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { code: 'PD',  name: 'La Liga',                     flag: '🇪🇸' },
  { code: 'SA',  name: 'Serie A',                     flag: '🇮🇹' },
  { code: 'BL1', name: 'Bundesliga',                  flag: '🇩🇪' },
  { code: 'FL1', name: 'Ligue 1',                     flag: '🇫🇷' },
  { code: 'DED', name: 'Eredivisie',                  flag: '🇳🇱' },
  { code: 'PPL', name: 'Primeira Liga',               flag: '🇵🇹' },
  { code: 'BSA', name: 'Brasileirão Série A',         flag: '🇧🇷' },
  { code: 'ELC', name: 'Championship',                flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { code: 'CL',  name: 'Champions League',            flag: '🏆' },
];

function displayRound(league: string, r: string, t?: any): string {
  const rs = String(r);
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
    if (parts.length >= 1) {
      const stage = parts[0];
      const rest = parts.slice(1).join(' - ');
      const label = (t?.lang === 'tr') ? (mapTR[stage] || stage) : (mapEN[stage] || stage);
      return rest ? `${label} - ${rest}` : label;
    }
  }
  const m = rs.match(/(\d+)$/);
  if (m) {
    const n = m[1];
    return (t?.lang === 'tr') ? `${t?.round || 'Hafta'} ${n}` : `${t?.round || 'Round'} ${n}`;
  }
  return rs;
}

export default function LeaguePicker({
  league,
  season,
  round,
  rounds,
  onChange,
  t,
}: Props) {
  const isNumericRounds = rounds.length > 0 && rounds.every((r) => /^\d+$/.test(String(r).trim()));
  const currentIdx = rounds.findIndex((r) => String(r) === String(round));
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx >= 0 && currentIdx < rounds.length - 1;

  return (
    <div className="pickers">
      <select
        className="select"
        value={league}
        onChange={(e) => onChange({ league: e.target.value })}
        aria-label={t?.league ?? 'League'}
      >
        {FD_LEAGUES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.flag ? `${l.flag}  ` : ''}{l.name}
          </option>
        ))}
      </select>

      <select
        className="select"
        value={season}
        onChange={(e) => onChange({ season: e.target.value })}
        aria-label={t?.season ?? 'Season'}
      >
        {['2025', '2024', '2023'].map((y) => (
          <option key={y} value={y}>{y}/{String(Number(y) + 1).slice(2)}</option>
        ))}
      </select>

      {isNumericRounds ? (
        <div className="round-stepper" role="group" aria-label={t?.round ?? 'Round'}>
          <button
            onClick={() => hasPrev && onChange({ round: String(rounds[currentIdx - 1]) })}
            disabled={!hasPrev}
            aria-label={t?.lang === 'tr' ? 'Önceki hafta' : 'Previous round'}
          >◀</button>
          <div className="round-label">{displayRound(league, String(round || rounds[0] || ''), t)}</div>
          <button
            onClick={() => hasNext && onChange({ round: String(rounds[currentIdx + 1]) })}
            disabled={!hasNext}
            aria-label={t?.lang === 'tr' ? 'Sonraki hafta' : 'Next round'}
          >▶</button>
        </div>
      ) : (
        <select
          className="select"
          value={round}
          onChange={(e) => onChange({ round: e.target.value })}
          aria-label={t?.round ?? 'Round'}
        >
          {rounds.map((r, i) => (
            <option key={String(r) + '-' + i} value={String(r)}>
              {displayRound(league, String(r), t)}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
