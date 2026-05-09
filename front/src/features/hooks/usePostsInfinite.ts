"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { FeedPage } from "@/features/types";
import { queryKeys } from "../utils/queryKeys";
import api from "../lib/api";

async function fetchPosts(limit: number, page: number): Promise<FeedPage> {
  const res = await api.get(`/posts/feed?limit=${limit}&page=${page}`);
  return res.data;
}
function getNextPageParam(last: FeedPage, pages: FeedPage[]) {
  const total = last.total ?? 0;
  const fetched = pages.reduce((acc, p) => acc + p.items.length, 0);
  return fetched < total ? pages.length + 1 : undefined;
}
export function usePostsInfinite(limit: number) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.infinite(limit),
    queryFn: ({ pageParam = 1 }) => fetchPosts(limit, pageParam),
    getNextPageParam,
    initialPageParam: 1,
  });
}
