import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { CommentWithLikeState } from "../types";

import { queryKeys } from "../utils/queryKeys";

export function useCommentsInfinite({
  postId,
  limit = 10,
  enabled = true,
}: {
  postId: string;
  limit?: number;
  enabled?: boolean;
}) {
  return useInfiniteQuery({
    queryKey: queryKeys.comments.list(postId),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get<CommentWithLikeState[]>(
        `/comments/post/${postId}?page=${pageParam}&limit=${limit}`
      );

      return { data: res.data, page: pageParam };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.data.length < limit ? undefined : lastPage.page + 1,
    enabled,
  });
}

export function useRepliesInfinite({
  commentId,
  limit = 10,
  enabled = true,
}: {
  commentId: string;
  limit?: number;
  enabled?: boolean;
}) {
  return useInfiniteQuery({
    queryKey: queryKeys.replies.list(commentId),
    queryFn: async ({ pageParam }) => {
      const res = await api.get<CommentWithLikeState[]>(
        `/comments/${commentId}/replies?page=${pageParam}&limit=${limit}`
      );
      return { data: res.data, page: pageParam };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      Array.isArray(lastPage?.data) && lastPage.data.length < limit
        ? undefined
        : (lastPage?.page ?? 0) + 1,

    enabled,
  });
}
