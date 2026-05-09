import { useParams } from "next/navigation";

import { Post } from "@/features/types";
import { toSingleString } from "../lib/toSingleString";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import { queryKeys } from "../utils/queryKeys";

export function usePostQuery(opts?: { id?: string }) {
  const params = useParams();
  const paramId = toSingleString(params?.post);
  const postId = paramId ?? opts?.id;
  const queryClient = useQueryClient();

  return useQuery<Post, Error>({
    queryKey: queryKeys.posts.detail(postId),
    enabled: !!postId,

    initialData: () => {
      const feed = queryClient.getQueryData<{ items: Post[]; total: number }>(
        queryKeys.posts.list(1, 2)
      );
      return feed?.items.find((p) => p.id === postId);
    },

    queryFn: async () => {
      const res = await api.get(`/posts/${postId}`);

      return res.data as Post;
    },
  });
}

export function usePostsQuery(page: number = 1, limit: number = 2) {
  return useQuery<{ items: Post[]; total: number }, Error>({
    queryKey: queryKeys.posts.list(page, limit),
    queryFn: async () =>
      (await api.get(`/posts/feed?limit=${limit}&page=${page}`)).data as {
        items: Post[];
        total: number;
      },

    ...({ keepPreviousData: true } as unknown as Record<string, unknown>),
  });
}
