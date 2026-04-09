import { parseISO, parse, isValid } from 'date-fns';

/**
 * Strip HTML tags from a string
 */
function stripHtml(html) {
  if (!html) return '';
  return html
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

/**
 * Try to parse a date string from RSS feed
 */
function parseDate(dateStr) {
  if (!dateStr) return new Date();

  // Try standard ISO parse first
  let date = parseISO(dateStr);
  if (isValid(date)) return date;

  // Try RFC 2822 format (common in RSS)
  try {
    date = new Date(dateStr);
    if (isValid(date)) return date;
  } catch (e) {
    // ignore
  }

  // Try common Indian date formats
  const formats = [
    'dd MMM yyyy',
    'dd-MM-yyyy',
    'dd/MM/yyyy',
    'MMMM dd, yyyy',
    'MMM dd, yyyy',
  ];

  for (const fmt of formats) {
    try {
      date = parse(dateStr, fmt, new Date());
      if (isValid(date)) return date;
    } catch (e) {
      // try next format
    }
  }

  return new Date();
}

/**
 * Get text content of an XML element, returns empty string if not found
 */
function getElementText(parent, tagName) {
  if (!parent) return '';
  const el = parent.getElementsByTagName(tagName)[0];
  if (!el) return '';
  return el.textContent || '';
}

/**
 * Parse RSS XML string into an array of feed items using native DOMParser
 */
export async function parseRssFeed(xmlString, feedId, feedName) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');

    // Check for parse errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      console.error(`XML parse error for ${feedName}:`, parseError.textContent);
      return [];
    }

    let items = [];

    // Handle RSS 2.0 format
    const rssItems = doc.querySelectorAll('item');
    if (rssItems.length > 0) {
      rssItems.forEach((item) => {
        const title = getElementText(item, 'title') || 'Untitled';
        const link = getElementText(item, 'link') || '';
        const description = stripHtml(getElementText(item, 'description'));
        const pubDate = parseDate(getElementText(item, 'pubDate'));
        const guid = getElementText(item, 'guid') || link || `${feedId}-${title}`;

        items.push({
          id: guid,
          title,
          link,
          description,
          pubDate,
          feedId,
          feedName,
        });
      });
    }
    // Handle Atom format
    else {
      const entries = doc.querySelectorAll('entry');
      entries.forEach((entry) => {
        const title = getElementText(entry, 'title') || 'Untitled';
        const linkEl = entry.querySelector('link');
        const link = linkEl ? (linkEl.getAttribute('href') || linkEl.textContent || '') : '';
        const description = stripHtml(
          getElementText(entry, 'summary') || getElementText(entry, 'content')
        );
        const pubDate = parseDate(
          getElementText(entry, 'published') || getElementText(entry, 'updated')
        );
        const guid = getElementText(entry, 'id') || link || `${feedId}-${title}`;

        items.push({
          id: guid,
          title,
          link,
          description,
          pubDate,
          feedId,
          feedName,
        });
      });
    }

    return items;
  } catch (error) {
    console.error(`Error parsing RSS feed ${feedName}:`, error);
    return [];
  }
}
