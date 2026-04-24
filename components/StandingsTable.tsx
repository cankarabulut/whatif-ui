'use client';

import TeamCrest from './TeamCrest';
import { getZoneForRank } from '../lib/zones';

export type Row = {
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
  crest?: string | null;
  tla?: string | null;
  shortName?: string | null;
};

export default function StandingsTable({
  data,
  league,
  t,
  previousRankByTeam,
}: {
  data: Row[];
  league: string;
  t?: any;
  previousRankByTeam?: Record<string, number>;
}) {
  if (!data || data.length === 0) {
    return <div className="small">{t?.no_standings || 'No standings.'}</div>;
  }
  const H = (k: string, d: string) => t?.[k] || d;
  const totalTeams = data.length;

  const hasAnyZone = data.some((r) => getZoneForRank(league, r.rank, totalTeams) !== null);

  return (
    <div>
      <table className="standings">
        <colgroup>
          <col className="c-rank" />
          <col className="c-team" />
          <col className="c-num" />
          <col className="c-num" />
          <col className="c-num" />
          <col className="c-num" />
          <col className="c-diff" />
          <col className="c-pts" />
        </colgroup>
        <thead>
          <tr>
            <th>#</th>
            <th className="team-h">{H('team', 'Team')}</th>
            <th title={t?.lang === 'tr' ? 'Oynadığı' : 'Played'}>{H('played', 'P')}</th>
            <th title={t?.lang === 'tr' ? 'Galibiyet' : 'Won'}>{H('won', 'W')}</th>
            <th title={t?.lang === 'tr' ? 'Beraberlik' : 'Draw'}>{H('draw', 'D')}</th>
            <th title={t?.lang === 'tr' ? 'Mağlubiyet' : 'Lost'}>{H('lost', 'L')}</th>
            <th title={t?.lang === 'tr' ? 'Averaj' : 'Goal Diff'}>{H('gd', 'GD')}</th>
            <th title={t?.lang === 'tr' ? 'Puan' : 'Points'}>{H('points', 'Pts')}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, idx) => {
            const zone = getZoneForRank(league, r.rank, totalTeams);
            const diffClass = r.goalDiff > 0 ? 'pos' : r.goalDiff < 0 ? 'neg' : '';
            const diffLabel = r.goalDiff > 0 ? `+${r.goalDiff}` : String(r.goalDiff);
            const tla = r.tla && r.tla.length <= 4 ? r.tla : null;
            const previousRank = previousRankByTeam?.[r.team];
            const movedUp = previousRank != null && r.rank < previousRank;
            const movedDown = previousRank != null && r.rank > previousRank;

            return (
              <tr key={`${idx}-${r.team}`}>
                <td className={'c-rank' + (zone ? ' zone-' + zone : '')}>
                  <span className="rank-bar" aria-hidden="true" />
                  <span className="rank-value">{r.rank}</span>
                  {movedUp && <span className="rank-move up" aria-label={t?.lang === 'tr' ? 'Yukarı çıktı' : 'Moved up'}>↑</span>}
                  {movedDown && <span className="rank-move down" aria-label={t?.lang === 'tr' ? 'Aşağı düştü' : 'Moved down'}>↓</span>}
                </td>
                <td className="c-team">
                  <div className="team-inner">
                    <TeamCrest url={r.crest} tla={r.tla} name={r.team} size={20} />
                    {tla && <span className="tla">{tla}</span>}
                    <span className="full-name" title={r.team}>
                      {r.shortName || r.team}
                    </span>
                  </div>
                </td>
                <td>{r.played}</td>
                <td>{r.won}</td>
                <td>{r.draw}</td>
                <td>{r.lost}</td>
                <td className={'c-diff ' + diffClass}>{diffLabel}</td>
                <td className="c-pts">{r.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {hasAnyZone && (
        <div className="zone-legend">
          <span><span className="swatch" style={{ background: 'var(--brand)' }} />{t?.lang === 'tr' ? 'Şampiyonlar Ligi' : 'Champions League'}</span>
          <span><span className="swatch" style={{ background: 'var(--success)' }} />{t?.lang === 'tr' ? 'Avrupa Ligi' : 'Europa League'}</span>
          <span><span className="swatch" style={{ background: 'var(--draw)' }} />{t?.lang === 'tr' ? 'Konferans Ligi' : 'Conference League'}</span>
          <span><span className="swatch" style={{ background: 'var(--live)', opacity: 0.7 }} />{t?.lang === 'tr' ? 'Küme düşme' : 'Relegation'}</span>
        </div>
      )}
    </div>
  );
}
