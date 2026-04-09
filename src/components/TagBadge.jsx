// Color palette: low-opacity background, vivid text — B2B SaaS pill style
const COLOR_MAP = {
  'nbfc-orange':      { bg: 'rgba(212,175,55,0.1)',  text: '#D4AF37', border: 'rgba(212,175,55,0.22)' },
  'ecl-green':        { bg: 'rgba(16,185,129,0.1)',  text: '#10B981', border: 'rgba(16,185,129,0.22)' },
  'icaap-blue':       { bg: 'rgba(96,165,250,0.1)',  text: '#60a5fa', border: 'rgba(96,165,250,0.22)' },
  'iracp-purple':     { bg: 'rgba(167,139,250,0.1)', text: '#a78bfa', border: 'rgba(167,139,250,0.22)' },
  'capital-teal':     { bg: 'rgba(45,212,191,0.1)',  text: '#2dd4bf', border: 'rgba(45,212,191,0.22)' },
  'provision-red':    { bg: 'rgba(248,113,113,0.1)', text: '#f87171', border: 'rgba(248,113,113,0.22)' },
  'liquidity-cyan':   { bg: 'rgba(56,189,248,0.1)',  text: '#38bdf8', border: 'rgba(56,189,248,0.22)' },
  'governance-amber': { bg: 'rgba(251,191,36,0.1)',  text: '#fbbf24', border: 'rgba(251,191,36,0.22)' },
};

const FALLBACK = { bg: 'rgba(255,255,255,0.04)', text: '#6b7280', border: 'rgba(255,255,255,0.08)' };

export default function TagBadge({ tag }) {
  const c = COLOR_MAP[tag.color] || FALLBACK;
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
