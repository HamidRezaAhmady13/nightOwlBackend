"use client";
import NotificationItem from "@/features/components/notification/NotificationItem";
import Button from "@/features/components/shared/Button";
import Spinner from "@/features/components/shared/Spinner";
import {
  Notification as AppNotification,
  NotificationFeedPage,
} from "@/features/types/notification.types";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNotifications } from "@/features/hooks/useNotifications";
import { useMarkManyRead } from "@/features/hooks/useMarkManyRead";
import { useCurrentUser } from "@/features/components/AuthContext";

export default function NotificationsPage() {
  const { user: currentUser } = useCurrentUser();
  const hasMarkedRead = useRef(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isPending: isLoading,
  } = useNotifications(currentUser?.id);

  const { mutate: markManyRead } = useMarkManyRead();

  // Memoized notifications with deduplication
  const notifications = useMemo(() => {
    if (!data?.pages) return [];

    const seen = new Set<string>();
    const unique: AppNotification[] = [];

    data.pages.forEach((page) => {
      page.items.forEach((ntf) => {
        if (!seen.has(ntf.id)) {
          seen.add(ntf.id);
          unique.push(ntf);
        }
      });
    });

    return unique;
  }, [data?.pages]);

  useEffect(() => {
    if (!hasMarkedRead.current && notifications.length > 0 && !isLoading) {
      const unreadIds = notifications.filter((n) => !n.readAt).map((n) => n.id);
      console.log("📝 Unread IDs to mark:", unreadIds.length);

      if (unreadIds.length > 0) {
        markManyRead(unreadIds);
        hasMarkedRead.current = true;
      }
    }
  }, [notifications.length, isLoading, markManyRead]); // Simpler dependency
  useEffect(() => {
    if (notifications.length > 0) {
      const unreadIds = notifications.filter((n) => !n.readAt).map((n) => n.id);
      if (unreadIds.length > 0) {
        markManyRead(unreadIds); // mutation to backend
      }
    }
  }, [notifications]);

  if (isLoading) return <Spinner />;
  if (notifications.length === 0) return <div>No notifications</div>;

  return (
    <>
      <ul className="space-y-2">
        {notifications.map((ntf) => (
          <NotificationItem ntf={ntf} key={ntf.id} />
        ))}
      </ul>

      {hasNextPage && (
        <div className="u-flex-center mt-md">
          <Button onClick={() => fetchNextPage()} disabled={isLoading}>
            {isLoading ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </>
  );
}
