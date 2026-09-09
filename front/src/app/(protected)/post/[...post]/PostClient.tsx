// app/post/[...post]/PostClient.tsx
"use client";

import CommentsModal from "@/features/components/comment/CommentsModal";
import PostShell from "@/features/components/posts/PostShell";
import { usePostQuery } from "@/features/hooks/usePosts";
import { useUserStore } from "@/features/store/userStore";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function PostClient({ postId }: { postId: string }) {
  const searchParams = useSearchParams();
  const commentId = searchParams.get("commentId");

  const { data: post, isLoading } = usePostQuery({ id: postId });

  // const currentUser = useUserStore((s) => s.user);
  const [isOpenModal, setIsOpenModal] = useState<Boolean>(Boolean(commentId));

  if (isLoading) return null;
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
