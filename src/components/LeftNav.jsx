import { LayoutDashboard, FileText, Bell, BookOpen, Mic, Bookmark, Download } from 'lucide-react';
import { FEEDS } from '../utils/feedConfig.js';

const CATEGORIES = [
  { id: 'all',           label: 'All Sources',    icon: LayoutDashboard },
  { id: 'pressreleases', label: 'Press Releases',  icon: FileText },
  { id: 'notifications', label: 'Notifications',   icon: Bell },
  { id: 'publications',  label: 'Publications',    icon: BookOpen },
  { id: 'speeches',      label: 'Speeches',        icon: Mic },
];

const TOPICS = [
  { id: 'nbfc',             label: 'NBFC Only',    color: '#D4AF37' },
  { id: 'ICAAP',            label: 'ICAAP',        color: '#818cf8' },
  { id: 'ECL',              label: 'ECL',          color: '#10B981' },
  { id: 'IRACP',            label: 'IRACP',        color: '#a78bfa' },
  { id: 'CAPITAL_ADEQUACY', label: 'Capital',      color: '#2dd4bf' },
  { id: 'PROVISIONING',     label: 'Provisioning', color: '#f87171' },
  { id: 'LIQUIDITY',        label: 'Liquidity',    color: '#38bdf8' },
];

function NavItem({ icon: Icon, label, isActive, onClick, dot, dotColor, badge }) {
  return (
    <button onClick={onClick} className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}>
      <span className="sidebar-icon">
        {dot ? (
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: dotColor, display: 'block',
            opacity: isActive ? 1 : 0.35,
          }} />
        ) : (
          <Icon size={16} strokeWidth={1.75} style={{ color: isActive ? 'var(--text-1)' : undefined }} />
        )}
      </span>
      <span className="sidebar-text" style={isActive && dot ? { color: dotColor } : {}}>
        {label}
      </span>
      {badge !== undefined && badge > 0 && (
        <span className="sidebar-badge">{badge}</span>
      )}
    </button>
  );
}

export default function LeftNav({
  category, onCategoryChange,
  activeTopics, onTopicToggle,
  bookmarkCount, showBookmarks, onToggleBookmarks,
  feedStatus,
  onExportCsv,
}) {
  return (
    <nav className="sidebar">
      <div className="sidebar-inner">

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-mark">₹</div>
          <div className="sidebar-logo-text">
            <div className="sidebar-logo-title">RBI Intel</div>
            <div className="sidebar-logo-sub">NBFC Focus</div>
          </div>
        </div>

        {/* Feed status row */}
        {(() => {
          const known = FEEDS.filter(f => feedStatus?.[f.id] !== undefined);
          const errorFeeds = known.filter(f => !feedStatus[f.id].ok);
          const allOk = known.length === FEEDS.length && errorFeeds.length === 0;
          const statusLabel = known.length === 0
            ? 'Checking feeds…'
            : allOk
              ? 'All feeds live'
              : `${errorFeeds.length} feed${errorFeeds.length > 1 ? 's' : ''} failed`;
          return (
            <div className="sidebar-status">
              <div className="sidebar-status-dots">
                {FEEDS.map((feed) => {
                  const status = feedStatus?.[feed.id];
                  const color = !status ? 'feed-dot-pending' : status.ok ? 'feed-dot-ok' : 'feed-dot-err';
                  const tip = !status ? `${feed.name} — checking` : status.ok ? `${feed.name} — OK${status.fromCache ? ' (cached)' : ''}` : `${feed.name} — Error`;
                  return <span key={feed.id} className={`feed-dot ${color}`} title={tip} />;
                })}
              </div>
              <span className="sidebar-text sidebar-status-label" style={{ color: allOk || known.length === 0 ? undefined : 'var(--danger, #f87171)' }}>
                {statusLabel}
              </span>
            </div>
          );
        })()}

        {/* Scrollable nav */}
        <div className="sidebar-content">

          {/* Navigate */}
          <div className="sidebar-group">
            <div className="sidebar-group-label">Navigate</div>
            {CATEGORIES.map((cat) => (
              <NavItem
                key={cat.id}
                icon={cat.icon}
                label={cat.label}
                isActive={category === cat.id && !showBookmarks}
                onClick={() => {
                  onCategoryChange(cat.id);
                  if (showBookmarks) onToggleBookmarks();
                }}
              />
            ))}
          </div>

          {/* Focus (topics) */}
          <div className="sidebar-group">
            <div className="sidebar-group-label">Focus</div>
            {TOPICS.map((topic) => (
              <NavItem
                key={topic.id}
                label={topic.label}
                dot
                dotColor={topic.color}
                isActive={activeTopics.includes(topic.id)}
                onClick={() => onTopicToggle(topic.id)}
              />
            ))}
          </div>

        </div>

        {/* Bottom actions */}
        <div className="sidebar-bottom">
          <NavItem
            icon={Bookmark}
            label="Bookmarks"
            isActive={showBookmarks}
            onClick={onToggleBookmarks}
            badge={bookmarkCount}
          />
          <NavItem
            icon={Download}
            label="Export CSV"
            onClick={onExportCsv}
          />
        </div>

      </div>
    </nav>
  );
}
