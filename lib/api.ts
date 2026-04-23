export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
export const DEFAULTS = {
  league: process.env.NEXT_PUBLIC_DEFAULT_LEAGUE || 'PL',
  season: process.env.NEXT_PUBLIC_DEFAULT_SEASON || '2025',
};

export async function fetchStandings(params: { league: string; season?: string }) {
  const url = new URL(`${API_BASE}/api/v1/standings`);
  url.searchParams.set('league', params.league);
  if (params.season) url.searchParams.set('season', params.season);
  url.searchParams.set('provider', 'fd');
  const r = await fetch(url.toString(), { cache: 'no-store' });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function fetchFixtures(params: { league: string; season?: string; round?: string }) {
  const url = new URL(`${API_BASE}/api/v1/fixtures`);
  url.searchParams.set('league', params.league);
  if (params.season) url.searchParams.set('season', params.season);
  if (params.round) url.searchParams.set('round', params.round);
  url.searchParams.set('provider', 'fd');
  const r = await fetch(url.toString(), { cache: 'no-store' });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function fetchRounds(params: { league: string; season?: string }) {
  const url = new URL(`${API_BASE}/api/v1/rounds`);
  url.searchParams.set('league', params.league);
  if (params.season) url.searchParams.set('season', params.season);
  url.searchParams.set('provider', 'fd');
  const r = await fetch(url.toString(), { cache: 'no-store' });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
