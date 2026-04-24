'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchStandings, fetchFixtures, fetchRounds, DEFAULTS, type RoundMeta } from '../lib/api';
import StandingsTable, { type Row as TableRow } from '../components/StandingsTable';
import FixturesList, { type Prediction, type Match } from '../components/FixturesList';
import LeaguePicker from '../components/LeaguePicker';
import { useLanguage } from '../lib/LanguageProvider';

function parseRoundNumber(value: unknown): number | null {
  if (value == null) return null;
  const direct = Number(value);
  if (Number.isFinite(direct)) return direct;
  const match = String(value).match(/(\d+)\s*$/);
  return match ? Number(match[1]) : null;
}

const STR = {
  tr: {
    lang: 'tr',
    league: 'Lig',
    season: 'Sezon',
    round: 'Hafta',
    fixtures: 'Fikstür',
    standings: 'Puan Durumu',
    reset: 'Tahminleri sıfırla',
    loading: 'Yükleniyor…',
    no_standings: 'Puan durumu yok.',
    no_fixtures: 'Seçili hafta için maç bulunamadı.',
    team: 'Takım', played: 'O', won: 'G', draw: 'B', lost: 'M', points: 'P', gd: 'AV',
  },
  en: {
    lang: 'en',
    league: 'League',
    season: 'Season',
    round: 'Round',
    fixtures: 'Fixtures',
    standings: 'Standings',
    reset: 'Reset predictions',
    loading: 'Loading…',
    no_standings: 'No standings.',
    no_fixtures: 'No fixtures for selected round.',
    team: 'Team', played: 'P', won: 'W', draw: 'D', lost: 'L', points: 'Pts', gd: 'GD',
  }
} as const;

function Skeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton skeleton-row" />
      ))}
    </div>
  );
}

export default function HomePage() {
  const { lang } = useLanguage();
  const [league, setLeague] = useState<string>(DEFAULTS.league);
  const [season, setSeason] = useState<string>(DEFAULTS.season);
  const [round, setRound] = useState<string>('');
  const [roundOptions, setRoundOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [standings, setStandings] = useState<any>(null);
  const [fixtures, setFixtures] = useState<any>(null);
  const [pred, setPred] = useState<Record<string | number, Prediction>>({});

  const title = useMemo(() => `${league} · ${season}`, [league, season]);
  const currentYear = new Date().getFullYear().toString();

  useEffect(() => {
    (async () => {
      try {
        const r = await fetchRounds({ league, season });
        const rounds = Array.isArray(r?.data?.rounds)
          ? r.data.rounds.map((x: RoundMeta) => String(x.round))
          : [];
        setRoundOptions(rounds);

        if (rounds.length > 0) {
          if (season === currentYear) {
            const active = r?.data?.active;
            setRound(String(active ?? rounds[rounds.length - 1]));
          } else {
            setRound(String(rounds[rounds.length - 1]));
          }
        } else {
          setRound('');
        }
      } catch {
        setRoundOptions([]);
        setRound('');
      }
    })();
  }, [league, season, currentYear]);

  async function loadData() {
    setError('');
    setLoading(true);
    try {
      const [s, f] = await Promise.all([
        fetchStandings({ league, season }),
        fetchFixtures({ league, season, round: round || undefined }),
      ]);
      setStandings(s.data);

      const all = (f.data?.matches || []) as Array<Record<string, unknown>>;
      const selectedRound = parseRoundNumber(round);
      const only = all.filter((m) => {
        if (selectedRound == null) return true;
        const matchRound = parseRoundNumber(
          (m as any).round ?? (m as any).matchday ?? (m as any).league?.round
        );
        return matchRound == null ? true : matchRound === selectedRound;
      });
      setFixtures({ ...f.data, matches: only });
      setPred({});
    } catch (e: any) {
      setError(e?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void loadData(); }, [league, season, round]);

  const adjustedTable: TableRow[] | null = useMemo(() => {
    if (!standings?.table) return null;
    const base = standings.table as TableRow[];
    const anyPred = Object.values(pred).some((p) => (p.home != null && p.away != null) || p.outcome);
    if (!anyPred) return null;

    const table: Record<string, TableRow> = {};
    for (const row of base) table[row.team] = { ...row };

    function applyResult(home: string, away: string, hs: number, as: number) {
      const h = table[home]; const a = table[away];
      if (!h || !a) return;
      h.played += 1; a.played += 1;
      h.goalsFor += hs; h.goalsAgainst += as; h.goalDiff = h.goalsFor - h.goalsAgainst;
      a.goalsFor += as; a.goalsAgainst += hs; a.goalDiff = a.goalsFor - a.goalsAgainst;
      if (hs > as) { h.won += 1; h.points += 3; a.lost += 1; }
      else if (hs < as) { a.won += 1; a.points += 3; h.lost += 1; }
      else { h.draw += 1; a.draw += 1; h.points += 1; a.points += 1; }
    }

    const matches = fixtures?.matches || [];
    for (const m of matches) {
      const upper = String(m.status || '').toUpperCase();
      const editable = !['FINISHED', 'FT', 'AET', 'PEN'].includes(upper);
      const p = pred[String(m.id)];
      if (!editable || !p) continue;

      let hs = p.home, as = p.away;
      if ((hs == null || as == null) && p.outcome) {
        if (p.outcome === 'H') { hs = 1; as = 0; }
        else if (p.outcome === 'A') { hs = 0; as = 1; }
        else { hs = 0; as = 0; }
      }
      if (hs != null && as != null) applyResult(m.home, m.away, hs, as);
    }

    const rows = Object.values(table).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      return b.goalsFor - a.goalsFor;
    });
    rows.forEach((r, i) => (r.rank = i + 1));
    return rows;
  }, [standings, fixtures, pred]);

  const tableToShow = adjustedTable ?? (standings?.table || []);
  const t = STR[lang];

  return (
    <main className="two-col">
      <section className="card" style={{ minHeight: '60vh' }}>
        <div className="filter-bar">
          <LeaguePicker
            league={league}
            season={season}
            round={round}
            rounds={roundOptions.length ? roundOptions : (round ? [round] : [])}
            onChange={(next) => {
              if (next.league !== undefined) setLeague(next.league);
              if (next.season !== undefined) setSeason(next.season);
              if (next.round !== undefined) setRound(next.round);
            }}
            t={t}
          />
          <div className="actions">
            <button
              className="btn"
              onClick={() => setPred({})}
              disabled={Object.keys(pred).length === 0}
              title={t.reset}
            >{t.reset}</button>
          </div>
        </div>

        <div className="row-head">
          <h2>{t.fixtures}</h2>
          <span className="small">{title}</span>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <Skeleton rows={8} />
        ) : (
          <FixturesList
            data={(fixtures?.matches || []) as Match[]}
            predictions={pred}
            t={t}
            onPredict={(p) => setPred((prev) => {
              const k = String(p.id);
              const np: any = { ...prev, [k]: p };
              const v = np[k];
              const empty = (v.home == null && v.away == null && !v.outcome);
              if (empty) { const { [k]: _, ...rest } = np; return rest; }
              return np;
            })}
          />
        )}
      </section>

      <section className="card">
        <div className="row-head">
          <h2>{t.standings}</h2>
          <span className="small">{title}</span>
        </div>
        {loading ? <Skeleton rows={10} /> : <StandingsTable data={tableToShow} league={league} t={t} />}
      </section>
    </main>
  );
}
