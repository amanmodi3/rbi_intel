import { useState, useRef, useEffect } from 'react';
import FeedCard from './FeedCard.jsx';
import EmptyState from './EmptyState.jsx';

export default function FeedGrid({ items, bookmarks, onToggleBookmark, searchQuery }) {
  const [visibleCount, setVisibleCount] = useState(40);
  const loaderRef = useRef(null);
  const needsWindowing = items.length > 100;

  useEffect(() => {
    if (!needsWindowing) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisibleCount((n) => Math.min(n + 20, items.length)); },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [needsWindowing, items.length]);

  useEffect(() => { setVisibleCount(40); }, [items.length]);

  if (!items.length) return <EmptyState />;

  const display = needsWindowing ? items.slice(0, visibleCount) : items;

  return (
    <div>
      <div className="feed-grid-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {display.map((item, idx) => (
          <div
            key={item.id || idx}
            className="fade-in"
            style={{ animationDelay: `${Math.min(idx * 15, 200)}ms` }}
          >
            <FeedCard
              item={item}
              isBookmarked={bookmarks.includes(item.id)}
              onToggleBookmark={onToggleBookmark}
              searchQuery={searchQuery}
            />
          </div>
        ))}
      </div>

      {needsWindowing && visibleCount < items.length && (
        <div ref={loaderRef} style={{ textAlign: 'center', padding: '24px 0', fontSize: 12, color: 'var(--text-3)' }}>
          Showing {visibleCount} of {items.length} — scroll for more
        </div>
      )}

      <div style={{ textAlign: 'center', paddingTop: 16, paddingBottom: 8, fontSize: 11, color: 'var(--text-3)' }}>
        {items.length} item{items.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
