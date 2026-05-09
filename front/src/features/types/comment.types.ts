import { Post } from "./post.types";
import type { User } from "./user.types";

/** Base fields shared by all comments */
export type CommentBase = {
  id: string;
  text: string;
  author: User;
  postId: string;
  createdAt: string;
  likeCount: number;
  replyCount: number;
  parentCommentId: string | null;
};

/** Raw comment from API (may omit some client-only fields) */
export type ApiComment = CommentBase & {
  childComments?: ApiComment[];
  likedByUsers?: User[];
  likedByCurrentUser?: boolean; // optional from API
};

/** Normalized comment used in client state/caches */
export type CommentWithLikeState = CommentBase & {
  likedByCurrentUser: boolean; // always present in client
  childComments?: CommentWithLikeState[];
};

/** Variables for adding a comment */
export type AddCommentVars = {
  text: string;
  postId: string;
  parentCommentId?: string | null;
  limit?: number;
};

/** Context for optimistic updates */
export type ContextType = {
  optimisticId?: string;
  previousComments?: CommentsCache | null;
  previousPost?: Post | null;
};

/** Props for rendering a comment item */
export type CommentItemProps = CommentWithLikeState & {
  likedByCurrentUser: boolean; // required in UI
  isReply?: boolean;
  parentIdForQuery?: string;
  isExpanded?: boolean;
  onToggleReplies?: () => void;
  expandedMap?: Record<string, boolean>;
  toggleExpanded?: (id: string) => void;
  replyTo?: {
    immediateId: string;
    username: string;
    parentIdToSend: string;
  } | null;
  setReplyTo?: (
    v: { immediateId: string; username: string; parentIdToSend: string } | null
  ) => void;
};

/** Props for comment form */
export type CommentFormProps = {
  postId: string;
  parentCommentId?: string | null;
  initialText?: string;
  onSuccess?: () => void;
  className?: string;
  autoFocus?: boolean;
  limit?: number;
};

/** Infinite query cache types */
export type CommentsPage = { data: CommentWithLikeState[]; page: number };
export type CommentsCache = { pages: CommentsPage[]; pageParams: unknown[] };

/** Variables for toggling like state */
export type ToggleLikeVars = {
  commentId: string;
  liked: boolean;
  parentCommentId?: string | null;
};
