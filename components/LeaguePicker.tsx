'use client';

type Props = {
  league: string;
  season: string;
  round: string;
  rounds: Array<string | number>;
  onChange: (p: Partial<{ league: string; season: string; round: string }>) => void;
  t?: any; // i18n sözlüğü
};

const FD_LEAGUES = [
  { code: 'PL',  name: 'Premier League' },
  { code: 'PD',  name: 'La Liga' },
  { code: 'SA',  name: 'Serie A' },
  { code: 'BL1', name: 'Bundesliga' },
  { code: 'FL1', name: 'Ligue 1' },
  { code: 'CL',  name: 'Champions League' },
  { code: 'DED', name: 'Eredivisie' },
  { code: 'PPL', name: 'Primeira Liga' },
  { code: 'BSA', name: 'Campeonato Brasileiro Série A'},
  { code: 'ELC', name: 'Championship'}  
];

// Şampiyonlar Ligi ve genel round etiketleri
function displayRound(league: string, r: string, t?: any) {
  const rs = String(r);
  if (league === 'CL') {
    const mapEN: Record<string,string> = {
      'Group Stage': 'Group Stage',
      'Round of 16': 'Round of 16',
      'Quarter-finals': 'Quarter-finals',
      'Semi-finals': 'Semi-finals',
      'Final': 'Final',
    };
    const mapTR: Record<string,string> = {
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
  return (
    <div className="kit" style={{ marginBottom: 12 }}>
      <label>
        {t?.league ?? 'League'}
        <select
          className="select"
          value={league}
          onChange={(e) => onChange({ league: e.target.value })}
        >
          {FD_LEAGUES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        {t?.season ?? 'Season'}
        <select
          className="select"
          value={season}
          onChange={(e) => onChange({ season: e.target.value })}
        >
          {['2025', '2024', '2023'].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </label>

      <label>
        {t?.round ?? 'Round'}
        <select
          className="select"
          value={round}
          onChange={(e) => onChange({ round: e.target.value })}
        >
          {rounds.map((r, i) => (
            <option key={String(r) + '-' + i} value={String(r)}>
              {displayRound(league, String(r), t)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
