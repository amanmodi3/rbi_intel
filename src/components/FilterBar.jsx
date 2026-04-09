import { X } from 'lucide-react';

const DATE_RANGES = [
  { id: 'all',   label: 'All Time' },
  { id: 'today', label: 'Today' },
  { id: '7d',    label: '7 Days' },
  { id: '30d',   label: '30 Days' },
  { id: '90d',   label: '90 Days' },
];

const SORT_OPTIONS = [
  { id: 'newest',      label: 'Newest' },
  { id: 'oldest',      label: 'Oldest' },
  { id: 'nbfc-first',  label: 'NBFC First' },
  { id: 'most-tagged', label: 'Most Tagged' },
];

export default function FilterBar({
  dateRange, onDateRangeChange,
  sortBy, onSortChange,
  hasActiveFilters, onClearAll,
}) {
  return (
    <div className="filter-bar">

      <span className="filter-label">Period</span>
      {DATE_RANGES.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onDateRangeChange(opt.id)}
          className={`filter-chip ${dateRange === opt.id ? 'filter-chip-active' : ''}`}
        >
          {opt.label}
        </button>
      ))}

      <div className="filter-sep" />

      <span className="filter-label">Sort</span>
      {SORT_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onSortChange(opt.id)}
          className={`filter-chip ${sortBy === opt.id ? 'filter-chip-active' : ''}`}
        >
          {opt.label}
        </button>
      ))}

      {hasActiveFilters && (
        <>
          <div className="filter-sep" />
          <button onClick={onClearAll} className="filter-chip filter-chip-danger">
            <X size={11} strokeWidth={2} />
            Reset
          </button>
        </>
      )}

    </div>
  );
}
