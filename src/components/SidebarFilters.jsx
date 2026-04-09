import { SlidersHorizontal, X, Download } from 'lucide-react';

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'nbfc-first', label: 'NBFC Items First' },
  { id: 'most-tagged', label: 'Most Tagged' },
];

const DATE_RANGES = [
  { id: 'all', label: 'All Time' },
  { id: 'today', label: 'Today' },
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '90d', label: 'Last 90 Days' },
];

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-white/35 uppercase font-semibold tracking-[1.5px]">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="glass-select w-full rounded-xl px-3 py-2 text-xs font-medium cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/25">
          <svg className="h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function SidebarFilters({
  sortBy,
  onSortChange,
  dateRange,
  onDateRangeChange,
  onClearAll,
  onExportCsv,
  hasActiveFilters,
}) {
  return (
    <div className="glass-panel p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[1.5px] flex items-center gap-1.5">
          <SlidersHorizontal size={11} />
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-[10px] text-red-400/70 hover:text-red-300 transition-colors font-semibold flex items-center gap-0.5"
          >
            <X size={10} /> Reset
          </button>
        )}
      </div>

      <SelectField
        label="Date Range"
        value={dateRange}
        onChange={onDateRangeChange}
        options={DATE_RANGES}
      />

      <SelectField
        label="Sort Order"
        value={sortBy}
        onChange={onSortChange}
        options={SORT_OPTIONS}
      />

      <button
        onClick={onExportCsv}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 transition-all border border-white/5 hover:border-white/10 ripple"
      >
        <Download size={13} />
        Export to CSV
      </button>
    </div>
  );
}
