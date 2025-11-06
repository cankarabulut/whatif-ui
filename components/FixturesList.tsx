'use client';

export type Prediction = {
  id: string|number;
  home: number|null;
  away: number|null;
  outcome?: 'H'|'D'|'A'; // 1 X 2
};

type Match = {
  id: number | string;
  utcDate: string;
  status: string;
  home: string;
  away: string;
  round?: any;
  score?: any;
};

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
  if (!data?.length) return <div className="small">{t?.no_fixtures || 'No fixtures for selected round.'}</div>;

  function setOutcome(id: string|number, val: 'H'|'D'|'A') {
    const prev = predictions[String(id)] || { id, home: null, away: null, outcome: undefined };
    // toggle off
    const outcome = prev.outcome === val ? undefined : val;
    onPredict({ ...prev, outcome });
  }

  return (
    <div style={{display:'grid', gap: 10}}>
      {data.map((m) => {
        const k = String(m.id);
        const p = predictions[k] || { id: m.id, home: null, away: null, outcome: undefined };
        const upper = String(m.status).toUpperCase();
        const editable = upper !== 'FINISHED' && upper !== 'FT';

        const dt = new Date(m.utcDate);
        const time = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(dt);

        return (
          <div className="match-row" key={k}>
            <div className="match-time">{time} · {upper}</div>
            <div className="match-teams">
              <div className={"team" + (m.home.length > 18 ? " small" : "")} title={m.home}>{m.home}</div>
              <div className={"team" + (m.away.length > 18 ? " small" : "")} title={m.away}>{m.away}</div>
            </div>

            <div className="controls">
              <div className="outcome">
                <button className={p.outcome==='H' ? 'active' : ''} disabled={!editable} onClick={()=>setOutcome(m.id, 'H')}>1</button>
                <button className={p.outcome==='D' ? 'active' : ''} disabled={!editable} onClick={()=>setOutcome(m.id, 'D')}>X</button>
                <button className={p.outcome==='A' ? 'active' : ''} disabled={!editable} onClick={()=>setOutcome(m.id, 'A')}>2</button>
              </div>
              <input className="score-box" type="number" min={0} placeholder="HG"
                value={p.home ?? ''} disabled={!editable}
                onChange={e=>onPredict({ ...p, home: e.target.value===''?null:Number(e.target.value) })} />
              <span>-</span>
              <input className="score-box" type="number" min={0} placeholder="AG"
                value={p.away ?? ''} disabled={!editable}
                onChange={e=>onPredict({ ...p, away: e.target.value===''?null:Number(e.target.value) })} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
