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
import { useCurrentUser } from "./AuthContext";
import getToken from "../lib/getMeAndUsers";

type SocketContextValue = { socket: Socket | null; connected: boolean };
const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
});
export const useSocket = () => useContext(SocketContext);

export default function SocketProvider({
  children,
  url = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000",
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
  const { token, user } = useCurrentUser();
  const [shouldConnect, setShouldConnect] = useState(false);

  useEffect(() => {
    if (token && user?.id) {
      setShouldConnect(true);
    } else {
      setShouldConnect(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (!shouldConnect) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    if (socketRef.current) {
      return;
    }

    const freshToken = getToken();

    const s = io(url, {
      auth: { token: getToken() },
      withCredentials: true,
      autoConnect: true,
    });

    socketRef.current = s;

    const handleConnect = () => {
      setConnected(true);
      if (token) s.emit("auth", { token });
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const handleConnectError = (err: any) => {
      setConnected(false);
    };

    s.on("connect", handleConnect);
    s.on("disconnect", handleDisconnect);
    s.on("connect_error", handleConnectError);

    // 👇 Listen for token refresh
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" && e.newValue && socketRef.current === s) {
        s.disconnect(); // Will trigger auto-reconnect
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // 👇 Cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      s.off("connect", handleConnect);
      s.off("disconnect", handleDisconnect);
      s.off("connect_error", handleConnectError);
      s.close();
      socketRef.current = null;
      setConnected(false);
    };
  }, [shouldConnect, url, token]);
  useEffect(() => {
    const s = socketRef.current;
    if (!s || !shouldConnect) return;

    const onNotification = (raw: BackendNotificationEntity) => {
      const ntf = toNotification(raw);
      if (seen?.current?.has(String(raw.id))) {
        return;
      }

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
            (item) => item.id === ntf.id
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
        }
      );

      queryClient.setQueryData<number | undefined>(unreadKey, (prev) => {
        return (prev ?? 0) + 1;
      });

      if (!seen.current.has(ntf.id)) {
        seen.current.add(ntf.id);
        showSimpleToast(ntf, router);
      }

      if (raw.sourceId && !ntf.sourceUser) {
        fetchUserById(raw.sourceId)
          .then((user) => {
            queryClient.setQueryData<
              InfiniteData<NotificationFeedPage> | undefined
            >(infiniteKey, (prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                pages: prev.pages.map((page) => ({
                  ...page,
                  items: page.items.map((item) =>
                    item.id === ntf.id ? { ...item, sourceUser: user } : item
                  ),
                })),
              };
            });
          })
          .catch(() => {});
      }
    };

    setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unread(userId),
      });
    }, 500);

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
