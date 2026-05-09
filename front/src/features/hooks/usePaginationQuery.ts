"use client";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

export function usePaginationQuery(
  defaultLimit = process.env.PAGE_LIMIT_ENV || 10
) {
  const searchParams = useSearchParams();
  const page = useMemo(
    () => Math.max(1, Number(searchParams.get("page") ?? 1)),
    [searchParams]
  );
  const limit = useMemo(
    () => Math.max(1, Number(searchParams.get("limit") ?? defaultLimit)),
    [searchParams, defaultLimit]
  );

  const setParams = (next: Partial<{ page: number; limit: number }>) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (next.page !== undefined) params.set("page", String(next.page));
    if (next.limit !== undefined) params.set("limit", String(next.limit));
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );
  };

  return { page, limit, setParams };
}
