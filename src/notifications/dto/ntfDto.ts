import { IsObject, IsOptional, IsString } from 'class-validator';

export type PostsInfiniteData<T> = import('@tanstack/react-query').InfiniteData<
  FeedPage<T>
>;
export type ActorDto = { id: string; username?: string; avatarUrl?: string };

export type FeedPage<T> = {
  items: T[];
  total: number;
  cursor?: string | undefined;
  pageSize?: number;
  page?: number;
};

export type RequestWithUser = Request & { user: { id: string } };

export class CreateNtfDto {
  @IsString()
  userId: string;
  @IsObject()
  actor: { id: string; username: string };
  @IsString()
  type: NotificationType;
  @IsOptional()
  meta?: any;
}

// dto/create-notification.dto.ts
export type CreateNotificationDto = {
  type: string;
  smallBody: string;
  payloadRef?: any;
  meta?: any;
  sourceId?: string;
};

// export type NotificationType = 'follow' | 'like' | 'comment';
export enum NotificationType {
  Follow = 'follow',
  Like = 'like',
  Comment = 'comment',
}

// types
export type BaseNtf = { sourceId: string; meta?: any };

export type FollowNtf = BaseNtf & {
  // type: 'follow';
  type: NotificationType.Follow;
  followerId: string;
};
export type LikeNtf = BaseNtf & {
  type: NotificationType.Like;
  // type: 'like';
  postId: string;
};
export type CommentNtf = BaseNtf & {
  // type: 'comment';
  type: NotificationType.Comment;
  postId: string;
  commentId: string;
};
export type CreateNotificationWithtypesDto = FollowNtf | LikeNtf | CommentNtf;
