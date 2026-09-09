import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/features/lib/api";
import { queryKeys } from "@/features/utils/queryKeys";
import toast from "react-hot-toast";

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => api.delete(`/posts/${postId}`),

    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.all });

      const previousAll = queryClient.getQueryData(queryKeys.posts.all);
      const previousDetail = queryClient.getQueryData(
        queryKeys.posts.detail(postId),
      );

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

      queryClient.removeQueries({ queryKey: queryKeys.posts.detail(postId) });

      return { previousAll, previousDetail };
    },

    onSuccess: () => {
      toast.success("Post deleted");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },

    onError: (_error, _postId, context: any) => {
      if (context?.previousAll) {
        queryClient.setQueryData(queryKeys.posts.all, context.previousAll);
      }
      toast.error("Failed to delete post");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}
