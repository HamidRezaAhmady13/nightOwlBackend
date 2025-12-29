import { Comment } from 'src/comment/entity/comment.entity';
import { NotificationEntity } from 'src/notifications/entity/notification.entity';
import { Media } from 'src/post/entity/media.entity';
import { Post } from 'src/post/entity/posts.entity';
export declare class User {
    id: string;
    username: string;
    email: string;
    password?: string | null;
    avatarUrl: string | null;
    isOnline: boolean;
    lastSeen: Date | null;
    bio: string | null;
    location: string | null;
    website: string | null;
    interests: string[] | null;
    createdAt: Date;
    updatedAt: Date;
    provider: 'local' | 'google';
    settings: {
        notifications: boolean;
        theme: 'light' | 'dark';
        language: string | null;
    } | null;
    sessions: {
        deviceId: string;
        ip: string;
        lastActive: Date;
    }[] | null;
    followers: User[];
    following: User[];
    blockedUsers: User[];
    posts: Post[];
    comments: Comment[];
    media: Media[];
    postsCount: number;
    followersCount: number;
    followingsCount: number;
    unreadCount: number;
    notifEmittedCount: number;
    notifDeliveredCount: number;
    notifReadCount: number;
    notifFailedCount: number;
    notifications: NotificationEntity[];
}
