import { useMutation, useQueryClient } from "@tanstack/react-query";

import api from "../lib/api";
import { CommentWithLikeState } from "../types";
import { queryKeys } from "../utils/queryKeys";

export function useAddReply(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      text,
      parentId,
    }: {
      text: string;
      parentId: string;
    }) => {
      return api.post(`/comments/post/${postId}`, { text, parentId });
    },
    onSuccess: (res, { parentId }) => {
      const createdReply = res.data;

      queryClient.setQueryData<CommentWithLikeState[]>(
        queryKeys.comments.list(postId),
        (old) => {
          if (!old) return old;
          return old.map((comment) =>
            comment.id === parentId
              ? {
                  ...comment,
                  replyCount: (comment.replyCount ?? 0) + 1,
                  childComments: [
                    ...(comment.childComments ?? []),
                    createdReply,
                  ],
                }
              : comment
          );
        }
      );
    },
  });
}
