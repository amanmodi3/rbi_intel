import { useState, useMemo, useCallback, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { format, subDays, isAfter, startOfDay } from 'date-fns';
import { BookmarkCheck, MoveRight, LayoutDashboard, BarChart2, Menu } from 'lucide-react';

import Header       from './components/Header.jsx';
import FilterBar    from './components/FilterBar.jsx';
import LeftNav      from './components/LeftNav.jsx';
import FeedGrid     from './components/FeedGrid.jsx';
import StatsBar     from './components/StatsBar.jsx';
import TrendChart   from './components/TrendChart.jsx';
import LoadingSkeleton from './components/LoadingSkeleton.jsx';

import useFeed         from './hooks/useFeed.js';
import useLocalStorage from './hooks/useLocalStorage.js';
import { DEFAULT_REFRESH_INTERVAL_MS } from './utils/feedConfig.js';

export default function App() {
  const { items, loading, feedStatus, lastUpdated, fromCache, refresh } = useFeed();
  const [bookmarks, setBookmarks]     = useLocalStorage('rbi_bookmarks', []);
  const [refreshInterval, setRefreshInterval] = useLocalStorage(
    'rbi_refresh_interval', DEFAULT_REFRESH_INTERVAL_MS
  );
  const [theme, setTheme] = useLocalStorage('rbi_theme', 'light');

  const [showBookmarks, setShowBookmarks] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState(null); // 'nav' | 'stats' | null
  const [category,      setCategory]      = useState('all');
  const [activeTopics,  setActiveTopics]  = useState([]);
  const [sortBy,        setSortBy]        = useState('newest');
  const [dateRange,     setDateRange]     = useState('all');
  const [searchQuery,   setSearchQuery]   = useState('');

  // Apply theme to <html> so all CSS [data-theme] selectors work
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, [setTheme]);


  const toggleBookmark = useCallback((id) => {
    setBookmarks((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }, [setBookmarks]);

  const handleTopicToggle = useCallback((id) => {
    setActiveTopics((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  }, []);

  const handleClearAll = useCallback(() => {
    setCategory('all');
    setActiveTopics([]);
    setSortBy('newest');
    setDateRange('all');
    setSearchQuery('');
    setShowBookmarks(false);
  }, []);

  const hasActiveFilters =
    category !== 'all' || activeTopics.length > 0 || sortBy !== 'newest' ||
    dateRange !== 'all' || searchQuery !== '' || showBookmarks;

  const filteredItems = useMemo(() => {
    let r = [...items];

    if (showBookmarks) r = r.filter((i) => bookmarks.includes(i.id));
    if (category !== 'all') r = r.filter((i) => i.feedId === category);

    if (activeTopics.length > 0) {
      r = r.filter((i) => {
        if (activeTopics.includes('nbfc') && i.isNBFCRelevant) return true;
        const rest = activeTopics.filter((t) => t !== 'nbfc');
        if (rest.length === 0) return false;
        return rest.every((topic) => i.tags?.some((tag) => tag.groupKey === topic));
      });
    }

    if (dateRange !== 'all') {
      const cutoffs = { today: startOfDay(new Date()), '7d': subDays(new Date(), 7), '30d': subDays(new Date(), 30), '90d': subDays(new Date(), 90) };
      const cutoff = cutoffs[dateRange];
      if (cutoff) r = r.filter((i) => isAfter(i.pubDate, cutoff));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      r = r.filter((i) =>
        i.title?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
      );
    }

    const sorts = {
      newest:     (a, b) => b.pubDate - a.pubDate,
      oldest:     (a, b) => a.pubDate - b.pubDate,
      'nbfc-first': (a, b) => {
        if (a.isNBFCRelevant !== b.isNBFCRelevant) return a.isNBFCRelevant ? -1 : 1;
        return b.pubDate - a.pubDate;
      },
      'most-tagged': (a, b) => {
        const d = (b.tags?.length || 0) - (a.tags?.length || 0);
        return d !== 0 ? d : b.pubDate - a.pubDate;
      },
    };
    r.sort(sorts[sortBy] || sorts.newest);

    return r;
  }, [items, showBookmarks, bookmarks, category, activeTopics, dateRange, searchQuery, sortBy]);

  const handleExportCsv = useCallback(() => {
    if (!filteredItems.length) return;
    const rows = filteredItems.map((i) => [
      format(i.pubDate, 'yyyy-MM-dd'),
      `"${(i.title || '').replace(/"/g, '""')}"`,
      i.feedName || '',
      (i.tags || []).map((t) => t.label).join('; '),
      i.link || '',
    ]);
    const csv = [['Date', 'Title', 'Category', 'Tags', 'Link'].join(','), ...rows.map((r) => r.join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    Object.assign(document.createElement('a'), {
      href: url,
      download: `rbi_export_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`,
    }).click();
    URL.revokeObjectURL(url);
  }, [filteredItems]);

  const SECTION_NAMES = {
    all: 'All Sources', pressreleases: 'Press Releases',
    notifications: 'Notifications', publications: 'Publications', speeches: 'Speeches',
  };
  const activeSection = showBookmarks ? 'Bookmarks' : (SECTION_NAMES[category] || 'All Sources');

  return (
    <>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: theme === 'light' ? '#FFFFFF' : '#1A1A1A',
            color:      theme === 'light' ? '#18181B' : '#F0F0F0',
            border:     theme === 'light' ? '1px solid #E4E4E7' : '1px solid #2D2D2D',
            fontSize: '13px',
            borderRadius: '10px',
            padding: '10px 20px',
            boxShadow: theme === 'light' ? '0 4px 16px rgba(0,0,0,0.1)' : 'none',
          },
        }}
      />

      <div className="app-shell">

        {/* Left sidebar */}
        <LeftNav
          category={category}
          onCategoryChange={setCategory}
          activeTopics={activeTopics}
          onTopicToggle={handleTopicToggle}
          bookmarkCount={bookmarks.length}
          showBookmarks={showBookmarks}
          onToggleBookmarks={() => setShowBookmarks((v) => !v)}
          feedStatus={feedStatus}
          onExportCsv={handleExportCsv}
        />

        {/* Center + Right */}
        <div className="app-center">

          {/* Top bar with search */}
          <Header
            onRefresh={refresh}
            loading={loading}
            lastUpdated={lastUpdated}
            fromCache={fromCache}
            refreshInterval={refreshInterval}
            onChangeRefreshInterval={setRefreshInterval}
            activeSection={activeSection}
            filteredCount={filteredItems.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            theme={theme}
            onToggleTheme={toggleTheme}
          />

          {/* Horizontal filter bar */}
          <FilterBar
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            sortBy={sortBy}
            onSortChange={setSortBy}
            hasActiveFilters={hasActiveFilters}
            onClearAll={handleClearAll}
          />

          <div className="content-row">

            {/* Feed */}
            <div className="feed-area">

              {showBookmarks && (
                <div
                  className="fade-in"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 10,
                    border: '1px solid rgba(212,175,55,0.2)',
                    background: 'rgba(212,175,55,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <BookmarkCheck size={15} strokeWidth={1.75} style={{ color: 'var(--gold)' }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--gold)' }}>
                      Bookmarks — {filteredItems.length} saved item{filteredItems.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowBookmarks(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, fontSize: 12,
                      color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer',
                    }}
                  >
                    Clear <MoveRight size={13} strokeWidth={1.75} />
                  </button>
                </div>
              )}

              {loading
                ? <LoadingSkeleton isMainArea />
                : <FeedGrid items={filteredItems} bookmarks={bookmarks} onToggleBookmark={toggleBookmark} searchQuery={searchQuery} />
              }
            </div>

            {/* Right analytics panel — desktop */}
            <aside className="right-panel">
              {loading
                ? <LoadingSkeleton isSidebar />
                : (
                  <>
                    <StatsBar items={items} />
                    <TrendChart items={items} />
                  </>
                )
              }
            </aside>

          </div>
        </div>

        {/* Mobile drawer overlay */}
        {mobileDrawer && (
          <div className="mobile-drawer-overlay" onClick={() => setMobileDrawer(null)}>
            {mobileDrawer === 'nav' && (
              <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
                <LeftNav
                  category={category}
                  onCategoryChange={(c) => { setCategory(c); setMobileDrawer(null); }}
                  activeTopics={activeTopics}
                  onTopicToggle={handleTopicToggle}
                  bookmarkCount={bookmarks.length}
                  showBookmarks={showBookmarks}
                  onToggleBookmarks={() => { setShowBookmarks((v) => !v); setMobileDrawer(null); }}
                  feedStatus={feedStatus}
                  onExportCsv={() => { handleExportCsv(); setMobileDrawer(null); }}
                />
              </div>
            )}
            {mobileDrawer === 'stats' && (
              <div className="mobile-drawer mobile-drawer-right" onClick={(e) => e.stopPropagation()}>
                <StatsBar items={items} />
                <TrendChart items={items} />
              </div>
            )}
          </div>
        )}

        {/* Mobile bottom nav */}
        <nav className="mobile-nav">
          <button className={`mobile-nav-item ${mobileDrawer === 'nav' ? 'active' : ''}`} onClick={() => setMobileDrawer(d => d === 'nav' ? null : 'nav')}>
            <Menu size={20} strokeWidth={1.75} />
            <span>Menu</span>
          </button>
          <button className={`mobile-nav-item ${!mobileDrawer ? 'active' : ''}`} onClick={() => { setMobileDrawer(null); setCategory('all'); setShowBookmarks(false); }}>
            <LayoutDashboard size={20} strokeWidth={1.75} />
            <span>Feed</span>
          </button>
          <button className={`mobile-nav-item ${mobileDrawer === 'stats' ? 'active' : ''}`} onClick={() => setMobileDrawer(d => d === 'stats' ? null : 'stats')}>
            <BarChart2 size={20} strokeWidth={1.75} />
            <span>Stats</span>
          </button>
        </nav>

      </div>
    </>
  );
}
