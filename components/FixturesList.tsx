'use client';

import { useState } from 'react';
import TeamCrest from './TeamCrest';
import {
  isFinishedStatus,
  isLiveStatus,
  formatTime,
  formatDateHeader,
  groupByDate,
  shortenTeam,
} from '../lib/teamDisplay';

export type Prediction = {
  id: string | number;
  home: number | null;
  away: number | null;
  outcome?: 'H' | 'D' | 'A';
};

export type Match = {
  id: number | string;
  utcDate: string;
  status: string;
  home: string;
  away: string;
  homeCrest?: string | null;
  awayCrest?: string | null;
  homeTla?: string | null;
  awayTla?: string | null;
  homeShort?: string | null;
  awayShort?: string | null;
  round?: any;
  score?: any;
  result?: any;
  league?: any;
};

function readScore(m: Match) {
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
  return { ftH, ftA };
}

export default function FixturesList({
  data,
  predictions,
  onPredict,
  t,
}: {
  data: Match[];
  predictions: Record<string | number, Prediction>;
  onPredict: (p: Prediction) => void;
  t?: any;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const locale = (t?.lang === 'tr' ? 'tr-TR' : 'en-GB');

  if (!data?.length) {
    return <div className="small" style={{ padding: 'var(--space-4) 0' }}>{t?.no_fixtures || 'No fixtures for selected round.'}</div>;
  }

  const groups = groupByDate(data);

  function toggleExpand(id: string, canExpand: boolean) {
    if (!canExpand) return;
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function setOutcome(match: Match, val: 'H' | 'D' | 'A') {
    const id = match.id;
    const prev = predictions[String(id)] || { id, home: null, away: null, outcome: undefined };
    const outcome = prev.outcome === val ? undefined : val;
    onPredict({ ...prev, home: null, away: null, outcome });
  }

  return (
    <div className="fixtures">
      {groups.map((group) => (
        <div key={group.key} className="fixture-group">
          <div className="date-header">{formatDateHeader(group.items[0].utcDate, locale)}</div>
          {group.items.map((m) => {
            const k = String(m.id);
            const p = predictions[k] || { id: m.id, home: null, away: null, outcome: undefined };

            const finished = isFinishedStatus(m.status);
            const live = isLiveStatus(m.status);
            const editable = true;

            const hasPrediction = !!(p.outcome || p.home != null || p.away != null);
            const isExpanded = !!expanded[k];

            const { ftH, ftA } = readScore(m);
            const time = formatTime(m.utcDate, locale);

            const homeDisplay = shortenTeam(m.home, m.homeTla, m.homeShort);
            const awayDisplay = shortenTeam(m.away, m.awayTla, m.awayShort);

            let winner: 'H' | 'A' | 'D' | null = null;
            if (finished && ftH != null && ftA != null) {
              if (ftH > ftA) winner = 'H';
              else if (ftA > ftH) winner = 'A';
              else winner = 'D';
            }

            return (
              <div
                key={k}
                className={
                  'fixture-row' +
                  (hasPrediction ? ' predicted' : '') +
                  (isExpanded ? ' expanded' : '')
                }
                onClick={() => toggleExpand(k, editable)}
                role={editable ? 'button' : undefined}
                aria-expanded={editable ? isExpanded : undefined}
              >
                <div className="fixture-time">
                  {finished ? (t?.lang === 'tr' ? 'Biten' : 'FT') : time}
                </div>

                <div
                  className={
                    'fixture-team home' +
                    (winner === 'A' ? ' dim' : winner === 'H' ? ' win' : '')
                  }
                >
                  <span className="name" title={m.home}>{homeDisplay}</span>
                  <TeamCrest url={m.homeCrest} tla={m.homeTla} name={m.home} size={22} />
                </div>

                <div className="fixture-score">
                  {finished ? (
                    <>
                      <span className="final">{ftH ?? '-'}</span>
                      <span className="sep">:</span>
                      <span className="final">{ftA ?? '-'}</span>
                    </>
                  ) : (
                    <span className="time-center">{time}</span>
                  )}
                </div>

                <div
                  className={
                    'fixture-team away' +
                    (winner === 'H' ? ' dim' : winner === 'A' ? ' win' : '')
                  }
                >
                  <TeamCrest url={m.awayCrest} tla={m.awayTla} name={m.away} size={22} />
                  <span className="name" title={m.away}>{awayDisplay}</span>
                </div>

                <div className="fixture-status">
                  {finished ? (
                    <span className="pill finished">FT</span>
                  ) : live ? (
                    <span className="pill live">{t?.lang === 'tr' ? 'CANLI' : 'LIVE'}</span>
                  ) : hasPrediction ? (
                    <span className="pill" style={{ background: 'rgba(26,79,255,0.15)', color: 'var(--brand-2)' }}>
                      {p.outcome ?? (p.home != null && p.away != null ? `${p.home}-${p.away}` : '•')}
                    </span>
                  ) : (
                    <span className="pill upcoming">{t?.lang === 'tr' ? 'TAHMİN' : 'PREDICT'}</span>
                  )}
                </div>

                {editable && isExpanded && (
                  <div className="fixture-predict" onClick={(e) => e.stopPropagation()}>
                    <div className="outcome" role="group" aria-label="1 X 2">
                      <button
                        className={p.outcome === 'H' ? 'active' : ''}
                        disabled={(p.home != null || p.away != null) && p.outcome !== 'H'}
                        onClick={() => setOutcome(m, 'H')}
                      >1</button>
                      <button
                        className={p.outcome === 'D' ? 'active' : ''}
                        disabled={(p.home != null || p.away != null) && p.outcome !== 'D'}
                        onClick={() => setOutcome(m, 'D')}
                      >X</button>
                      <button
                        className={p.outcome === 'A' ? 'active' : ''}
                        disabled={(p.home != null || p.away != null) && p.outcome !== 'A'}
                        onClick={() => setOutcome(m, 'A')}
                      >2</button>
                    </div>
                    <input
                      className="score-box"
                      type="number"
                      min={0}
                      placeholder="G"
                      disabled={!!p.outcome}
                      aria-label={(t?.lang === 'tr' ? 'Ev sahibi skor' : 'Home score')}
                      value={p.home ?? ''}
                      onChange={(e) =>
                        onPredict({ ...p, outcome: undefined, home: e.target.value === '' ? null : Number(e.target.value) })
                      }
                    />
                    <span style={{ color: 'var(--text-3)' }}>:</span>
                    <input
                      className="score-box"
                      type="number"
                      min={0}
                      placeholder="G"
                      disabled={!!p.outcome}
                      aria-label={(t?.lang === 'tr' ? 'Deplasman skor' : 'Away score')}
                      value={p.away ?? ''}
                      onChange={(e) =>
                        onPredict({ ...p, outcome: undefined, away: e.target.value === '' ? null : Number(e.target.value) })
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
