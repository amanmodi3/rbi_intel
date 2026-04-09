import React, { useCallback } from 'react';
import { Bookmark, BookmarkCheck, Copy, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import TagBadge from './TagBadge.jsx';

function highlightText(text, query) {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? <mark key={i}>{part}</mark> : part
  );
}

const FeedCard = React.memo(function FeedCard({ item, isBookmarked, onToggleBookmark, searchQuery }) {
  const isNBFC = item.isGeneralNBFC || item.tags?.some((t) => t.groupKey === 'NBFC');

  const description =
    item.description?.length > 280
      ? item.description.slice(0, 280) + '…'
      : item.description || '';

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(item.link).then(() =>
      toast.success('Link copied!', { duration: 2000 })
    );
  }, [item.link]);

  const handleToggle = useCallback(() => onToggleBookmark(item.id), [item.id, onToggleBookmark]);

  return (
    <article className="feed-card">
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isNBFC && (
              <span
                title="NBFC Relevant"
                style={{
                  width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)',
                  boxShadow: '0 0 6px rgba(212,175,55,0.55)', display: 'inline-block', flexShrink: 0,
                }}
              />
            )}
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.7px', textTransform: 'uppercase', color: 'var(--text-3)' }}>
              {item.feedName}
            </span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums' }}>
            {format(item.pubDate, 'dd MMM yyyy')}
          </span>
        </div>

        {/* Title */}
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginBottom: 10, textDecoration: 'none', color: 'inherit' }}
          className="card-title-link"
        >
          <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.55 }}>
            {searchQuery ? highlightText(item.title, searchQuery) : item.title}
          </span>
          <ArrowUpRight size={14} strokeWidth={1.75} style={{ color: 'var(--text-3)', flexShrink: 0, marginTop: 2, opacity: 0.6 }} />
        </a>

        {/* Description */}
        {description && (
          <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 12, flexGrow: 1 }}>
            {searchQuery ? highlightText(description, searchQuery) : description}
          </p>
        )}

        {/* Tags */}
        {item.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
            {item.tags.map((tag) => <TagBadge key={tag.groupKey} tag={tag} />)}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleToggle}
            className="action-btn"
            style={isBookmarked ? {
              color: 'var(--gold)',
              borderColor: 'var(--gold-border)',
              background: 'var(--gold-dim)',
            } : {}}
          >
            {isBookmarked
              ? <BookmarkCheck size={13} strokeWidth={1.75} />
              : <Bookmark size={13} strokeWidth={1.75} />}
            {isBookmarked ? 'Saved' : 'Save'}
          </button>
          <button onClick={handleCopy} className="action-btn">
            <Copy size={13} strokeWidth={1.75} />
            Copy
          </button>
        </div>

      </div>
    </article>
  );
});

export default FeedCard;
