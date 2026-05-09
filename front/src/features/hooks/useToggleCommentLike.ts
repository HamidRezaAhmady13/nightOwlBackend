import {
  CommentsCache,
  CommentWithLikeState,
  ToggleLikeVars,
} from "@/features/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import { queryKeys } from "../utils/queryKeys";

export function useToggleCommentLike(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, liked }: ToggleLikeVars) => {
      return liked
        ? api.delete(`/comments/${commentId}/like`)
        : api.post(`/comments/${commentId}/like`);
    },

    onMutate: async ({ commentId, liked, parentCommentId }) => {
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: queryKeys.comments.list(postId),
        }),
        parentCommentId
          ? queryClient.cancelQueries({
              queryKey: queryKeys.replies.list(parentCommentId),
            })
          : Promise.resolve(),
      ]);

      const prevComments = queryClient.getQueryData<CommentWithLikeState[]>(
        queryKeys.comments.list(postId)
      );
      const prevReplies = parentCommentId
        ? queryClient.getQueryData<CommentWithLikeState[]>(
            queryKeys.replies.list(parentCommentId)
          )
        : undefined;

      queryClient.setQueryData<CommentsCache>(
        queryKeys.comments.list(postId),
        (old) => {
          if (!old) return old;
          const pages = old.pages.map((p) => ({
            ...p,
            data: p.data.map((c) =>
              updateCommentLikeState(c, commentId, liked)
            ),
          }));
          return { ...old, pages };
        }
      );

      // Update the replies list if applicable
      if (parentCommentId) {
        queryClient.setQueryData<CommentsCache>(
          queryKeys.replies.list(parentCommentId),
          (old) => {
            if (!old) return old;
            const pages = old.pages.map((p) => ({
              ...p,
              data: p.data.map((r) =>
                updateCommentLikeState(r, commentId, liked)
              ),
            }));
            return { ...old, pages };
          }
        );
      }

      return { prevComments, prevReplies, parentCommentId };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prevComments) {
        queryClient.setQueryData(
          queryKeys.comments.list(postId),
          ctx.prevComments
        );
      }
      if (ctx?.parentCommentId && ctx?.prevReplies) {
        queryClient.setQueryData(
          queryKeys.replies.list(ctx.parentCommentId),
          ctx.prevReplies
        );
      }
    },

    // safety net: ensure server truth wins after optimistic update
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.list(postId),
      });
      if (vars.parentCommentId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.replies.list(vars.parentCommentId),
        });
      }
    },
  });
}

function updateCommentLikeState(
  comment: CommentWithLikeState,
  commentId: string,
  liked: boolean
): CommentWithLikeState {
  if (comment.id === commentId) {
    return {
      ...comment,
      likeCount: liked ? comment.likeCount - 1 : comment.likeCount + 1,
      likedByCurrentUser: !liked,
    };
  }

  const childComments = comment.childComments?.map((child) =>
    updateCommentLikeState(child, commentId, liked)
  );

  return childComments ? { ...comment, childComments } : comment;
}
