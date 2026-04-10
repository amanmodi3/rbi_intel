import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { subDays, format, startOfDay, isSameDay } from 'date-fns';

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
      <div style={{ marginTop: 6, fontSize: 10, color: 'var(--text-3)' }}>Click to filter feed</div>
    </div>
  );
}

export default function TrendChart({ items, selectedDate, onDateClick }) {
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
        date: day,
        other: Math.max(0, total - nbfc), // non-NBFC base
        nbfc,
        total,
      };
    });
  }, [items]);

  const maxVal = Math.max(...data.map(d => d.total), 1);

  const handleClick = (chartData) => {
    if (!onDateClick || !chartData?.activePayload?.[0]) return;
    const clickedDate = chartData.activePayload[0].payload.date;
    // Toggle: clicking the same date again clears the filter
    if (selectedDate && isSameDay(selectedDate, clickedDate)) {
      onDateClick(null);
    } else {
      onDateClick(clickedDate);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="stat-section-label">Publication Trend</div>
        {selectedDate && (
          <button
            onClick={() => onDateClick(null)}
            style={{
              fontSize: 10, fontWeight: 600, color: 'var(--gold)',
              background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
              borderRadius: 4, padding: '2px 6px', cursor: 'pointer', lineHeight: 1.4,
            }}
          >
            {format(selectedDate, 'dd MMM')} ×
          </button>
        )}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={14 * 26}>
        <BarChart
          layout="vertical"
          data={data}
          barSize={7}
          barCategoryGap="38%"
          margin={{ top: 0, right: 6, left: 0, bottom: 0 }}
          onClick={handleClick}
          style={{ cursor: 'pointer' }}
        >
          <XAxis type="number" domain={[0, maxVal]} hide />
          <YAxis
            type="category"
            dataKey="label"
            width={68}
            tick={({ x, y, payload, index }) => {
              const isSelected = selectedDate && data[index] && isSameDay(data[index].date, selectedDate);
              return (
                <text
                  x={x} y={y} dy={4}
                  textAnchor="end"
                  fontSize={10}
                  fontWeight={isSelected ? 700 : 400}
                  fill={isSelected ? 'var(--gold)' : 'var(--text-2)'}
                >
                  {payload.value}
                </text>
              );
            }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(128,128,128,0.06)' }}
          />

          {/* Base segment: non-NBFC */}
          <Bar dataKey="other" name="Non-NBFC" stackId="s" fill={EMERALD} shape={(props) => {
            const row = data[props.index];
            const dimmed = selectedDate && row && !isSameDay(row.date, selectedDate);
            if (row && row.nbfc === 0) return <FullRoundedBar {...props} fill={EMERALD} opacity={dimmed ? 0.18 : 0.55} />;
            return <FlatBar {...props} fill={EMERALD} opacity={dimmed ? 0.18 : 0.55} />;
          }} />

          {/* Top segment: NBFC */}
          <Bar dataKey="nbfc" name="NBFC" stackId="s" fill={GOLD} shape={(props) => {
            const row = data[props.index];
            const dimmed = selectedDate && row && !isSameDay(row.date, selectedDate);
            return <RoundedRightBar {...props} fill={GOLD} opacity={dimmed ? 0.18 : 0.9} />;
          }} />

        </BarChart>
      </ResponsiveContainer>

    </div>
  );
}
