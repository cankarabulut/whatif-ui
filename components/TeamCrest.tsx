'use client';

const PALETTE = [
  '#2563eb', '#0891b2', '#7c3aed', '#db2777',
  '#dc2626', '#ea580c', '#ca8a04', '#16a34a',
  '#059669', '#475569',
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function monogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type Props = {
  url?: string | null;
  tla?: string | null;
  name: string;
  size?: number;
};

export default function TeamCrest({ url, tla, name, size = 20 }: Props) {
  const style = { width: size, height: size };

  if (url) {
    return (
      <span className="crest" style={style} aria-hidden="true">
        <img src={url} alt="" loading="lazy" />
      </span>
    );
  }

  const label = (tla && tla.length <= 3 ? tla : monogram(name)).slice(0, 3);
  const color = PALETTE[hashString(name) % PALETTE.length];
  return (
    <span
      className="crest fallback"
      style={{ ...style, background: color, fontSize: Math.max(9, size * 0.42) }}
      aria-hidden="true"
    >
      {label}
    </span>
  );
}
