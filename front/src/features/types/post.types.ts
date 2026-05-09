import type { Media } from "./media.types";
import type { User, UserPreview } from "./user.types";

export type PostFilesProps = {
  files?: { id: string; url: string }[];
};

export type Post = {
  id: string;
  content: string;
  createdAt: string;
  owner: User;
  media: Media[];
  likedBy?: UserPreview[];
  comments?: Comment[];
  likesCount: number;
  commentsCount: number;
  files: { id: string; url: string }[];
};

export type PostMode = "feed" | "modal";

export type PostActionsProps = {
  post: Post;
  currentUserId: string;
  onCommentClick: () => void;
};

export type SinglePostProps = {
  post: Post;
  currentUserId: string;
  isActive: boolean;
  onActivate: () => void;
};

export type PostPreview = Pick<
  Post,
  "id" | "createdAt" | "likesCount" | "commentsCount"
> & {
  imageUrl?: string | null;
};

export const SQUARE_RATIO = "aspect-[1/1]"; // replace with your real classes
export const PORTRAIT_RATIO = "aspect-[3/4]";
export const LANDSCAPE_RATIO = "aspect-[16/9]";
export type FeedPage = {
  items: Post[];
  total: number;
  page?: number;
  pageSize?: number;
};

export type FeedPageGeneric<T> = {
  id?: string;
  items: T[];
  total: number;
  page?: number;
  cursor?: string;
  pageSize?: number;
};

export type PostsInfiniteData = {
  pages: { items: Post[] }[];
  pageParams: unknown[];
};
