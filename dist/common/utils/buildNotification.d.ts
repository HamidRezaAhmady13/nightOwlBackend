import { CreateNotificationWithtypesDto } from 'src/notifications/dto/ntfDto';
export declare function buildNotification(dto: CreateNotificationWithtypesDto): {
    smallBody: string;
    payloadRef: {
        followerId: string;
        postId?: undefined;
        commentId?: undefined;
    };
} | {
    smallBody: string;
    payloadRef: {
        postId: string;
        followerId?: undefined;
        commentId?: undefined;
    };
} | {
    smallBody: string;
    payloadRef: {
        postId: string;
        commentId: string;
        followerId?: undefined;
    };
};
