import axios from 'axios';
import xml2js from 'xml2js';
import { createClient } from 'redis';

const FEEDS = [
  { id: 'pressreleases', url: 'https://www.rbi.org.in/pressreleases_rss.xml', name: 'Press Releases' },
  { id: 'notifications',  url: 'https://www.rbi.org.in/notifications_rss.xml',  name: 'Notifications'  },
  { id: 'publications',   url: 'https://www.rbi.org.in/Publication_rss.xml',    name: 'Publications'   },
  { id: 'speeches',       url: 'https://www.rbi.org.in/speeches_rss.xml',       name: 'Speeches'       },
];

function stripHtml(html) {
  if (!html) return '';
  return String(html)
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function parseFeed(xmlString, feedId, feedName) {
  try {
    const result = await xml2js.parseStringPromise(xmlString, { explicitArray: false, trim: true });
    const channel = result?.rss?.channel;
    if (!channel) return [];

    const rawItems = channel.item || [];
    const itemArray = Array.isArray(rawItems) ? rawItems : [rawItems];

    return itemArray.map((item) => {
      const guid =
        (typeof item.guid === 'object' ? item.guid?._ : item.guid) ||
        item.link ||
        `${feedId}-${item.title}`;
      return {
        id: String(guid),
        title: stripHtml(item.title || 'Untitled'),
        link: String(item.link || ''),
        description: stripHtml(item.description || ''),
        pubDate: item.pubDate
          ? new Date(item.pubDate).toISOString()
          : new Date().toISOString(),
        feedId,
        feedName,
      };
    });
  } catch {
    return [];
  }
}

async function fetchAndParse(feed) {
  try {
    const response = await axios.get(feed.url, {
      timeout: 7000,
      responseType: 'text',
      headers: {
        Accept: 'application/xml, text/xml, */*',
        'User-Agent': 'RBI-Dashboard/1.0',
      },
    });
    if (!response.data || !String(response.data).includes('<')) return [];
    return parseFeed(response.data, feed.id, feed.name);
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  // Accept GET (Vercel cron) or POST (manual browser-triggered refresh)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client = createClient({ url: process.env.REDIS_URL });
  try {
    await client.connect();

    // Load existing stored items
    const raw = await client.get('rbi_items');
    const existing = raw ? JSON.parse(raw) : [];
    const seen = new Set(existing.map((i) => i.id));

    // Fetch all 4 feeds in parallel
    const results = await Promise.allSettled(FEEDS.map((feed) => fetchAndParse(feed)));

    let newCount = 0;
    for (const result of results) {
      if (result.status === 'fulfilled') {
        for (const item of result.value) {
          if (!seen.has(item.id)) {
            existing.push(item);
            seen.add(item.id);
            newCount++;
          }
        }
      }
    }

    // Sort newest first and persist
    existing.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    await client.set('rbi_items', JSON.stringify(existing));

    return res.json({
      success: true,
      total: existing.length,
      newItems: newCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Refresh error:', err);
    return res.status(500).json({ error: err.message });
  } finally {
    await client.disconnect().catch(() => {});
  }
}
