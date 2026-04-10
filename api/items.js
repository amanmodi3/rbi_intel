import { createClient } from 'redis';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client = createClient({ url: process.env.REDIS_URL });
  try {
    await client.connect();
    const raw = await client.get('rbi_items');
    const items = raw ? JSON.parse(raw) : [];

    // Derive per-feed status from stored items
    const feedStatus = {};
    for (const item of items) {
      if (!feedStatus[item.feedId]) {
        feedStatus[item.feedId] = { ok: true, count: 0, fromCache: true };
      }
      feedStatus[item.feedId].count++;
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.json({ items, feedStatus, count: items.length });
  } catch (err) {
    console.error('Redis read error:', err);
    return res.status(503).json({ error: 'Storage unavailable', items: [], feedStatus: {} });
  } finally {
    await client.disconnect().catch(() => {});
  }
}
