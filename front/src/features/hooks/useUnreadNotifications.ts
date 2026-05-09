// // features/hooks/useUnreadNotifications.ts
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { queryKeys } from "../utils/queryKeys";
// import api from "../lib/api";

// // export function useUnreadNotifications(userId?: string) {
// //   return useQuery({
// //     queryKey: queryKeys.notifications.unread(userId),
// //     queryFn: async () => {
// //       const res = await api.get<{ unread: number }>("/notifications/unread");
// //       return res.data.unread;
// //     },
// //     enabled: !!userId,

// //     refetchInterval: 30000,
// //   });
// // }

// // export function useUnreadCountFromNotf(userId?: string) {
// //   const queryClient = useQueryClient();

// //   return useQuery({
// //     queryKey: queryKeys.notifications.unread(userId),
// //     queryFn: async () => {
// //       const res = await api.get<{ unread: number }>("/notifications/unread");
// //       return res.data.unread;
// //     },
// //     enabled: !!userId,
// //     // 👇 Important: Cache the count properly
// //     initialData: () => {
// //       // Try to get from cache first
// //       const cached = queryClient.getQueryData<number>(
// //         queryKeys.notifications.unread(userId)
// //       );
// //       return cached ?? 0;
// //     },
// //   });
// // }
