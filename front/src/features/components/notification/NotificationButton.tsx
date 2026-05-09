// NotificationButton.tsx
import React from "react";
import { AiOutlineBell, AiFillBell } from "react-icons/ai";
import clsx from "clsx";
import Link from "next/link";
import { Url } from "next/dist/shared/lib/router/router";
import { useCurrentUser } from "../AuthContext";
import { useUnreadCount } from "@/features/hooks/useUnreadCount";

type Props = {
  unread?: boolean;
  href: Url;
};

export default function NotificationButton({ href }: Props) {
  const { user } = useCurrentUser();

  // Step 1.1: Get unread count
  const { data: unreadCount = 0, isLoading } = useUnreadCount(user?.id);
  console.log(unreadCount);

  // Step 1.2: Show loading state briefly
  if (isLoading) {
    return (
      <div className="p-1">
        <AiOutlineBell size={24} className="opacity-50" />
      </div>
    );
  }

  // Step 1.3: Render based on count
  const hasUnread = unreadCount > 0;

  return (
    <Link
      href={href}
      aria-label={
        hasUnread ? `${unreadCount} unread notifications` : "Notifications"
      }
      className={clsx(
        "intent-invisible p-1 rounded",
        "u-focus-not-visible",
        "transition-colors duration-normal",
        hasUnread
          ? "text-amber-800 hover:text-amber-900 dark:text-cobalt-300 dark:hover:text-cobalt-200"
          : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
      )}
    >
      {hasUnread ? (
        <div className="relative">
          <AiFillBell size={24} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        </div>
      ) : (
        <AiOutlineBell size={24} />
      )}
    </Link>
  );
}
