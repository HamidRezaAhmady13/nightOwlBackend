"use client";

import { Post, PostMode } from "@/features/types";
import { PostHeader } from "./PostHeader";
import { PostContent } from "./PostContent";
import PostMedia from "./PostMedia";
import PostActions from "./PostActions";
import { useCurrentUser } from "../AuthContext";

type PostCardProps = {
  post: Post;
  onNavigate?: () => void;
  onCommentClick?: () => void;
  mode?: PostMode;
};

export default function PostShell({
  post,
  onNavigate,
  onCommentClick,
  mode = "feed",
}: PostCardProps) {
  const { user: currentUser } = useCurrentUser();
  if (!currentUser) return null;

  const isInteractive = typeof onNavigate === "function";
  const handleNavigate = onNavigate ?? (() => {});
  const handleComment = onCommentClick ?? (() => {});

  return (
    <div
      className={`relative rounded bg-transparent  min-w-[50rem]`}
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
      <div style={{ flex: "0 0 auto" }}>
        <PostHeader post={post} />
      </div>

      {mode === "modal" && (
        <div
          style={{
            flex: "1 1 auto",
            overflow: "auto",
            minHeight: 0,
            padding: "12px 0",
          }}
        >
          <PostMedia post={post} mode={mode} />
          <PostContent post={post} />
        </div>
      )}

      {mode === "feed" && (
        <div
          style={{
            overflow: "auto",
            minHeight: 0,
            padding: "12px 0",
          }}
        >
          <PostMedia post={post} mode={mode} />

          <PostContent post={post} />
        </div>
      )}

      <div style={{ flex: "0 0 auto" }}>
        <PostActions
          post={post}
          currentUser={currentUser}
          onCommentClick={(e) => {
            e.stopPropagation();
            handleComment();
          }}
        />
      </div>
    </div>
  );
}
