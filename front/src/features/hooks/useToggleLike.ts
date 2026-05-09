import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Post, UserPreview } from "@/features/types";
import api from "../lib/api";
import { queryKeys } from "../utils/queryKeys";

export type PostsInfiniteData = {
  pages: { items: Post[] }[];
  pageParams: unknown[];
};

function toggleLikeForPost(post: Post, currentUser: UserPreview): Post {
  const isLiked = post.likedBy?.some((u) => u.id === currentUser.id);
  return {
    ...post,
    likesCount: isLiked ? post.likesCount - 1 : post.likesCount + 1,
    likedBy: isLiked
      ? post.likedBy?.filter((u) => u.id !== currentUser.id)
      : [...(post.likedBy ?? []), currentUser],
  };
}

export function useToggleLike(postId: string, currentUser: UserPreview) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post(`/posts/${postId}/toggle-like`);
    },
    onSuccess: () => {
      queryKeys.posts.all,
        queryClient.setQueryData<PostsInfiniteData>(
          queryKeys.posts.all,
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                items: page.items.map((p) =>
                  p.id === postId ? toggleLikeForPost(p, currentUser) : p
                ),
              })),
            };
          }
        );

      // 2) Update single post cache
      queryClient.setQueryData<Post>(queryKeys.posts.detail(postId), (old) => {
        if (!old) return old;
        return toggleLikeForPost(old, currentUser);
      });

      // 3) Gentle revalidation
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(postId),
      });
    },
  });
}
