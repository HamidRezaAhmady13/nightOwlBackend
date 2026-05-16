"use client";

import { formatCount } from "@/features/utils/formatCount";
import { Post, UserPreview } from "@/features/types";
import Button from "../shared/Button";
import CommentForm from "../comment/CommentForm";
import { useToggleLike } from "@/features/hooks/useToggleLike";

export type PostActionsProps = {
  post: Post;
  currentUser: UserPreview;
  onCommentClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export default function PostActions({
  post,
  currentUser,
  onCommentClick,
}: PostActionsProps) {
  const isLiked = post.likedBy?.some((u) => u.id === currentUser.id);
  const toggleLike = useToggleLike(post.id, currentUser);

  return (
    <>
      <div className="u-flex-center gap-md">
        <Button
          type="button"
          aria-label={isLiked ? "Unlike post" : "Like post"}
          className="u-bg-transparent hover:u-bg-transparent u-focus-not-visible w-3xl"
          onClick={(e) => {
            e.stopPropagation();
            toggleLike.mutate();
          }}
        >
          <span>{isLiked ? "❤️" : "🤍"}</span>
          <span className="u-text-tertiary u-text-sm inline-block w-xl text-right tabular-nums">
            {formatCount(post.likesCount)}
          </span>
        </Button>

        <Button
          type="button"
          aria-label="Show comments"
          className="u-bg-transparent hover:u-bg-transparent u-focus-not-visible w-3xl"
          onClick={(e) => {
            e.stopPropagation();
            onCommentClick?.(e);
          }}
        >
          <span>💬</span>
          <span className="u-text-tertiary u-text-sm inline-block w-xl text-right tabular-nums">
            {formatCount(post.commentsCount)}
          </span>
        </Button>

        <CommentForm postId={post.id} className="max-w-lg  " />
      </div>

      <div className="mb-xl">
        <span className="u-text-tertiary u-text-xs ">
          Posted on {new Date(post.createdAt).toLocaleString()}
        </span>
      </div>
    </>
  );
}
