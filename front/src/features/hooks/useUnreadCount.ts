import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../utils/queryKeys";
import api from "../lib/api";

export function useUnreadCount(userId?: string) {
  return useQuery({
    queryKey: queryKeys.notifications.unread(userId),
    queryFn: async () => {
      // Fetch from API - simple and direct
      const res = await api.get<{ unread: number }>(
        "/notifications/unread-count"
      );

      return res.data.unread;
    },
    enabled: !!userId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}
