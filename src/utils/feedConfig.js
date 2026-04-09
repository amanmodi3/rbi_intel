export const FEEDS = [
  {
    id: 'pressreleases',
    name: 'Press Releases',
    proxyPath: '/rss/pressreleases',
    directUrl: 'https://www.rbi.org.in/pressreleases_rss.xml',
    color: '#006837',
    icon: 'Newspaper',
  },
  {
    id: 'notifications',
    name: 'Notifications',
    proxyPath: '/rss/notifications',
    directUrl: 'https://www.rbi.org.in/notifications_rss.xml',
    color: '#1677ff',
    icon: 'Bell',
  },
  {
    id: 'publications',
    name: 'Publications',
    proxyPath: '/rss/publications',
    directUrl: 'https://www.rbi.org.in/Publication_rss.xml',
    color: '#722ed1',
    icon: 'BookOpen',
  },
  {
    id: 'speeches',
    name: 'Speeches',
    proxyPath: '/rss/speeches',
    directUrl: 'https://www.rbi.org.in/speeches_rss.xml',
    color: '#c8922a',
    icon: 'Mic',
  },
];

export const CACHE_KEY_PREFIX = 'rbi_feed_cache_';
export const CACHE_TIMESTAMP_PREFIX = 'rbi_feed_ts_';
export const CACHE_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour
export const DEFAULT_REFRESH_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours
export const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
