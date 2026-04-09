import { SearchX } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-5">
        <SearchX size={24} className="text-white/20" />
      </div>
      <h3 className="text-base font-semibold text-white/50 mb-2">
        No items found
      </h3>
      <p className="text-xs text-white/25 max-w-sm leading-relaxed">
        Try adjusting your filters, search query, or date range.
        Click "Clear" to reset all filters.
      </p>
    </div>
  );
}
