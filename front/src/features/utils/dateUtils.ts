// import { BackendNotificationEntity } from "../(protected)/types/notification.types";

import { BackendNotificationEntity } from "../types/notification.types";

export function safeIso(v: any): string | undefined {
  if (v == null) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export function toNotification(b: BackendNotificationEntity) {
  return {
    ...(b as any),
    status: b.status as BackendNotificationEntity["status"],
    createdAt: safeIso(b.createdAt) ?? new Date().toISOString(),
    deliveredAt: safeIso(b.deliveredAt),
    readAt: safeIso(b.readAt),
    expireAt: safeIso(b.expireAt),
  };
}
