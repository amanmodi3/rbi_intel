const FEED_URLS = {
  pressreleases: 'https://www.rbi.org.in/pressreleases_rss.xml',
  notifications: 'https://www.rbi.org.in/notifications_rss.xml',
  publications:  'https://www.rbi.org.in/Publication_rss.xml',
  speeches:      'https://www.rbi.org.in/speeches_rss.xml',
};

export default async function handler(req, res) {
  const { feed } = req.query;
  const url = FEED_URLS[feed];

  if (!url) {
    return res.status(404).json({ error: `Unknown feed: ${feed}` });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RBIIntel/1.0)',
        'Accept': 'application/xml, text/xml, */*',
      },
    });

    if (!response.ok) {
      return res.status(502).json({ error: `RBI returned ${response.status}` });
    }

    const xml = await response.text();

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    return res.status(200).send(xml);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}
