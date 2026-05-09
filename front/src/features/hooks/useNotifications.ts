import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";

import api from "../lib/api";
import { NotificationFeedPage } from "../types/notification.types";
import { queryKeys } from "../utils/queryKeys";

export function useNotifications(userId?: string, limit = 10) {
  return useInfiniteQuery({
    queryKey: queryKeys.notifications.infinite(userId, limit),
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      const res = await api.get<NotificationFeedPage>("/notifications", {
        params: { cursor: pageParam, limit },
      });
      return res.data;
    },

    getNextPageParam: (lastPage) => lastPage.cursor ?? null,
    initialPageParam: null,
    enabled: !!userId,
  });
}
