"use client";
import { useState } from "react";
import Button from "@/features/components/shared/Button";
import Spinner from "@/features/components/shared/Spinner";
import PostShell from "@/features/components/posts/PostShell";
import CommentsModal from "@/features/components/comment/CommentsModal";
import { usePaginationQuery } from "@/features/hooks/usePaginationQuery";
import { usePostsInfinite } from "@/features/hooks/usePostsInfinite";

export default function FeedPage() {
  const { page, limit, setParams } =
    usePaginationQuery(/* optional defaultLimit here */);
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    usePostsInfinite(limit);

  const posts = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages.at(-1)?.total ?? 0;
  ``;
  const [activePostId, setActivePostId] = useState<string | null>(null);

  if (isLoading) return <Spinner />;

  return (
    <div className="mt-2xl">
      {posts.map((post) => (
        <PostShell
          // limit={limit}
          key={post.id}
          post={post}
          onCommentClick={() => setActivePostId(post.id)}
          mode="feed"
        />
      ))}

      {activePostId && (
        <CommentsModal
          postId={activePostId}
          onClose={() => setActivePostId(null)}
        />
      )}

      {posts.length < total && (
        <div className="u-flex-center">
          <Button
            onClick={async () => {
              if (!hasNextPage || isFetchingNextPage) return;
              const res = await fetchNextPage();
              const nextPage = page + 1;
              const params = new URLSearchParams(window.location.search);
              params.set("page", String(nextPage));
              params.set("limit", String(limit));
              window.history.replaceState(
                {},
                "",
                `${window.location.pathname}?${params.toString()}`
              );
              setParams({ page: nextPage });
            }}
            disabled={!hasNextPage || isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
