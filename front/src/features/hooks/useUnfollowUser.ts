import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/features/lib/api";
import { queryKeys } from "@/features/utils/queryKeys";
import { User, UserPreview } from "@/features/types";

export function useUnfollowUser(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      api.delete(`/users/${encodeURIComponent(username)}/unfollow`),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.user.current(),
      });
      const prev = queryClient.getQueryData<User | undefined>(
        queryKeys.user.current(),
      );
      queryClient.setQueryData<User | undefined>(
        queryKeys.user.current(),
        (old) =>
          old
            ? {
                ...old,
                following: (old.following ?? []).filter(
                  (u: UserPreview) => u.username !== username,
                ),
              }
            : old,
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev)
        queryClient.setQueryData(queryKeys.user.current(), ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.byUsername(username),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.current(),
      });
    },
  });
}
