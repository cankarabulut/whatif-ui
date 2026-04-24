export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
export const DEFAULTS = {
  league: process.env.NEXT_PUBLIC_DEFAULT_LEAGUE || 'PL',
  season: process.env.NEXT_PUBLIC_DEFAULT_SEASON || '2025',
};

export type ApiEnvelope<T> = { ok: true; data: T };
export type RoundMeta = { round: number; finished: number; upcoming: number; total: number };
export type RoundsPayload = {
  league: string;
  season: string | null;
  provider: 'fd' | 'tsdb';
  providerRequested?: 'fd' | 'tsdb';
  providerFallback?: boolean;
  seasonActive: boolean;
  active: number | null;
  rounds: RoundMeta[];
};

async function getJsonOrError<T>(url: URL): Promise<ApiEnvelope<T>> {
  const r = await fetch(url.toString(), { cache: 'no-store' });
  const body = await r.json().catch(() => null);
  if (!r.ok || !body?.ok) {
    const message = body?.error || `Request failed (${r.status})`;
    throw new Error(message);
  }
  return body as ApiEnvelope<T>;
}

export async function fetchStandings(params: { league: string; season?: string }) {
  const url = new URL(`${API_BASE}/api/v1/standings`);
  url.searchParams.set('league', params.league);
  if (params.season) url.searchParams.set('season', params.season);
  return getJsonOrError<{ table: unknown[] }>(url);
}

export async function fetchFixtures(params: { league: string; season?: string; round?: string }) {
  const url = new URL(`${API_BASE}/api/v1/fixtures`);
  url.searchParams.set('league', params.league);
  if (params.season) url.searchParams.set('season', params.season);
  if (params.round) url.searchParams.set('round', params.round);
  return getJsonOrError<{ matches: unknown[] }>(url);
}

export async function fetchRounds(params: { league: string; season?: string }) {
  const url = new URL(`${API_BASE}/api/v1/rounds`);
  url.searchParams.set('league', params.league);
  if (params.season) url.searchParams.set('season', params.season);
  return getJsonOrError<RoundsPayload>(url);
}
