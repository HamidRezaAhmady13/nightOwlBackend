import { useState, useEffect } from "react";
import { searchUsers } from "../lib/searchUsers";

export function useUserSearch({
  query,
  limit = 5,
  page = 1,
  delay = 500,
}: {
  query: string;
  limit: number;
  page: number;
  delay?: number;
}) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchUsers({ q: query, page, limit });
        setResults(res.data);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [query, delay]);

  return { results, loading };
}
