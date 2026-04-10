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
  const row = (dot, lbl, value) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, flexShrink: 0 }} />
      <span style={{ color: 'var(--text-2)' }}>{lbl}:</span>
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
  const today = useMemo(() => startOfDay(new Date()), []);

  // 14 days, index 0 = TODAY → appears at TOP in vertical layout
  const data = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const day    = subDays(today, i);
      const dayEnd = new Date(day.getTime() + 86400000);
      const all    = items.filter(it => it.pubDate >= day && it.pubDate < dayEnd);
      const nbfc   = all.filter(it => it.isNBFCRelevant).length;
      const total  = all.length;
      return {
        label: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : format(day, 'dd MMM'),
        date: day,
        other: Math.max(0, total - nbfc),
        nbfc,
        total,
      };
    });
  }, [items, today]);

  // Compute the label string for the selected date so we can match without relying on index
  const selectedLabel = useMemo(() => {
    if (!selectedDate) return null;
    if (isSameDay(selectedDate, today)) return 'Today';
    if (isSameDay(selectedDate, subDays(today, 1))) return 'Yesterday';
    return format(selectedDate, 'dd MMM');
  }, [selectedDate, today]);

  const maxVal = Math.max(...data.map(d => d.total), 1);

  // Use activeLabel (always set by Recharts, even for empty rows) instead of
  // activePayload which is only set when a bar exists at that position.
  const handleClick = (chartData) => {
    if (!onDateClick || !chartData?.activeLabel) return;
    const entry = data.find(d => d.label === chartData.activeLabel);
    if (!entry) return;
    if (selectedDate && isSameDay(selectedDate, entry.date)) {
      onDateClick(null); // toggle off
    } else {
      onDateClick(entry.date);
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
            {selectedLabel} ×
          </button>
        )}
      </div>

      {/* Chart — interval={0} forces all 14 labels to render */}
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
            interval={0}
            tick={({ x, y, payload }) => {
              const isSelected = payload.value === selectedLabel;
              return (
                <text
                  x={x} y={y} dy={4}
                  textAnchor="end"
                  fontSize={10}
                  fontWeight={isSelected ? 700 : 400}
                  fill={isSelected ? GOLD : 'var(--text-2)'}
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
            const dimmed = selectedLabel && row && row.label !== selectedLabel;
            if (row && row.nbfc === 0) return <FullRoundedBar {...props} fill={EMERALD} opacity={dimmed ? 0.18 : 0.55} />;
            return <FlatBar {...props} fill={EMERALD} opacity={dimmed ? 0.18 : 0.55} />;
          }} />

          {/* Top segment: NBFC */}
          <Bar dataKey="nbfc" name="NBFC" stackId="s" fill={GOLD} shape={(props) => {
            const row = data[props.index];
            const dimmed = selectedLabel && row && row.label !== selectedLabel;
            return <RoundedRightBar {...props} fill={GOLD} opacity={dimmed ? 0.18 : 0.9} />;
          }} />

        </BarChart>
      </ResponsiveContainer>

    </div>
  );
}
