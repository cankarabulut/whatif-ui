export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
export const DEFAULTS = {
  league: process.env.NEXT_PUBLIC_DEFAULT_LEAGUE || 'PL',
  season: process.env.NEXT_PUBLIC_DEFAULT_SEASON || '2025',
};

export type RoundInfo = {
  round: number;
  total: number;
  finished: number;
  upcoming: number;
  firstMatchUtc: string | null;
  lastMatchUtc: string | null;
};

export type RoundsResponse = {
  ok?: boolean;
  data?: {
    league: string;
    season: string | null;
    provider: string;
    seasonActive: boolean;
    activeRound: number | null;
    rounds: RoundInfo[];
  };
};

export type MatchScore = {
  fullTime?: { home?: number | null; away?: number | null };
  ft?: { home?: number | null; away?: number | null };
  home?: number | null;
  away?: number | null;
  homeTeam?: number | null;
  awayTeam?: number | null;
};

export type Match = {
  id: string | number;
  utcDate: string;
  status: string;
  home: string;
  away: string;
  round?: number | string | null;
  score?: MatchScore;
  result?: { home?: number; away?: number };
  league?: any;
};

export type FixturesResponse = {
  ok?: boolean;
  data?: {
    league?: string;
    season?: string | null;
    round?: string | number | null;
    provider?: string;
    matches?: Match[];
  };
};

export type StandingsRow = {
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

export type StandingsResponse = {
  ok?: boolean;
  data?: {
    league?: string;
    season?: string | null;
    table?: StandingsRow[];
  };
};

async function getJson<T>(url: string): Promise<T> {
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function fetchStandings(params: { league: string; season?: string }): Promise<StandingsResponse> {
  const url = new URL(`${API_BASE}/api/v1/standings`);
  url.searchParams.set('league', params.league);
  if (params.season) url.searchParams.set('season', params.season);
  url.searchParams.set('provider', 'fd');
  return getJson<StandingsResponse>(url.toString());
}

export async function fetchFixtures(params: { league: string; season?: string; round?: string }): Promise<FixturesResponse> {
  const url = new URL(`${API_BASE}/api/v1/fixtures`);
  url.searchParams.set('league', params.league);
  if (params.season) url.searchParams.set('season', params.season);
  if (params.round) url.searchParams.set('round', params.round);
  url.searchParams.set('provider', 'fd');
  return getJson<FixturesResponse>(url.toString());
}

export async function fetchRounds(params: { league: string; season?: string }): Promise<RoundsResponse> {
  const url = new URL(`${API_BASE}/api/v1/rounds`);
  url.searchParams.set('league', params.league);
  if (params.season) url.searchParams.set('season', params.season);
  url.searchParams.set('provider', 'fd');
  return getJson<RoundsResponse>(url.toString());
}
