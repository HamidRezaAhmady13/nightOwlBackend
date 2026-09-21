"use client";

import { PostCardProps } from "@/features/types";
import { PostHeader } from "./PostHeader";
import { PostContent } from "./PostContent";
import PostMedia from "./PostMedia";
import PostActions from "./PostActions";
import { useUserStore } from "@/features/store/userStore";
import { getPostFiles } from "@/features/utils/extractPostMedia";

export default function PostShell({
  post,
  onNavigate,
  onCommentClick,
  mode = "feed",
}: PostCardProps) {
  const currentUser = useUserStore((s) => s.user);
  const files = getPostFiles(post);

  const isInteractive = typeof onNavigate === "function";
  const handleNavigate = onNavigate ?? (() => {});
  const handleComment = onCommentClick ?? (() => {});

  return (
    <div
      className={`relative rounded bg-transparent  min-w-[50rem] `}
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: `${mode === "modal" ? "80vh" : ""}`,
      }}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? handleNavigate : undefined}
      onKeyDown={
        isInteractive ? (e) => e.key === "Enter" && handleNavigate() : undefined
      }
    >
      {mode === "modal" && (
        <div
          style={{
            flex: "1 1 auto",
            overflow: "auto",
            maxHeight: "80vh",
            minHeight: 0,
            padding: "12px 0",
          }}
        >
          <PostMedia post={post} mode={mode} />
          <PostContent post={post} />
        </div>
      )}

      {mode === "feed" && (
        <>
          <div style={{ flex: "0 0 auto" }}>
            <PostHeader post={post} />
          </div>

          <div
            style={{
              overflow: "auto",
              minHeight: 0,
              padding: "12px 0",
            }}
          >
            {files.length === 0 && (
              <>
                <PostMedia post={post} mode={mode} />

                <PostContent post={post} />
              </>
            )}
            {files.length > 0 && (
              <>
                <PostMedia post={post} mode={mode} />
                <PostContent post={post} />
              </>
            )}
          </div>
        </>
      )}

      <div style={{ flex: "0 0 auto" }}>
        <PostActions
          post={post}
          currentUser={currentUser}
          onCommentClick={(e) => {
            e?.stopPropagation();
            handleComment();
          }}
        />
      </div>
    </div>
  );
}
