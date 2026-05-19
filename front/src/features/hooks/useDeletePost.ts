import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/features/lib/api";
import { queryKeys } from "@/features/utils/queryKeys";
import toast from "react-hot-toast";

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => api.delete(`/posts/${postId}`),

    // Optimistically remove the post from the cache
    onMutate: async (postId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.all });

      // Snapshot previous data
      const previousAll = queryClient.getQueryData(queryKeys.posts.all);
      const previousDetail = queryClient.getQueryData(
        queryKeys.posts.detail(postId),
      );

      // Remove from the all-posts list
      queryClient.setQueryData(queryKeys.posts.all, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.filter((p: any) => p.id !== postId),
          })),
        };
      });

      // Remove the detail cache
      queryClient.removeQueries({ queryKey: queryKeys.posts.detail(postId) });

      return { previousAll, previousDetail };
    },

    onSuccess: () => {
      toast.success("Post deleted");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },

    onError: (_error, _postId, context: any) => {
      // Restore previous data
      if (context?.previousAll) {
        queryClient.setQueryData(queryKeys.posts.all, context.previousAll);
      }
      toast.error("Failed to delete post");
    },

    onSettled: () => {
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}
