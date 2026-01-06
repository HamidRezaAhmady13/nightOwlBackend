import { User } from 'src/user/entity/user.entity';
export declare enum NotificationStatus {
    Pending = "pending",
    Delivered = "delivered",
    Error = "error"
}
export declare class NotificationEntity {
    id: string;
    userId: string;
    status: string;
    type: string;
    smallBody: string;
    createdAt: Date;
    payloadRef: any | null;
    meta: any | null;
    deliveredAt?: Date | null;
    readAt?: Date | null;
    expireAt?: Date | null;
    sourceId?: string | null;
    sourceUser: User;
}
