"use client";

import { formatCount } from "@/features/utils/formatCount";
import { Post, UserPreview } from "@/features/types";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import CommentForm from "../comment/CommentForm";
import { useToggleLike } from "@/features/hooks/useToggleLike";
import Button from "../shared/Button";
import { useDeletePost } from "@/features/hooks/useDeletePost";
import ConfirmModal from "../shared/ConfirmModal";
import EditPostModal from "./EditPostModal";
import api from "@/features/lib/api";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const router = useRouter();
  const queryClient = useQueryClient();

  const deleteMutation = useDeletePost();
  const toggleLike = useToggleLike(post.id, currentUser);
  const isLiked = post.likedBy?.some((u) => u.id === currentUser.id);

  const editMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      api.patch(`/posts/${postId}`, { content }),

    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ["post", { postId: variables.postId }],
        (old: any) => {
          if (!old) return old;
          return { ...old, content: variables.content };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post updated");
      setShowEditModal(false);
    },
    onError: () => toast.error("Failed to update post"),
  });

  const handleConfirmDelete = () => {
    deleteMutation.mutate(post.id, {
      onSuccess: () => {
        setShowDeleteModal(false);
        router.push(`/users/${currentUser.username}?refresh=${Date.now()}`);
      },
    });
  };

  const handleSaveEdit = (newContent: string) => {
    editMutation.mutate({ postId: post.id, content: newContent });
  };

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

        <CommentForm postId={post.id} className="max-w-lg" />
      </div>

      <div className="mb-xl u-flex-between">
        <span className="u-text-tertiary u-text-xs">
          Posted on {new Date(post.createdAt).toLocaleString()}
        </span>

        {currentUser && post.owner.id === currentUser.id && (
          <>
            <div className="u-flex-center">
              <Button
                intent="invisible"
                onClick={() => setShowEditModal(true)}
                className="u-text-secondary ml-2"
              >
                Edit
              </Button>
              <Button
                intent="invisible"
                onClick={() => setShowDeleteModal(true)}
                disabled={deleteMutation.isPending}
                className="u-text-error ml-2"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>

            {showEditModal && (
              <EditPostModal
                initialContent={post.content}
                onSave={handleSaveEdit}
                onCancel={() => setShowEditModal(false)}
                isLoading={editMutation.isPending}
              />
            )}

            {showDeleteModal && (
              <ConfirmModal
                title="Delete Post"
                message="Are you sure you want to delete this post? This action cannot be undone."
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteModal(false)}
                isLoading={deleteMutation.isPending}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
