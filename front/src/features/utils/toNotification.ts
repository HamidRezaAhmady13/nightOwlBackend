// import { BackendNotificationEntity } from "../types/notification.types";

// // In dateUtils.ts or wherever toNotification is defined
// export const toNotification = async (
//   raw: BackendNotificationEntity
// ): Promise<Notification> => {
//   const ntf: Notification = {
//     id: raw.id, // Make sure ID exists
//     userId: raw.userId,
//     type: raw.type,
//     smallBody: raw.smallBody,
//     payloadRef: raw.payloadRef,
//     meta: raw.meta,
//     status: raw.status,
//     createdAt: raw.createdAt.toISOString(),
//     deliveredAt: raw.deliveredAt?.toISOString(),
//     readAt: raw.readAt?.toISOString(),
//     expireAt: raw.expireAt?.toISOString(),
//     sourceUser: undefined, // Will fetch below
//   };

//   // 👇 FETCH USER DATA IF SOURCE ID EXISTS
//   if (raw.sourceId) {
//     try {
//       // Use your existing user API
//       const user = await fetchUserById(raw.sourceId);
//       ntf.sourceUser = user;
//     } catch (err) {
//       console.warn("Failed to fetch user for notification:", err);
//       // Leave as undefined, UI will show fallback
//     }
//   }

//   return ntf;
// };
