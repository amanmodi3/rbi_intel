import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { parseRssFeed } from '../utils/rssParser.js';
import { tagItem } from '../utils/nbfcKeywords.js';
import {
  FEEDS,
  CACHE_KEY_PREFIX,
  CACHE_TIMESTAMP_PREFIX,
  CACHE_MAX_AGE_MS,
  CORS_PROXY,
} from '../utils/feedConfig.js';
import toast from 'react-hot-toast';

const MAX_RETRIES = 2;

/**
 * Custom hook for fetching, parsing, tagging, caching, and managing RSS feed data
 */
export function useFeed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedStatus, setFeedStatus] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const fetchingRef = useRef(false);

  /**
   * Try to fetch a feed with retries and fallback to CORS proxy
   */
  const fetchSingleFeed = useCallback(async (feed, forceRefresh = false) => {
    let lastError = null;

    // Try proxy path first (up to MAX_RETRIES times)
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await axios.get(feed.proxyPath, {
          timeout: 15000,
          responseType: 'text',
          headers: {
            Accept: 'application/xml, text/xml, */*',
            // Tell Vercel's CDN to bypass its cache and fetch fresh data
            ...(forceRefresh && { 'Cache-Control': 'no-cache' }),
          },
        });
        if (response.data && typeof response.data === 'string' && response.data.includes('<')) {
          return { data: response.data, source: 'proxy' };
        }
      } catch (err) {
        lastError = err;
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        }
      }
    }

    // Fallback to CORS proxy
    try {
      const fallbackUrl = `${CORS_PROXY}${encodeURIComponent(feed.directUrl)}`;
      const response = await axios.get(fallbackUrl, {
        timeout: 15000,
        responseType: 'text',
      });
      if (response.data && typeof response.data === 'string' && response.data.includes('<')) {
        return { data: response.data, source: 'cors-proxy' };
      }
    } catch (err) {
      lastError = err;
    }

    throw lastError || new Error('All fetch methods failed');
  }, []);

  /**
   * Read cached feed. If ignoreAge=true, return data regardless of how old it is
   * (used as a safety fallback when a live fetch fails or returns empty).
   */
  const getCachedFeed = useCallback((feedId, ignoreAge = false) => {
    try {
      const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${feedId}`);
      if (!cached) return null;

      if (!ignoreAge) {
        const tsStr = localStorage.getItem(`${CACHE_TIMESTAMP_PREFIX}${feedId}`);
        if (!tsStr) return null;
        if (Date.now() - parseInt(tsStr, 10) > CACHE_MAX_AGE_MS) return null;
      }

      const parsed = JSON.parse(cached);
      return parsed.map((item) => ({ ...item, pubDate: new Date(item.pubDate) }));
    } catch {
      return null;
    }
  }, []);

  /**
   * Save feed data to cache
   */
  const cacheFeed = useCallback((feedId, feedItems) => {
    try {
      localStorage.setItem(`${CACHE_KEY_PREFIX}${feedId}`, JSON.stringify(feedItems));
      localStorage.setItem(`${CACHE_TIMESTAMP_PREFIX}${feedId}`, String(Date.now()));
    } catch {
      // Storage full or unavailable
    }
  }, []);

  /**
   * Fetch all feeds, applying cache where valid
   */
  const fetchAllFeeds = useCallback(
    async (forceRefresh = false) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      setLoading(true);

      const allItems = [];
      const newStatus = {};
      let anyFromCache = false;
      let anyFresh = false;

      const feedPromises = FEEDS.map(async (feed) => {
        // Check cache first (unless forcing refresh)
        if (!forceRefresh) {
          const cached = getCachedFeed(feed.id);
          if (cached && cached.length > 0) {
            newStatus[feed.id] = { ok: true, fromCache: true };
            anyFromCache = true;
            return cached;
          }
        }

        // Fetch fresh data
        try {
          const { data } = await fetchSingleFeed(feed, forceRefresh);
          const parsed = await parseRssFeed(data, feed.id, feed.name);

          if (parsed.length > 0) {
            cacheFeed(feed.id, parsed);
            newStatus[feed.id] = { ok: true, fromCache: false };
            anyFresh = true;
            return parsed;
          }

          // Fetch returned 0 items — fall back to any previously saved data
          const stale = getCachedFeed(feed.id, true);
          if (stale && stale.length > 0) {
            newStatus[feed.id] = { ok: true, fromCache: true };
            anyFromCache = true;
            toast(`⚠️ ${feed.name}: no new items, showing saved data`, { duration: 4000 });
            return stale;
          }
          newStatus[feed.id] = { ok: false, error: 'No items parsed' };
          toast.error(`⚠️ ${feed.name}: no data available`, { duration: 4000 });
          return [];
        } catch (err) {
          console.error(`Failed to fetch ${feed.name}:`, err);

          // Fetch failed — always fall back to any previously saved data, no matter how old
          const stale = getCachedFeed(feed.id, true);
          if (stale && stale.length > 0) {
            newStatus[feed.id] = { ok: true, fromCache: true, hadError: true };
            anyFromCache = true;
            toast(`⚠️ ${feed.name}: fetch failed, showing saved data`, { duration: 4000 });
            return stale;
          }
          newStatus[feed.id] = { ok: false, error: err.message };
          toast.error(`⚠️ ${feed.name} failed to load`, { duration: 4000 });
          return [];
        }
      });

      const results = await Promise.allSettled(feedPromises);

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          allItems.push(...result.value);
        }
      }

      // Deduplicate by id/link
      const seen = new Set();
      const deduplicated = allItems.filter((item) => {
        const key = item.id || item.link;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Tag all items
      const taggedItems = deduplicated.map((item) => {
        const { tags, isNBFCRelevant, isGeneralNBFC } = tagItem(item.title, item.description);
        return { ...item, tags, isNBFCRelevant, isGeneralNBFC };
      });

      // Sort by date (newest first)
      taggedItems.sort((a, b) => b.pubDate - a.pubDate);

      setItems(taggedItems);
      setFeedStatus(newStatus);
      setLastUpdated(new Date());
      setFromCache(anyFromCache && !anyFresh);
      setLoading(false);
      fetchingRef.current = false;

      if (taggedItems.length > 0) {
        const nbfcCount = taggedItems.filter((i) => i.isNBFCRelevant).length;
        toast.success(
          `✅ Loaded ${taggedItems.length} items (${nbfcCount} NBFC-relevant)`,
          { duration: 3000 }
        );
      }
    },
    [fetchSingleFeed, getCachedFeed, cacheFeed]
  );

  // Auto-fetch on mount
  useEffect(() => {
    fetchAllFeeds();
  }, [fetchAllFeeds]);

  return {
    items,
    loading,
    feedStatus,
    lastUpdated,
    fromCache,
    refresh: () => fetchAllFeeds(true),
  };
}

export default useFeed;
