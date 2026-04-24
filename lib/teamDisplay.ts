export function isFinishedStatus(status?: string): boolean {
  const s = String(status || '').toUpperCase();
  return s === 'FINISHED' || s === 'FT' || s === 'AET' || s === 'PEN';
}

export function isLiveStatus(status?: string): boolean {
  const s = String(status || '').toUpperCase();
  return s === 'IN_PLAY' || s === 'LIVE' || s === 'PAUSED' || s === 'HT';
}

export function shortenTeam(name: string, tla?: string | null, shortName?: string | null): string {
  if (tla && tla.length <= 4) return tla;
  if (shortName && shortName.length <= 14) return shortName;
  return name;
}

export function formatTime(utcDate: string, locale: string): string {
  const dt = new Date(utcDate);
  if (Number.isNaN(dt.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(dt);
}

export function formatDateHeader(utcDate: string, locale: string): string {
  const dt = new Date(utcDate);
  if (Number.isNaN(dt.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(dt);
}

export function dayKey(utcDate: string): string {
  const dt = new Date(utcDate);
  if (Number.isNaN(dt.getTime())) return '';
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

export function groupByDate<T extends { utcDate: string }>(matches: T[]): Array<{ key: string; items: T[] }> {
  const map = new Map<string, T[]>();
  for (const m of matches) {
    const k = dayKey(m.utcDate);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(m);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, items]) => ({ key, items }));
}
