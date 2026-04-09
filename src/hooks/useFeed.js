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

// Synchronously read all feeds from localStorage and hydrate UI instantly on page load.
function hydrateFromStorage() {
  const allItems = [];
  for (const feed of FEEDS) {
    try {
      const raw = localStorage.getItem(`${CACHE_KEY_PREFIX}${feed.id}`);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      allItems.push(...parsed.map(item => ({ ...item, pubDate: new Date(item.pubDate) })));
    } catch { /* ignore */ }
  }
  allItems.sort((a, b) => b.pubDate - a.pubDate);
  return allItems;
}


export function useFeed() {
  const initialItems = useState(() => hydrateFromStorage())[0];
  const [items, setItems] = useState(initialItems);
  // Only show loading skeleton when there is nothing at all to display.
  const [loading, setLoading] = useState(initialItems.length === 0);
  const [feedStatus, setFeedStatus] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const fetchingRef = useRef(false);

  const fetchSingleFeed = useCallback(async (feed, forceRefresh = false) => {
    let lastError = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await axios.get(feed.proxyPath, {
          timeout: 15000,
          responseType: 'text',
          headers: {
            Accept: 'application/xml, text/xml, */*',
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

    // Fallback to public CORS proxy
    try {
      const fallbackUrl = `${CORS_PROXY}${encodeURIComponent(feed.directUrl)}`;
      const response = await axios.get(fallbackUrl, { timeout: 15000, responseType: 'text' });
      if (response.data && typeof response.data === 'string' && response.data.includes('<')) {
        return { data: response.data, source: 'cors-proxy' };
      }
    } catch (err) {
      lastError = err;
    }

    throw lastError || new Error('All fetch methods failed');
  }, []);

  // Read cached feed for a given feedId.
  // ignoreAge=true returns data regardless of age (used as emergency fallback).
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

  const cacheFeed = useCallback((feedId, feedItems) => {
    try {
      localStorage.setItem(`${CACHE_KEY_PREFIX}${feedId}`, JSON.stringify(feedItems));
      localStorage.setItem(`${CACHE_TIMESTAMP_PREFIX}${feedId}`, String(Date.now()));
    } catch { /* storage full */ }
  }, []);

  const fetchAllFeeds = useCallback(
    async (forceRefresh = false) => {
      if (fetchingRef.current) return;

      fetchingRef.current = true;
      // Never blank existing content — only show spinner on a truly empty first load.
      if (items.length === 0) setLoading(true);

      const allItems = [];
      const newStatus = {};
      let anyFromCache = false;
      let anyFresh = false;

      const feedPromises = FEEDS.map(async (feed) => {
        if (!forceRefresh) {
          const cached = getCachedFeed(feed.id);
          if (cached && cached.length > 0) {
            newStatus[feed.id] = { ok: true, fromCache: true };
            anyFromCache = true;
            return cached;
          }
        }

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

          // Fetch failed — fall back to any previously saved data regardless of age
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

      const seen = new Set();
      const deduplicated = allItems.filter((item) => {
        const key = item.id || item.link;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      const taggedItems = deduplicated.map((item) => {
        const { tags, isNBFCRelevant, isGeneralNBFC } = tagItem(item.title, item.description);
        return { ...item, tags, isNBFCRelevant, isGeneralNBFC };
      });

      taggedItems.sort((a, b) => b.pubDate - a.pubDate);

      setItems(taggedItems);
      setFeedStatus(newStatus);
      setLastUpdated(new Date());
      setFromCache(anyFromCache && !anyFresh);
      setLoading(false);
      fetchingRef.current = false;

      if (taggedItems.length > 0) {
        const nbfcCount = taggedItems.filter((i) => i.isNBFCRelevant).length;
        toast.success(`✅ Loaded ${taggedItems.length} items (${nbfcCount} NBFC-relevant)`, { duration: 3000 });
      }
    },
    [items.length, fetchSingleFeed, getCachedFeed, cacheFeed]
  );

  // On mount: only fetch if there is nothing in storage at all (first ever visit).
  // Otherwise show cached data immediately and wait for the user to manually refresh.
  useEffect(() => {
    if (initialItems.length === 0) fetchAllFeeds();
    else setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
