'use client';

import { useEffect, useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import {
  fetchStandings,
  fetchFixtures,
  fetchRounds,
  DEFAULTS,
  type StandingsRow,
} from '@/lib/api';
import { getLeague } from '@/lib/leagues';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AppHeader } from '@/components/AppHeader';
import LeaguePicker from '@/components/LeaguePicker';
import { RoundNav } from '@/components/RoundNav';
import FixturesList, { type Prediction } from '@/components/FixturesList';
import StandingsTable from '@/components/StandingsTable';
import type { Lang } from '@/components/LanguageToggle';

export default function HomePage() {
  const [lang, setLang] = useState<Lang>('tr');
  const [league, setLeague] = useState<string>(DEFAULTS.league);
  const [season, setSeason] = useState<string>(DEFAULTS.season);
  const [round, setRound] = useState<string>('');
  const [roundOptions, setRoundOptions] = useState<string[]>([]);
  const [activeRound, setActiveRound] = useState<number | null>(null);
  const [seasonActive, setSeasonActive] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [standings, setStandings] = useState<{ table?: StandingsRow[] } | null>(null);
  const [fixtures, setFixtures] = useState<any>(null);
  const [pred, setPred] = useState<Record<string | number, Prediction>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lang');
      if (saved === 'tr' || saved === 'en') setLang(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('lang', lang);
    } catch {}
  }, [lang]);

  // Round list + default seçimi API activeRound'a göre
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetchRounds({ league, season });
        if (cancelled) return;
        const list = Array.isArray(r?.data?.rounds)
          ? r.data!.rounds.map((x) => String(x.round))
          : [];
        const ar = r?.data?.activeRound ?? null;
        setRoundOptions(list);
        setActiveRound(ar);
        setSeasonActive(Boolean(r?.data?.seasonActive));

        if (list.length === 0) {
          setRound('');
          return;
        }
        if (ar != null && list.includes(String(ar))) {
          setRound(String(ar));
        } else {
          setRound(list[list.length - 1]);
        }
      } catch {
        if (cancelled) return;
        setRoundOptions([]);
        setActiveRound(null);
        setSeasonActive(false);
        setRound('');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [league, season]);

  async function loadData() {
    setError('');
    setLoading(true);
    try {
      const [s, f] = await Promise.all([
        fetchStandings({ league, season }),
        fetchFixtures({ league, season, round: round || undefined }),
      ]);
      setStandings(s.data ?? null);

      const all = f.data?.matches || [];
      const rr = String(round || '');
      const only = rr
        ? all.filter((m: any) => {
            const r = m.round ?? m.matchday ?? m.league?.round;
            if (r == null) return true;
            const rs = String(r);
            return rs === rr || rs.endsWith(` ${rr}`) || rs.endsWith(`-${rr}`);
          })
        : all;
      setFixtures({ ...f.data, matches: only });
      setPred({});
    } catch (e: any) {
      setError(e?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (round) void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [league, season, round]);

  const adjustedTable: StandingsRow[] | null = useMemo(() => {
    if (!standings?.table) return null;
    const base = standings.table;
    const anyPred = Object.values(pred).some(
      (p) => (p.home != null && p.away != null) || p.outcome
    );
    if (!anyPred) return null;

    const table: Record<string, StandingsRow> = {};
    for (const row of base) table[row.team] = { ...row };

    function applyResult(home: string, away: string, hs: number, as: number) {
      const h = table[home];
      const a = table[away];
      if (!h || !a) return;
      h.played += 1;
      a.played += 1;
      h.goalsFor += hs;
      h.goalsAgainst += as;
      h.goalDiff = h.goalsFor - h.goalsAgainst;
      a.goalsFor += as;
      a.goalsAgainst += hs;
      a.goalDiff = a.goalsFor - a.goalsAgainst;
      if (hs > as) {
        h.won += 1;
        h.points += 3;
        a.lost += 1;
      } else if (hs < as) {
        a.won += 1;
        a.points += 3;
        h.lost += 1;
      } else {
        h.draw += 1;
        a.draw += 1;
        h.points += 1;
        a.points += 1;
      }
    }

    const matches: any[] = fixtures?.matches || [];
    for (const m of matches) {
      const upper = String(m.status || '').toUpperCase();
      const finished = ['FINISHED', 'FT', 'AET', 'PEN'].includes(upper);
      const p = pred[String(m.id)];
      if (finished || !p) continue;

      let hs = p.home;
      let as = p.away;
      if ((hs == null || as == null) && p.outcome) {
        if (p.outcome === 'H') {
          hs = 1;
          as = 0;
        } else if (p.outcome === 'A') {
          hs = 0;
          as = 1;
        } else {
          hs = 0;
          as = 0;
        }
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

  const tableToShow = adjustedTable ?? standings?.table ?? [];
  const hasPredictions = useMemo(
    () =>
      Object.values(pred).some(
        (p) => (p.home != null && p.away != null) || p.outcome
      ),
    [pred]
  );

  const meta = getLeague(league);

  const FixturesPane = (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <RoundNav
          league={league}
          round={round}
          rounds={roundOptions}
          activeRound={activeRound}
          lang={lang}
          onChange={setRound}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPred({})}
          disabled={!hasPredictions}
          className="gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {lang === 'tr' ? 'Tahminleri sıfırla' : 'Reset predictions'}
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}
      {loading && !fixtures && (
        <div className="rounded-xl border border-border bg-surface px-3 py-10 text-center text-sm text-fg-muted">
          {lang === 'tr' ? 'Yükleniyor…' : 'Loading…'}
        </div>
      )}

      <FixturesList
        data={fixtures?.matches || []}
        predictions={pred}
        lang={lang}
        onPredict={(p) =>
          setPred((prev) => {
            const k = String(p.id);
            const np: Record<string, Prediction> = { ...prev, [k]: p };
            const v = np[k];
            const empty = v.home == null && v.away == null && !v.outcome;
            if (empty) {
              const { [k]: _, ...rest } = np;
              return rest;
            }
            return np;
          })
        }
      />
    </section>
  );

  const StandingsPane = (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-subtle">
          {lang === 'tr' ? 'Puan Durumu' : 'Standings'}
        </h2>
        {hasPredictions && (
          <span className="text-2xs font-semibold uppercase tracking-wider text-brand">
            {lang === 'tr' ? 'Tahmin modu' : 'Prediction mode'}
          </span>
        )}
      </div>
      <StandingsTable data={tableToShow} lang={lang} league={league} />
    </section>
  );

  return (
    <>
      <AppHeader
        league={league}
        season={season}
        round={round}
        seasonActive={seasonActive}
        lang={lang}
        onLangChange={setLang}
      />

      <main className="container py-5 md:py-8 space-y-5">
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
          <LeaguePicker
            league={league}
            season={season}
            lang={lang}
            onChange={(next) => {
              if (next.league !== undefined) setLeague(next.league);
              if (next.season !== undefined) setSeason(next.season);
            }}
          />
        </div>

        {/* Desktop two-column, mobile tabs */}
        <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] gap-5 items-start">
          {FixturesPane}
          {StandingsPane}
        </div>

        <div className="lg:hidden">
          <Tabs defaultValue="fixtures">
            <TabsList className="w-full">
              <TabsTrigger value="fixtures" className="flex-1">
                {lang === 'tr' ? 'Maçlar' : 'Fixtures'}
              </TabsTrigger>
              <TabsTrigger value="standings" className="flex-1">
                {lang === 'tr' ? 'Puan Durumu' : 'Standings'}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="fixtures">{FixturesPane}</TabsContent>
            <TabsContent value="standings">{StandingsPane}</TabsContent>
          </Tabs>
        </div>

        <footer className="pt-6 text-center text-2xs uppercase tracking-wider text-fg-subtle">
          {meta?.name ?? league} · {season} · powered by Football-Data.org
        </footer>
      </main>
    </>
  );
}
