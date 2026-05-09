import { FeedPageGeneric, Post } from "./post.types";
import { User } from "./user.types";

export type BackendNotificationEntity = {
  id?: string;
  userId: string;
  type: string;
  smallBody: string;
  payloadRef: any;
  meta: any;
  status: string;
  createdAt: Date;
  deliveredAt: Date;
  readAt: Date;
  expireAt: Date;
  sourceId: string;
  username?: string;
};

export type FrontendDates = {
  createdAt: string;
  deliveredAt?: string;
  readAt?: string;
  expireAt?: string;
};

export type Notification = Omit<
  BackendNotificationEntity,
  "createdAt" | "deliveredAt" | "readAt" | "expireAt" | "status"
> &
  FrontendDates & {
    status: "pending" | "delivered" | "error" | string;
    id: string;
    sourceUser?: User;
  };

export type NotificationFeedPage = FeedPageGeneric<Notification>;
