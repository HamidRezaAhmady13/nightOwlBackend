import { CommentItemProps } from "@/features/types";
import AvatarImage from "../shared/AvatarImage";
import { GeneralLink } from "../shared/GeneralLink";
import CommentForm from "./CommentForm";
import { useToggleCommentLike } from "@/features/hooks/useToggleCommentLike";
import { useRepliesInfinite } from "@/features/hooks/useCommentsInfinite";

function CommentItem({
  id,
  text,
  author,
  postId,
  isReply,
  parentIdForQuery,
  createdAt,
  likeCount,
  replyCount,
  likedByCurrentUser,
  isExpanded,
  onToggleReplies,
  expandedMap,
  toggleExpanded,
  replyTo,
  setReplyTo,
}: CommentItemProps & {
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
}) {
  const toggleLike = useToggleCommentLike(postId);

  const {
    data,
    isLoading: repliesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRepliesInfinite({
    commentId: id,
    enabled: Boolean(isExpanded),
  });

  const replies = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div
      className={`u-flex-start-start flex-col gap-xs ${
        isReply ? "ml-[1px]" : ""
      }`}
    >
      <GeneralLink
        href={`/users/${author.username}`}
        className="u-focus-visible rounded flex justify-center items-center gap-sm"
      >
        <AvatarImage
          src={author.avatarUrl || undefined}
          alt={author.username}
          size={30}
        />
        {author.username}
      </GeneralLink>

      <div className="ml-sm">
        <p className="text-sm u-text-primary mt-xs">{text}</p>
        <span className="u-text-tertiary u-text-xs">
          {new Date(createdAt).toLocaleDateString()}
        </span>

        <div className="flex gap-md mt-sm u-text-tertiary">
          <button
            className="u-focus-not-visible"
            onClick={(e) => {
              e.stopPropagation();
              toggleLike.mutate({
                commentId: id,
                liked: likedByCurrentUser,
                parentCommentId: isReply ? parentIdForQuery ?? null : null,
              });
            }}
          >
            {likedByCurrentUser ? "❤️" : "🤍"} ({likeCount})
          </button>

          <button
            className="u-focus-not-visible"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setReplyTo?.({
                immediateId: id,
                username: author.username,
                parentIdToSend: id,
              });
            }}
          >
            Reply
          </button>

          {replyCount > 0 && !isExpanded && (
            <button
              onClick={() => onToggleReplies?.()}
              className="u-text-cobalt-soft u-focus-not-visible"
            >
              View {replyCount} {replyCount === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>

        {isExpanded && (
          <div className="mt-md ml-lg border-l u-text-tertiary pl-md">
            {repliesLoading ? (
              <p className="text-xs u-text-tertiary">Loading replies...</p>
            ) : (
              <>
                {replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    {...reply}
                    postId={postId}
                    isReply
                    parentIdForQuery={id}
                    isExpanded={Boolean(expandedMap?.[reply.id])}
                    onToggleReplies={() => toggleExpanded?.(reply.id)}
                    expandedMap={expandedMap}
                    toggleExpanded={toggleExpanded}
                    replyTo={replyTo}
                    setReplyTo={setReplyTo}
                  />
                ))}
                {hasNextPage && (
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="mt-sm u-btn"
                  >
                    {isFetchingNextPage
                      ? "Loading more..."
                      : "Load more replies"}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {replyTo?.immediateId === id && (
          <div className="mt-sm">
            <CommentForm
              autoFocus={true}
              postId={postId}
              parentCommentId={replyTo.parentIdToSend ?? replyTo.immediateId}
              onSuccess={() => {
                setReplyTo?.(null);
                const parentId =
                  replyTo?.parentIdToSend ?? replyTo?.immediateId;
                if (parentId && !expandedMap?.[parentId]) {
                  toggleExpanded?.(parentId);
                }
              }}
              className="w-full"
            />
            <div className="u-text-secondary u-text-xs mt-xs flex">
              Replying to <strong className="pl-sm">{replyTo.username}</strong>
              <button
                className="hover:scale-105 ml-auto u-text-error pr-md"
                onClick={() => setReplyTo?.(null)}
              >
                cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentItem;
