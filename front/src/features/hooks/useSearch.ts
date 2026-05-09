import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { searchUsers } from "../lib/searchUsers";
import { User } from "../types";
import { getPageItems } from "../utils/getPageItems";

export function useSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get("q") || "";
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 20);

  const [results, setResults] = useState<User[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const totalPages = Math.ceil(total / limit);
  const pageItems = getPageItems(page, totalPages, 5);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await searchUsers({ q: query, page, limit });
        setResults(res.data);
        setTotal(res.total);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
        setShowResults(true);
      }
    };

    fetchResults();
  }, [query, page, limit]);

  useEffect(() => {
    const totalPages = Math.ceil(total / limit);
    if (page > totalPages && totalPages >= 1) {
      goToPage(totalPages);
    }
  }, [total, limit]);

  useEffect(() => {
    if (query) goToPage(1);
  }, [query]);

  const goToPage = (newPage: number) => {
    router.push(
      `/search?q=${encodeURIComponent(query)}&limit=${limit}&page=${newPage}`
    );
  };

  return {
    query,
    loading,
    showResults,
    results,
    total,
    limit,
    page,
    pageItems,
    goToPage,
    totalPages,
  };
}
