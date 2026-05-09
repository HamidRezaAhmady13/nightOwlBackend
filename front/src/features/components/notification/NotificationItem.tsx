// NotificationItem.tsx
import { Notification } from "@/features/types/notification.types";
import Link from "next/link";
import AvatarImage from "../shared/AvatarImage";
import React, { useEffect, useMemo, useState } from "react";
import { useNotifications } from "@/features/hooks/useNotifications";
import { getUserbyId } from "@/features/lib/getMeAndUsers";
import { queryKeys } from "@/features/utils/queryKeys";
import { useQuery } from "@tanstack/react-query";
import api from "@/features/lib/api";
import { User } from "@/features/types";

const getAvatarUrl = (path?: string) => {
  if (!path) return undefined;
  // If path is already a full URL, return as-is
  if (path.startsWith("http")) return path;
  // If it's a relative path, prepend your API URL
  return `http://localhost:3000${path}`;
};

const NotificationItem = React.memo(function NotificationItem({
  ntf,
}: {
  ntf: Notification;
}) {
  const [fetchedUser, setFetchedUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    if (!ntf.sourceUser && ntf.userId) {
      getUserbyId(ntf.sourceId)
        .then(setFetchedUser)
        .catch(() => {});
    }
  }, [ntf.sourceUser, ntf.userId]);

  const displayUser = ntf.sourceUser || fetchedUser;

  return (
    <Link
      href={
        ntf.payloadRef?.commentId
          ? `/post/${ntf.payloadRef.postId}?commentId=${ntf.payloadRef.commentId}`
          : ntf.payloadRef?.postId
          ? `/post/${ntf.payloadRef.postId}`
          : `/users/${displayUser?.username}`
      }
    >
      {" "}
      <li className="p-sm rounded u-border my-sm">
        {" "}
        <div className="text-sm font-medium u-flex-start gap-sm">
          {" "}
          <AvatarImage
            src={getAvatarUrl(displayUser?.avatarUrl)}
            alt={displayUser?.username}
            size={24}
          />{" "}
          {displayUser?.username}{" "}
          {ntf.type === "like"
            ? "liked your post"
            : ntf.type === "comment"
            ? "commented on your post"
            : "followed you"}{" "}
        </div>{" "}
        <div className="text-xs u-text-secondary">
          {" "}
          {ntf.type} • {new Date(ntf.createdAt).toLocaleString()}{" "}
        </div>{" "}
        {ntf.readAt === null && (
          <span className="ml-2 u-text-cobalt-soft font-semibold">Unread</span>
        )}{" "}
      </li>{" "}
    </Link>
  );
});
export default NotificationItem;
