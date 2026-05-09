import { useCallback, useEffect, useRef, useState } from "react";
import api from "../lib/api";

type PostPreview = {
  id: string;
  imageUrl: string | null;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
};

export function useProfilePosts({
  limit = 24,
  username,
}: {
  limit?: number;
  username?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<PostPreview[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // serialize requests
  const inFlightRef = useRef<number | null>(null);
  const reqCounter = useRef(0);

  const buildUrl = useCallback(
    (cursor?: string | null) => {
      const qs = new URLSearchParams();
      qs.set("limit", String(limit));
      if (cursor) qs.set("cursor", String(cursor));
      return username
        ? `/users/${encodeURIComponent(username)}/posts?${qs.toString()}`
        : `/posts?${qs.toString()}`;
    },
    [limit, username]
  );

  const fetchPage = useCallback(
    async (cursor?: string | null, replace = false) => {
      // avoid starting a fetch while one is already in flight
      if (inFlightRef.current !== null) {
        return null;
      }
      const reqId = ++reqCounter.current;
      inFlightRef.current = reqId;
      setLoading(true);
      setError(null);

      try {
        const url = buildUrl(cursor ?? undefined);

        const res = await api.get(url); // keep your api helper
        // if another request started after this one, ignore this result
        if (inFlightRef.current !== reqId) {
          return null;
        }
        const data = res.data ?? {};

        const pageItems: PostPreview[] = Array.isArray(data.items)
          ? data.items
          : [];

        // replace or append (we dedupe by id to be safe)
        setItems((prev) => {
          if (replace) return pageItems;
          const ids = new Set(prev.map((p) => p.id));
          const filtered = pageItems.filter((p) => !ids.has(p.id));
          return [...prev, ...filtered];
        });
        const returnedNext = data.nextCursor ?? null;
        setNextCursor(returnedNext);
        setHasMore(Boolean(returnedNext));
        return { items: pageItems, nextCursor: returnedNext };
      } catch (err: any) {
        setError(err);
        return null;
      } finally {
        if (inFlightRef.current === reqId) inFlightRef.current = null;
        setLoading(false);
      }
    },
    [buildUrl]
  );

  // initial load: single fetch that replaces items
  useEffect(() => {
    setItems([]);
    setNextCursor(null);
    setHasMore(true);
    fetchPage(null, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, limit]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    if (!nextCursor) {
      return;
    }

    fetchPage(nextCursor, false);
  }, [fetchPage, hasMore, loading, nextCursor]);

  const reload = useCallback(() => {
    setItems([]);
    setNextCursor(null);
    setHasMore(true);
    fetchPage(null, true);
  }, [fetchPage]);

  const reset = useCallback(() => {
    inFlightRef.current = null;
    setItems([]);
    setNextCursor(null);
    setHasMore(true);
    setError(null);
    setLoading(false);
  }, []);

  return { items, loading, error, hasMore, loadMore, reload, reset } as const;
}
