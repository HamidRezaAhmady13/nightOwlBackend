"use client";

import Spinner from "@/features/components/shared/Spinner";
import PostShell from "@/features/components/posts/PostShell";
import CommentsModal from "@/features/components/comment/CommentsModal";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { usePostQuery } from "@/features/hooks/usePosts";
import { useCurrentUser } from "@/features/components/AuthContext";

export default function PostPage() {
  const searchParams = useSearchParams();
  const commentId = searchParams.get("commentId");

  const { data: post, isLoading } = usePostQuery();
  const { user: currentUser } = useCurrentUser();
  const [isOpenModal, setIsOpenModal] = useState<Boolean>(Boolean(commentId));

  if (isLoading) return <Spinner />;
  if (!currentUser) return;
  if (!post) return <p>no data found</p>;

  return (
    <div className="max-w-3xl mx-auto py-xl px-md space-y-lg shadow-md mt-xl">
      <h1 className="u-text-lg u-text-secondary">Post Details</h1>
      <PostShell post={post} onCommentClick={() => setIsOpenModal(true)} />
      {isOpenModal && (
        <CommentsModal
          postId={post.id}
          onClose={() => setIsOpenModal(false)}
          commentId={commentId ? commentId : undefined}
        />
      )}
    </div>
  );
}
