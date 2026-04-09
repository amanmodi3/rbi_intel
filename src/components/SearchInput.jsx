import { Search, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function SearchInput({ value, onChange }) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { setLocal(value); }, [value]);

  const handleChange = (e) => {
    const val = e.target.value;
    setLocal(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(val), 300);
  };

  const handleClear = () => {
    setLocal('');
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative group">
      <Search
        size={15}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-rbi-green/60 transition-colors"
      />
      <input
        ref={inputRef}
        id="search-input"
        type="text"
        value={local}
        onChange={handleChange}
        placeholder="Search titles and descriptions..."
        className="w-full pl-10 pr-10 py-3 rounded-2xl glass-input text-sm"
      />
      {local && (
        <button
          onClick={handleClear}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors p-0.5"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
