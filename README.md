# RBI Regulatory Intelligence Dashboard — NBFC Focus

A production-ready, locally hostable React dashboard that aggregates and intelligently tags RBI (Reserve Bank of India) regulatory publications with a focus on NBFC-related content.

![Dashboard](https://img.shields.io/badge/React-19-blue) ![Vite](https://img.shields.io/badge/Vite-8-purple) ![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan)

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Open in your browser
# http://localhost:5173
```

That's it! The app works out of the box with just these 3 commands.

## 📁 Project Structure

```
src/
├── main.jsx                    # React entry point
├── App.jsx                     # Main application with all state & logic
├── index.css                   # Global styles + Tailwind config
├── hooks/
│   ├── useFeed.js              # RSS fetching, parsing, caching, tagging
│   └── useLocalStorage.js      # Persist bookmarks & settings
├── utils/
│   ├── nbfcKeywords.js         # NBFC keyword intelligence engine
│   ├── rssParser.js            # XML → JSON parsing with xml2js
│   └── feedConfig.js           # Feed URLs, proxy paths, cache config
└── components/
    ├── Header.jsx              # App header with branding & controls
    ├── StatsBar.jsx            # Animated count-up stat cards
    ├── FilterBar.jsx           # Category, topic, sort, date filters
    ├── FeedGrid.jsx            # Responsive card grid with windowing
    ├── FeedCard.jsx            # Individual item card (React.memo)
    ├── TagBadge.jsx            # Color-coded keyword tag badges
    ├── SearchInput.jsx         # Debounced live search
    ├── TrendChart.jsx          # Recharts bar/line chart (30 days)
    ├── EmptyState.jsx          # No results placeholder
    └── LoadingSkeleton.jsx     # Shimmer loading skeletons
```

## 📡 Data Sources

The dashboard fetches from 4 official RBI RSS feeds:

| Feed | URL |
|------|-----|
| Press Releases | https://www.rbi.org.in/pressreleases_rss.xml |
| Notifications | https://www.rbi.org.in/notifications_rss.xml |
| Publications | https://www.rbi.org.in/Publication_rss.xml |
| Speeches | https://www.rbi.org.in/speeches_rss.xml |

All feeds are proxied through Vercel serverless functions to avoid CORS issues. A fallback to `api.allorigins.win` is used if the proxy fails.

## 🏷️ NBFC Keyword Engine

Items are auto-tagged using keyword matching across 8 groups:

| Tag | Examples |
|-----|----------|
| **NBFC** | nbfc, non-banking financial, scale based regulation, sbr |
| **ICAAP** | icaap, internal capital adequacy, stress testing |
| **ECL** | expected credit loss, ind as 109, impairment |
| **IRACP** | income recognition, asset classification, npa, sma |
| **Capital** | capital adequacy, crar, tier 1, risk weighted asset |
| **Provisioning** | provision, loan loss, write-off, stressed asset |
| **Liquidity** | liquidity risk, lcr, alm, asset liability management |
| **Governance** | corporate governance, board of directors, audit committee |

An item is **NBFC-relevant** if it matches the NBFC group OR any 2+ other groups.

### How to Add New Keyword Groups

Edit `src/utils/nbfcKeywords.js`:

```javascript
// Add a new group to KEYWORD_GROUPS:
NEW_GROUP: {
  label: 'My Label',          // Displayed on the badge
  color: 'my-color',          // Maps to Tailwind color class
  bgColor: 'bg-my-color-light',
  textColor: 'text-my-color',
  borderColor: 'border-my-color',
  keywords: ['keyword1', 'keyword2', ...],
},
```

Then add the corresponding colors to `src/index.css` `@theme` section and to `src/components/TagBadge.jsx` color map.

## ⚙️ Configuration

### Change Refresh Interval

**Via UI:** Click the ⚙️ Settings button in the header and select an interval.

**Via Code:** Edit the default in `src/utils/feedConfig.js`:

```javascript
export const DEFAULT_REFRESH_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours
```

### Add New RSS Feeds

1. Add the feed to `src/utils/feedConfig.js`:

```javascript
{
  id: 'myfeed',
  name: 'My Feed',
  proxyPath: '/rss/myfeed',
  directUrl: 'https://example.com/feed.xml',
  color: '#hex',
  icon: 'Rss',
},
```

2. Add the proxy mapping in `vite.config.js`:

```javascript
'/rss/myfeed': {
  target: 'https://example.com',
  changeOrigin: true,
  rewrite: (path) => '/feed.xml',
  secure: false,
},
```

## 🎨 Design System

| Color | Hex | Usage |
|-------|-----|-------|
| RBI Green | `#006837` | Primary brand, headers |
| RBI Gold | `#c8922a` | Accent, logo ring |
| NBFC Orange | `#fa8c16` | NBFC highlight |
| ECL Green | `#52c41a` | ECL tags |
| ICAAP Blue | `#1677ff` | ICAAP tags |
| IRACP Purple | `#722ed1` | IRACP tags |
| Capital Teal | `#13c2c2` | Capital tags |
| Provision Red | `#d4380d` | Provisioning tags |

## 📦 Tech Stack

- **React 19** — UI framework
- **Vite 8** — Build tool + dev server
- **Tailwind CSS 4** — Utility-first styles
- **Recharts** — Charts and data visualization
- **axios** — HTTP client
- **xml2js** — RSS/XML parsing
- **date-fns** — Date formatting
- **lucide-react** — Icons
- **react-hot-toast** — Toast notifications

## License

Internal use only — UGRO Capital Risk Team.
