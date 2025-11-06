'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchStandings, fetchFixtures, fetchRounds, DEFAULTS } from '../lib/api';
import StandingsTable from '../components/StandingsTable';
import FixturesList, { type Prediction } from '../components/FixturesList';
import LeaguePicker from '../components/LeaguePicker';

type TableRow = {
  rank: number;
  team: string;
  played: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
};

const STR = {
  tr: {
    league: 'Lig',
    season: 'Sezon',
    round: 'Hafta',
    fixtures: 'Maçlar',
    standings: 'Puan Durumu',
    only_round: 'Sadece seçili haftanın maçları listelenir.',
    reset: 'Tahminleri Sıfırla',
    loading: 'Yükleniyor…',
    no_standings: 'Puan durumu yok.',
    no_fixtures: 'Seçili hafta için maç bulunamadı.',
  },
  en: {
    league: 'League',
    season: 'Season',
    round: 'Round',
    fixtures: 'Fixtures',
    standings: 'Standings',
    only_round: '{STR[lang].only_round}',
    reset: 'Reset Predictions',
    loading: '{STR[lang].loading}',
    no_standings: 'No standings.',
    no_fixtures: 'No fixtures for selected round.',
  }
};

export default function HomePage() {

  const [lang, setLang] = useState<'tr'|'en'>('tr');
// Load persisted language
useEffect(() => {
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'tr' || saved === 'en') setLang(saved);
  } catch {}
}, []);

  const [league, setLeague] = useState<string>(DEFAULTS.league);
  const [season, setSeason] = useState<string>(DEFAULTS.season);
  const [round, setRound] = useState<string>('');
  const [roundOptions, setRoundOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [standings, setStandings] = useState<any>(null);
  const [fixtures, setFixtures] = useState<any>(null);
  const [pred, setPred] = useState<Record<string|number, Prediction>>({});

  const title = useMemo(() => `${league} ${season}`, [league, season]);
  const currentYear = new Date().getFullYear().toString();

  // Load rounds and select default round (active for current year, else last)
  useEffect(() => {
    (async () => {
      try {
        const r = await fetchRounds({ league, season });
        const rounds = Array.isArray(r?.data?.rounds) ? r.data.rounds.map((x: any) => String(x.round)) : [];
        setRoundOptions(rounds);
        if (rounds.length > 0) {
          if (season === currentYear) {
            const active = r?.data?.active;
            setRound(String(active ?? rounds[rounds.length-1]));
          } else {
            setRound(String(rounds[rounds.length-1]));
          }
        } else {
          setRound('');
        }
      } catch (e) {
        setRoundOptions([]);
      }
    })();
  }, [league, season]);

  // Load standings & fixtures (selected round only) + strict round filter
  async function loadData() {
    setError('');
    setLoading(true);
    try {
      const [s, f] = await Promise.all([
        fetchStandings({ league, season }),
        fetchFixtures({ league, season, round: round || undefined }),
      ]);
      setStandings(s.data);
      const all = (f.data?.matches || []);
      const rr = String(round || '');
      const only = all.filter((m:any) => {
        const r = m.round ?? m.matchday ?? m.league?.round;
        if (r == null) return true;
        const rs = String(r);
        return rs === rr || rs.endsWith(' ' + rr) || rs.endsWith('-'+rr) || rs.endsWith(' '+rr);
      });
      setFixtures({ ...f.data, matches: only });
      setPred({}); // reset predictions on data load
    } catch (e: any) {
      setError(e?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void loadData(); }, [league, season, round]);

  // Adjusted table from predictions (selected round only)
  const adjustedTable: TableRow[] | null = useMemo(() => {
    if (!standings?.table) return null;
    const base = standings.table as TableRow[];
    const anyPred = Object.values(pred).some(p => (p.home != null && p.away != null) || p.outcome);
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
      const editable = upper !== 'FINISHED' && upper !== 'FT';
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

    const rows = Object.values(table).sort((a,b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      return b.goalsFor - a.goalsFor;
    });
    rows.forEach((r, i) => (r.rank = i+1));
    return rows;
  }, [standings, fixtures, pred]);

  const tableToShow = adjustedTable ?? (standings?.table || []);

  return (
    <main className="two-col">
      <section className="card" style={{minHeight: '60vh'}}>
        <div className="lang-toggle" style={{marginBottom:8}}>
          <span className="small">Language / Dil:</span>
          <button className={lang==='tr'?'active':''} onClick={()=>{ setLang('tr'); try{ localStorage.setItem('lang','tr'); }catch{} }}>Türkçe</button>
          <button className={lang==='en'?'active':''} onClick={()=>{ setLang('en'); try{ localStorage.setItem('lang','en'); }catch{} }}>English</button>
        </div>
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
        t={STR[lang]} />
        {loading && <div className="small">{STR[lang].loading}</div>}
        {error && <div className="small" style={{color:'#ffb4b4'}}>{error}</div>}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <h2 style={{margin:0}}>{STR[lang].fixtures} — {title}{round ? ` (${STR[lang].round} ${round})` : ''}</h2>
          <button className="btn primary" onClick={()=>setPred({})}>{STR[lang].reset}</button>
        </div>
        <div className="small" style={{margin:'6px 0 12px'}}>{STR[lang].only_round}</div>
        <FixturesList
          data={fixtures?.matches || []}
          predictions={pred} t={STR[lang]}
          onPredict={(p)=>setPred(prev=>{
            const k = String(p.id);
            const np: any = { ...prev, [k]: p };
            const v = np[k];
            const empty = (v.home == null && v.away == null && !v.outcome);
            if (empty) { const { [k]:_, ...rest } = np; return rest; }
            return np;
          })}
        />
      </section>

      <section className="card" style={{minHeight: '60vh'}}>
        <h2>{STR[lang].standings} — {title}</h2>
        <StandingsTable data={tableToShow} t={STR[lang]} />
      </section>
    </main>
  );
}
