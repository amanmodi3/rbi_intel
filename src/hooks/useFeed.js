import { useState, useCallback, useEffect, useRef } from 'react';
import { tagItem } from '../utils/nbfcKeywords.js';
import toast from 'react-hot-toast';

export function useFeed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedStatus, setFeedStatus] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const fetchingRef = useRef(false);

  const fetchItems = useCallback(async (forceRefresh = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      if (forceRefresh) {
        // Ask the server to pull fresh data from RBI and merge into Redis
        const refreshRes = await fetch('/api/refresh', { method: 'POST' });
        if (!refreshRes.ok) {
          toast('Server refresh failed — showing stored data', { duration: 4000 });
        }
      }

      const res = await fetch('/api/items');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const { items: raw, feedStatus: status } = await res.json();

      // Apply NBFC tagging client-side and convert ISO dates to Date objects
      const tagged = raw.map((item) => {
        const { tags, isNBFCRelevant, isGeneralNBFC } = tagItem(item.title, item.description);
        return { ...item, pubDate: new Date(item.pubDate), tags, isNBFCRelevant, isGeneralNBFC };
      });

      setItems(tagged);
      setFeedStatus(status || {});
      setLastUpdated(new Date());
      setFromCache(!forceRefresh);

      if (tagged.length > 0) {
        const nbfcCount = tagged.filter((i) => i.isNBFCRelevant).length;
        toast.success(`Loaded ${tagged.length} items (${nbfcCount} NBFC-relevant)`, { duration: 3000 });
      }
    } catch (err) {
      console.error('Failed to fetch items:', err);
      toast.error('Failed to load data from server');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    feedStatus,
    lastUpdated,
    fromCache,
    refresh: () => fetchItems(true),
  };
}

export default useFeed;
