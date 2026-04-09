import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Settings, Clock, Search, X, Sun, Moon } from 'lucide-react';
import { format } from 'date-fns';

const INTERVAL_OPTIONS = [
  { label: '1 Hour',  value: 3600000 },
  { label: '2 Hours', value: 7200000 },
  { label: '4 Hours', value: 14400000 },
];

export default function Header({
  onRefresh, loading,
  lastUpdated, fromCache,
  refreshInterval, onChangeRefreshInterval,
  activeSection, filteredCount,
  searchQuery, onSearchChange,
  theme, onToggleTheme,
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [countdown, setCountdown] = useState('');
  const settingsRef = useRef(null);
  const nextRef     = useRef(null);
  const inputRef    = useRef(null);

  useEffect(() => {
    if (lastUpdated) nextRef.current = new Date(lastUpdated.getTime() + refreshInterval);
  }, [lastUpdated, refreshInterval]);

  useEffect(() => {
    const t = setInterval(() => {
      if (!nextRef.current) return;
      const diff = nextRef.current - Date.now();
      if (diff <= 0) { setCountdown('refreshing…'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h > 0 ? `${h}h ` : ''}${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) setShowSettings(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isLight = theme === 'light';

  return (
    <div className="top-bar">

      {/* Section title + count */}
      <div style={{ minWidth: 0, flexShrink: 0, marginRight: 4 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', whiteSpace: 'nowrap' }}>
          {activeSection}
        </span>
        {filteredCount !== undefined && (
          <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 8 }}>
            {filteredCount} results
          </span>
        )}
      </div>

      {/* Search — centred */}
      <div className="search-wrap" style={{ flex: 1, maxWidth: 340 }}>
        <Search size={14} className="search-icon" strokeWidth={1.75} />
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search titles and descriptions…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => { onSearchChange(''); inputRef.current?.focus(); }}
            style={{
              position: 'absolute', right: 8,
              color: 'var(--text-3)', background: 'none',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
            }}
          >
            <X size={13} strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Timestamp */}
      {lastUpdated && (
        <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'right', flexShrink: 0, lineHeight: 1.4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={10} strokeWidth={1.75} />
            <span>{format(lastUpdated, 'MMM dd, HH:mm')}</span>
            {fromCache && (
              <span style={{
                background: 'var(--elevated)',
                border: '1px solid var(--border)',
                padding: '1px 5px', borderRadius: 4,
                fontSize: 9, color: 'var(--text-3)',
              }}>
                cached
              </span>
            )}
          </div>
          {countdown && (
            <div style={{ color: 'var(--emerald)', fontSize: 10, marginTop: 1 }}>
              Next: {countdown}
            </div>
          )}
        </div>
      )}

      {/* Theme toggle */}
      <button
        onClick={onToggleTheme}
        className="theme-btn"
        title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {isLight
          ? <Moon size={14} strokeWidth={1.75} />
          : <Sun  size={14} strokeWidth={1.75} />
        }
      </button>

      {/* Refresh */}
      <button onClick={onRefresh} disabled={loading} className="icon-btn" title="Refresh">
        <RefreshCw size={14} strokeWidth={1.75} className={loading ? 'spin' : ''} />
      </button>

      {/* Settings */}
      <div ref={settingsRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setShowSettings((s) => !s)}
          className={`icon-btn ${showSettings ? 'icon-btn-active' : ''}`}
          title="Settings"
        >
          <Settings size={14} strokeWidth={1.75} />
        </button>

        {showSettings && (
          <div className="settings-dropdown fade-up">
            <div className="settings-header">Auto-Refresh</div>
            {INTERVAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChangeRefreshInterval(opt.value); setShowSettings(false); }}
                className={`settings-item ${refreshInterval === opt.value ? 'settings-item-active' : ''}`}
              >
                {opt.label}
                {refreshInterval === opt.value && (
                  <span style={{ color: 'var(--emerald)', fontSize: 12 }}>✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
