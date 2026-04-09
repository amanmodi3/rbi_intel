import { useState, useEffect, useRef } from 'react';
import { isToday, differenceInDays } from 'date-fns';

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current, end = value;
    if (start === end) return;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / 600, 1);
      setDisplay(Math.round(start + (end - start) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
      else prev.current = end;
    };
    requestAnimationFrame(step);
  }, [value]);
  return <>{display}</>;
}

function StatCell({ label, value, color, accent }) {
  return (
    <div style={{
      padding: '8px 10px',
      borderRadius: 8,
      border: `1px solid var(--border)`,
      borderLeft: accent ? `2px solid ${color}` : `1px solid var(--border)`,
      background: accent ? `color-mix(in srgb, ${color} 7%, transparent)` : 'transparent',
    }}>
      <div style={{
        fontSize: accent ? 22 : 17,
        fontWeight: 700,
        letterSpacing: '-0.5px',
        lineHeight: 1,
        color,
      }}>
        <AnimatedNumber value={value} />
      </div>
      <div style={{
        fontSize: 9,
        fontWeight: 600,
        color: 'var(--text-3)',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginTop: 4,
      }}>
        {label}
      </div>
    </div>
  );
}

export default function StatsBar({ items }) {
  const total = items.length;
  const nbfc  = items.filter((i) => i.isNBFCRelevant).length;
  const today = items.filter((i) => isToday(i.pubDate)).length;

  const historyLabel = (() => {
    if (!items.length) return null;
    const oldest = new Date(Math.min(...items.map(i => i.pubDate)));
    const days = differenceInDays(new Date(), oldest);
    if (days === 0) return 'Today only';
    if (days < 7)  return `Last ${days} day${days > 1 ? 's' : ''}`;
    const weeks = Math.round(days / 7);
    if (days < 60) return `Last ~${weeks} week${weeks > 1 ? 's' : ''}`;
    const months = Math.round(days / 30);
    return `Last ~${months} month${months > 1 ? 's' : ''}`;
  })();

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <div className="stat-section-label">Overview</div>
        {historyLabel && (
          <div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 500, letterSpacing: '0.4px', marginTop: 2 }}>
            {historyLabel}
          </div>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        <StatCell label="Total" value={total} color="#10B981" accent />
        <StatCell label="NBFC"  value={nbfc}  color="#D4AF37" accent />
        <StatCell label="Today" value={today} color="#2dd4bf" accent />
      </div>
    </div>
  );
}
