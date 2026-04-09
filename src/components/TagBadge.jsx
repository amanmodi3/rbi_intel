// Separate palettes for dark and light modes — light mode needs darker text to stay readable
const COLOR_MAP_DARK = {
  'nbfc-orange':      { bg: 'rgba(212,175,55,0.1)',  text: '#D4AF37', border: 'rgba(212,175,55,0.22)' },
  'ecl-green':        { bg: 'rgba(16,185,129,0.1)',  text: '#10B981', border: 'rgba(16,185,129,0.22)' },
  'icaap-blue':       { bg: 'rgba(96,165,250,0.1)',  text: '#60a5fa', border: 'rgba(96,165,250,0.22)' },
  'iracp-purple':     { bg: 'rgba(167,139,250,0.1)', text: '#a78bfa', border: 'rgba(167,139,250,0.22)' },
  'capital-teal':     { bg: 'rgba(45,212,191,0.1)',  text: '#2dd4bf', border: 'rgba(45,212,191,0.22)' },
  'provision-red':    { bg: 'rgba(248,113,113,0.1)', text: '#f87171', border: 'rgba(248,113,113,0.22)' },
  'liquidity-cyan':   { bg: 'rgba(56,189,248,0.1)',  text: '#38bdf8', border: 'rgba(56,189,248,0.22)' },
  'governance-amber': { bg: 'rgba(251,191,36,0.1)',  text: '#fbbf24', border: 'rgba(251,191,36,0.22)' },
};

const COLOR_MAP_LIGHT = {
  'nbfc-orange':      { bg: 'rgba(180,130,0,0.08)',  text: '#92700A', border: 'rgba(180,130,0,0.2)' },
  'ecl-green':        { bg: 'rgba(5,120,80,0.08)',   text: '#057850', border: 'rgba(5,120,80,0.2)' },
  'icaap-blue':       { bg: 'rgba(37,99,235,0.08)',  text: '#1D4ED8', border: 'rgba(37,99,235,0.2)' },
  'iracp-purple':     { bg: 'rgba(109,40,217,0.08)', text: '#6D28D9', border: 'rgba(109,40,217,0.2)' },
  'capital-teal':     { bg: 'rgba(13,148,136,0.08)', text: '#0D9488', border: 'rgba(13,148,136,0.2)' },
  'provision-red':    { bg: 'rgba(185,28,28,0.08)',  text: '#B91C1C', border: 'rgba(185,28,28,0.2)' },
  'liquidity-cyan':   { bg: 'rgba(2,132,199,0.08)',  text: '#0284C7', border: 'rgba(2,132,199,0.2)' },
  'governance-amber': { bg: 'rgba(180,83,9,0.08)',   text: '#B45309', border: 'rgba(180,83,9,0.2)' },
};

const FALLBACK_DARK  = { bg: 'rgba(255,255,255,0.04)', text: '#6b7280', border: 'rgba(255,255,255,0.08)' };
const FALLBACK_LIGHT = { bg: 'rgba(0,0,0,0.04)',       text: '#52525b', border: 'rgba(0,0,0,0.12)' };

export default function TagBadge({ tag }) {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const map = isLight ? COLOR_MAP_LIGHT : COLOR_MAP_DARK;
  const fallback = isLight ? FALLBACK_LIGHT : FALLBACK_DARK;
  const c = map[tag.color] || fallback;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.3px',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        backgroundColor: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
      }}
    >
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: c.text, flexShrink: 0 }} />
      {tag.label}
    </span>
  );
}
