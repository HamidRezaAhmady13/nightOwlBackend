import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/features/lib/api";
import { queryKeys } from "@/features/utils/queryKeys";
import getToken from "@/features/lib/getMeAndUsers";
import { User, UserPreview } from "@/features/types";

export function useFollowUser(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post(`/users/${encodeURIComponent(username)}/follow`),
    onMutate: async () => {
      // optimistic add
      await queryClient.cancelQueries({
        queryKey: queryKeys.user.current(getToken() ?? ""),
      });
      const prev = queryClient.getQueryData<User | undefined>(
        queryKeys.user.current(getToken() ?? ""),
      );
      queryClient.setQueryData<User | undefined>(
        queryKeys.user.current(getToken() ?? ""),
        (old) =>
          old
            ? {
                ...old,
                following: [
                  ...(old.following ?? []),
                  { username, id: `temp-${Date.now()}` } as UserPreview,
                ],
              }
            : old,
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev)
        queryClient.setQueryData(
          queryKeys.user.current(getToken() ?? ""),
          ctx.prev,
        );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.byUsername(username),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.current(getToken() ?? ""),
      });
    },
  });
}
