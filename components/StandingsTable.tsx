type Row = {
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

export default function StandingsTable({ data, t }: { data: Row[]; t?: any }) {
  if (!data || data.length === 0) {
    return <div className="small">{t?.no_standings || 'No standings.'}</div>;
  }
  const H = (k:string, d:string)=> t?.[k] || d;
  return (
    <div className="table-wrap">
      <table className="table-modern">
        <thead>
          <tr>
            <th>#</th>
            <th>{H('team', 'Team')}</th>
            <th>{H('played', 'P')}</th>
            <th>{H('won', 'W')}</th>
            <th>{H('draw', 'D')}</th>
            <th>{H('lost', 'L')}</th>
            <th>{H('points', 'Pts')}</th>
            <th>{H('gf', 'GF')}</th>
            <th>{H('ga', 'GA')}</th>
            <th>{H('gd', 'GD')}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, idx) => (
            <tr key={`${idx}-${r.team}`}>
              <td>{r.rank}</td>
              <td>{r.team}</td>
              <td>{r.played}</td>
              <td>{r.won}</td>
              <td>{r.draw}</td>
              <td>{r.lost}</td>
              <td>{r.points}</td>
              <td>{r.goalsFor}</td>
              <td>{r.goalsAgainst}</td>
              <td>{r.goalDiff}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
