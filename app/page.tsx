'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchFixtures, fetchRounds, DEFAULTS, type RoundMeta } from '../lib/api';
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
  const [fixtures, setFixtures] = useState<any>(null);
  const [allFixtures, setAllFixtures] = useState<Match[]>([]);
  const [pred, setPred] = useState<Record<string | number, Prediction>>({});

  const title = useMemo(() => `${league} · ${season}`, [league, season]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetchRounds({ league, season });
        const rounds = Array.isArray(r?.data?.rounds)
          ? r.data.rounds.map((x: RoundMeta) => String(x.round))
          : [];
        setRoundOptions(rounds);

        if (rounds.length > 0) {
          const active = r?.data?.active;
          setRound(String(active ?? rounds[rounds.length - 1]));
        } else {
          setRound('');
        }
      } catch {
        setRoundOptions([]);
        setRound('');
      }
    })();
  }, [league, season]);

  async function loadData() {
    setError('');
    setLoading(true);
    try {
      const [f, allResponse] = await Promise.all([
        fetchFixtures({ league, season, round: round || undefined }),
        fetchFixtures({ league, season }),
      ]);

      const selectedMatches = (f.data?.matches || []) as Array<Record<string, unknown>>;
      const selectedRound = parseRoundNumber(round);
      const only = selectedMatches.filter((m) => {
        if (selectedRound == null) return true;
        const matchRound = parseRoundNumber(
          (m as any).round ?? (m as any).matchday ?? (m as any).league?.round
        );
        return matchRound == null ? true : matchRound === selectedRound;
      });
      setFixtures({ ...f.data, matches: only });
      setAllFixtures(((allResponse.data?.matches || []) as Match[]));
      setPred({});
    } catch (e: any) {
      setError(e?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void loadData(); }, [league, season, round]);

  const actualTable: TableRow[] = useMemo(() => {
    const selectedRound = parseRoundNumber(round);
    const table: Record<string, TableRow> = {};

    function ensureTeam(name: string, crest?: string | null, tla?: string | null, shortName?: string | null) {
      if (!name || table[name]) return;
      table[name] = {
        rank: 0,
        team: name,
        played: 0,
        won: 0,
        draw: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDiff: 0,
        crest: crest ?? null,
        tla: tla ?? null,
        shortName: shortName ?? null,
      };
    }

    function applyResult(home: string, away: string, hs: number, as: number, sign = 1) {
      const h = table[home]; const a = table[away];
      if (!h || !a) return;
      h.played += sign; a.played += sign;
      h.goalsFor += hs * sign; h.goalsAgainst += as * sign; h.goalDiff = h.goalsFor - h.goalsAgainst;
      a.goalsFor += as * sign; a.goalsAgainst += hs * sign; a.goalDiff = a.goalsFor - a.goalsAgainst;
      if (hs > as) { h.won += sign; h.points += 3 * sign; a.lost += sign; }
      else if (hs < as) { a.won += sign; a.points += 3 * sign; h.lost += sign; }
      else { h.draw += sign; a.draw += sign; h.points += sign; a.points += sign; }
    }

    for (const m of allFixtures) {
      ensureTeam(m.home, m.homeCrest, m.homeTla, m.homeShort);
      ensureTeam(m.away, m.awayCrest, m.awayTla, m.awayShort);
    }

    for (const m of allFixtures) {
      const matchRound = parseRoundNumber((m as any).round ?? (m as any).matchday ?? (m as any).league?.round);
      if (selectedRound != null && matchRound != null && matchRound > selectedRound) continue;
      const upper = String(m.status || '').toUpperCase();
      const finished = ['FINISHED', 'FT', 'AET', 'PEN'].includes(upper);
      const ftH =
        m?.score?.fullTime?.home ??
        m?.score?.ft?.home ??
        m?.score?.homeTeam ??
        m?.score?.home ??
        m?.result?.home ??
        null;
      const ftA =
        m?.score?.fullTime?.away ??
        m?.score?.ft?.away ??
        m?.score?.awayTeam ??
        m?.score?.away ??
        m?.result?.away ??
        null;
      if (finished && ftH != null && ftA != null) applyResult(m.home, m.away, Number(ftH), Number(ftA));
    }

    const rows = Object.values(table).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      return b.goalsFor - a.goalsFor;
    });
    rows.forEach((r, i) => (r.rank = i + 1));
    return rows;
  }, [allFixtures, round]);

  const adjustedTable: TableRow[] | null = useMemo(() => {
    const base = actualTable;
    if (!base.length) return null;
    const anyPred = Object.values(pred).some((p) => (p.home != null && p.away != null) || p.outcome);
    if (!anyPred) return null;

    const table: Record<string, TableRow> = {};
    for (const row of base) table[row.team] = { ...row };

    function applyResult(home: string, away: string, hs: number, as: number, sign = 1) {
      const h = table[home]; const a = table[away];
      if (!h || !a) return;
      h.played += sign; a.played += sign;
      h.goalsFor += hs * sign; h.goalsAgainst += as * sign; h.goalDiff = h.goalsFor - h.goalsAgainst;
      a.goalsFor += as * sign; a.goalsAgainst += hs * sign; a.goalDiff = a.goalsFor - a.goalsAgainst;
      if (hs > as) { h.won += sign; h.points += 3 * sign; a.lost += sign; }
      else if (hs < as) { a.won += sign; a.points += 3 * sign; h.lost += sign; }
      else { h.draw += sign; a.draw += sign; h.points += sign; a.points += sign; }
    }

    const matches = fixtures?.matches || [];
    for (const m of matches) {
      const p = pred[String(m.id)];
      if (!p) continue;

      const upper = String(m.status || '').toUpperCase();
      const finished = ['FINISHED', 'FT', 'AET', 'PEN'].includes(upper);
      const ftH =
        m?.score?.fullTime?.home ??
        m?.score?.ft?.home ??
        m?.score?.homeTeam ??
        m?.score?.home ??
        m?.result?.home ??
        null;
      const ftA =
        m?.score?.fullTime?.away ??
        m?.score?.ft?.away ??
        m?.score?.awayTeam ??
        m?.score?.away ??
        m?.result?.away ??
        null;

      let hs = p.home, as = p.away;
      if ((hs == null || as == null) && p.outcome) {
        if (p.outcome === 'H') { hs = 1; as = 0; }
        else if (p.outcome === 'A') { hs = 0; as = 1; }
        else { hs = 0; as = 0; }
      }
      if (hs != null && as != null) {
        if (finished && ftH != null && ftA != null) {
          applyResult(m.home, m.away, Number(ftH), Number(ftA), -1);
        }
        applyResult(m.home, m.away, hs, as);
      }
    }

    const rows = Object.values(table).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      return b.goalsFor - a.goalsFor;
    });
    rows.forEach((r, i) => (r.rank = i + 1));
    return rows;
  }, [actualTable, fixtures, pred]);

  const tableToShow = adjustedTable ?? actualTable;
  const previousRankByTeam = useMemo(() => {
    if (!adjustedTable) return undefined;
    return Object.fromEntries(actualTable.map((row) => [row.team, row.rank]));
  }, [actualTable, adjustedTable]);
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
        {loading ? (
          <Skeleton rows={10} />
        ) : (
          <StandingsTable
            data={tableToShow}
            league={league}
            t={t}
            previousRankByTeam={previousRankByTeam}
          />
        )}
      </section>
    </main>
  );
}
