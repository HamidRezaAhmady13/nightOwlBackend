export type PostsInfiniteData<T> = import('@tanstack/react-query').InfiniteData<FeedPage<T>>;
export type ActorDto = {
    id: string;
    username?: string;
    avatarUrl?: string;
};
export type FeedPage<T> = {
    items: T[];
    total: number;
    cursor?: string | undefined;
    pageSize?: number;
    page?: number;
};
export type RequestWithUser = Request & {
    user: {
        id: string;
    };
};
export declare class CreateNtfDto {
    userId: string;
    actor: {
        id: string;
        username: string;
    };
    type: NotificationType;
    meta?: any;
}
export type CreateNotificationDto = {
    type: string;
    smallBody: string;
    payloadRef?: any;
    meta?: any;
    sourceId?: string;
};
export declare enum NotificationType {
    Follow = "follow",
    Like = "like",
    Comment = "comment"
}
export type BaseNtf = {
    sourceId: string;
    meta?: any;
};
export type FollowNtf = BaseNtf & {
    type: NotificationType.Follow;
    followerId: string;
};
export type LikeNtf = BaseNtf & {
    type: NotificationType.Like;
    postId: string;
};
export type CommentNtf = BaseNtf & {
    type: NotificationType.Comment;
    postId: string;
    commentId: string;
};
export type CreateNotificationWithtypesDto = FollowNtf | LikeNtf | CommentNtf;
