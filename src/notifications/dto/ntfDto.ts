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
  type: string;
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
