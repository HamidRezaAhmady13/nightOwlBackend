import { Notification } from "@/features/types/notification.types";
import Link from "next/link";
import AvatarImage from "../shared/AvatarImage";
import React, { useEffect, useState } from "react";
import { getUserbyId } from "@/features/lib/getMeAndUsers";

import api, { BACKEND_BASE } from "@/features/lib/api";
import { User } from "@/features/types";

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
            src={
              displayUser?.avatarUrl
                ? displayUser?.avatarUrl.startsWith("http")
                  ? displayUser?.avatarUrl
                  : `${BACKEND_BASE}${displayUser?.avatarUrl}`
                : `${BACKEND_BASE}/uploads/default-avatar.png`
            }
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
