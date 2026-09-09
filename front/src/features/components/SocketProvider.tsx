"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import type {
  NotificationFeedPage,
  BackendNotificationEntity,
} from "../types/notification.types";
import { useRouter } from "next/navigation";
import { showSimpleToast } from "./ntfToast";
import { toNotification } from "@/features/utils/dateUtils";
import { queryKeys } from "../utils/queryKeys";
import { fetchUserById } from "../lib/api";

type SocketContextValue = { socket: Socket | null; connected: boolean };
const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
});
export const useSocket = () => useContext(SocketContext);

export default function SocketProvider({
  children,
  url = process.env.NEXT_PUBLIC_SOCKET_URL || "https://127.0.0.1:3001",
  userId,
}: {
  children: React.ReactNode;
  url?: string;
  userId?: string;
}) {
  const seen = useRef(new Set<string>());
  const socketRef = useRef<Socket | null>(null);
  const router = useRouter();
  const [connected, setConnected] = useState(false);
  const queryClient = useQueryClient();

  // Connect socket if we have a logged-in user
  const shouldConnect = Boolean(userId);

  useEffect(() => {
    if (!shouldConnect) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    if (socketRef.current) return;

    // HttpOnly cookie will automatically be sent because withCredentials: true
    const s = io(url, {
      withCredentials: true,
      autoConnect: true,
    });

    socketRef.current = s;

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    const handleConnectError = () => setConnected(false);

    s.on("connect", handleConnect);
    s.on("disconnect", handleDisconnect);
    s.on("connect_error", handleConnectError);

    return () => {
      s.off("connect", handleConnect);
      s.off("disconnect", handleDisconnect);
      s.off("connect_error", handleConnectError);
      s.close();
      socketRef.current = null;
      setConnected(false);
    };
  }, [shouldConnect, url]);

  // Handle Notifications
  useEffect(() => {
    const s = socketRef.current;
    if (!s || !shouldConnect || !userId) return;

    const onNotification = (raw: BackendNotificationEntity) => {
      const ntf = toNotification(raw);
      if (seen.current.has(String(raw.id))) return;

      const infiniteKey = queryKeys.notifications.infinite(userId);
      const unreadKey = queryKeys.notifications.unread(userId);

      queryClient.setQueryData<InfiniteData<NotificationFeedPage> | undefined>(
        infiniteKey,
        (prev) => {
          if (!prev) {
            return {
              pages: [{ items: [ntf], total: 1, cursor: undefined }],
              pageParams: [null],
            };
          }

          const exists = prev.pages[0]?.items.some(
            (item) => item.id === ntf.id,
          );
          if (exists) return prev;

          const updatedFirstPage = {
            ...prev.pages[0],
            items: [ntf, ...prev.pages[0].items],
            total: prev.pages[0].total + 1,
          };

          return {
            ...prev,
            pages: [updatedFirstPage, ...prev.pages.slice(1)],
          };
        },
      );

      queryClient.setQueryData<number | undefined>(
        unreadKey,
        (prev) => (prev ?? 0) + 1,
      );

      if (!seen.current.has(ntf.id)) {
        seen.current.add(ntf.id);
        showSimpleToast(ntf, router);
      }
    };

    const onUnreadCount = (payload: { unread: number }) => {
      const key = queryKeys.notifications.unread(userId);
      queryClient.setQueryData<number | undefined>(key, () => payload.unread);
    };

    s.on("notification", onNotification);
    s.on("notifications:unreadCount", onUnreadCount);

    return () => {
      s.off("notification", onNotification);
      s.off("notifications:unreadCount", onUnreadCount);
    };
  }, [userId, queryClient, shouldConnect, router]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
}
