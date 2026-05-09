// PostDetailModal.tsx
"use client";

import PostShell from "./PostShell";
import Spinner from "../shared/Spinner";
// import { usePostQuery } from "@/app/(protected)/hooks/usePosts";
import PostModal from "./PostModal";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CommentsModal from "../comment/CommentsModal";
import { usePostQuery } from "@/features/hooks/usePosts";

export default function PostDetailModal({
  postId,
  onClose,
}: {
  postId: string;
  onClose: () => void;
}) {
  const { data: post, isLoading } = usePostQuery({ id: postId });
  const router = useRouter();
  const [isOpenModal, setIsOpenModal] = useState<Boolean>(false);
  if (isLoading)
    return (
      <PostModal onClose={onClose} ariaLabel="Loading post">
        <Spinner />
      </PostModal>
    );

  if (!post) return null;

  return (
    <PostModal
      onClose={() => {
        const url = new URL(window.location.href);
        url.searchParams.delete("postId");
        router.replace(url.pathname + url.search);
        onClose?.();
      }}
    >
      <div className=" mx-auto py-xs   space-y-md     ">
        <PostShell
          post={post}
          onCommentClick={() => setIsOpenModal(true)}
          mode="modal"
        />
        {isOpenModal && (
          <CommentsModal
            postId={post.id}
            onClose={() => setIsOpenModal(false)}
          />
        )}
      </div>
    </PostModal>
  );
}
