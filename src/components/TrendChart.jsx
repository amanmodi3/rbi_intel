import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { subDays, format, startOfDay } from 'date-fns';

const EMERALD = '#10B981';
const GOLD    = '#D4AF37';

// Flat-left, rounded-right cap — for the NBFC (top) segment
function RoundedRightBar({ x, y, width, height, fill, opacity: op = 1 }) {
  if (!width || width <= 0 || !height || height <= 0) return null;
  const r = Math.min(3, height / 2, width);
  return (
    <path
      d={`M${x},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r}
         L${x + width},${y + height - r} Q${x + width},${y + height} ${x + width - r},${y + height}
         L${x},${y + height} Z`}
      fill={fill}
      opacity={op}
    />
  );
}

// Flat rectangle — for the base (non-NBFC) segment
function FlatBar({ x, y, width, height, fill, opacity: op = 1 }) {
  if (!width || width <= 0 || !height || height <= 0) return null;
  return <rect x={x} y={y} width={width} height={height} fill={fill} opacity={op} />;
}

// When the whole bar is NBFC only (other=0), the top segment needs full rounding
function FullRoundedBar({ x, y, width, height, fill, opacity: op = 1 }) {
  if (!width || width <= 0 || !height || height <= 0) return null;
  const r = Math.min(3, height / 2, width);
  return <rect x={x} y={y} width={width} height={height} fill={fill} opacity={op} rx={r} ry={r} />;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const nonNbfc = payload.find(p => p.dataKey === 'other')?.value || 0;
  const nbfc    = payload.find(p => p.dataKey === 'nbfc')?.value  || 0;
  const total   = nonNbfc + nbfc;
  const row = (dot, label, value) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, flexShrink: 0 }} />
      <span style={{ color: 'var(--text-2)' }}>{label}:</span>
      <span style={{ color: 'var(--text-1)', fontWeight: 700 }}>{value}</span>
    </div>
  );
  return (
    <div style={{
      background: 'var(--elevated)', border: '1px solid var(--border-hover)',
      borderRadius: 8, padding: '8px 12px', fontSize: 12, minWidth: 130,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    }}>
      <div style={{ color: 'var(--text-3)', marginBottom: 6, fontSize: 11, fontWeight: 600 }}>{label}</div>
      {row('var(--text-3)', 'Total',    total)}
      {row(GOLD,            'NBFC',     nbfc)}
      {row(EMERALD,         'Non-NBFC', nonNbfc)}
    </div>
  );
}

export default function TrendChart({ items }) {
  // 14 days, index 0 = TODAY → appears at TOP in vertical layout
  const data = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 14 }, (_, i) => {
      const day    = subDays(today, i);
      const dayEnd = new Date(day.getTime() + 86400000);
      const all    = items.filter(it => it.pubDate >= day && it.pubDate < dayEnd);
      const nbfc   = all.filter(it => it.isNBFCRelevant).length;
      const total  = all.length;
      return {
        label: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : format(day, 'dd MMM'),
        other: Math.max(0, total - nbfc), // non-NBFC base
        nbfc,
        total,
      };
    });
  }, [items]);

  const maxVal = Math.max(...data.map(d => d.total), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ marginBottom: 10 }}>
        <div className="stat-section-label">Publication Trend</div>
      </div>

      {/* Chart */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <ResponsiveContainer width="100%" height={14 * 26}>
          <BarChart
            layout="vertical"
            data={data}
            barSize={7}
            barCategoryGap="38%"
            margin={{ top: 0, right: 6, left: 0, bottom: 0 }}
          >
            <XAxis type="number" domain={[0, maxVal]} hide />
            <YAxis
              type="category"
              dataKey="label"
              width={68}
              tick={{ fontSize: 10, fill: 'var(--text-2)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(128,128,128,0.06)' }}
            />

            {/* Base segment: non-NBFC (flat right edge, covered by NBFC bar) */}
            <Bar dataKey="other" name="Non-NBFC" stackId="s" fill={EMERALD} shape={(props) => {
              // If nbfc is 0 for this row, round the right end too
              const row = data[props.index];
              if (row && row.nbfc === 0) return <FullRoundedBar {...props} fill={EMERALD} opacity={0.55} />;
              return <FlatBar {...props} fill={EMERALD} opacity={0.55} />;
            }} />

            {/* Top segment: NBFC (rounded right end) */}
            <Bar dataKey="nbfc" name="NBFC" stackId="s" fill={GOLD} shape={(props) => (
              <RoundedRightBar {...props} fill={GOLD} opacity={0.9} />
            )} />

          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
