import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import api from "../lib/api";
import { queryKeys } from "../utils/queryKeys";
import { NotificationFeedPage } from "../types/notification.types";
import { useUserStore } from "../store/userStore";

export function useMarkManyRead() {
  const queryClient = useQueryClient();
  const currentUser = useUserStore((s) => s.user);

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await api.patch("/notifications/mark-many-read", { ids });
      return { ids, data: res.data }; // return ids so onSuccess can use them
    },
    onSuccess: ({ ids }) => {
      const unreadKey = queryKeys.notifications.unread(currentUser?.id);
      queryClient.setQueryData<number>(unreadKey, 0);

      const feedKey = queryKeys.notifications.infinite(currentUser?.id);
      queryClient.setQueryData<InfiniteData<NotificationFeedPage> | undefined>(
        feedKey,
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            pages: prev.pages.map((page) => ({
              ...page,
              items: page.items.map((item) =>
                ids.includes(item.id)
                  ? { ...item, readAt: new Date().toISOString() }
                  : item,
              ),
            })),
          };
        },
      );
    },
  });
}
