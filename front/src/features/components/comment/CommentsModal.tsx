"use client";
import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

import Button from "../shared/Button";
import { useCommentsInfinite } from "@/features/hooks/useCommentsInfinite";
import { useModalStack } from "@/features/hooks/useModalStack";

export default function CommentsModal({
  postId,
  onClose,
  commentId,
}: {
  postId: string;
  onClose: () => void;
  commentId?: string;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useCommentsInfinite({ postId });

  const comments = data?.pages.flatMap((p) => p.data) ?? [];

  useEffect(() => {
    if (!commentId) return;
    if (!comments?.length) return;

    const normalizedId = String(commentId);

    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(`comment-${normalizedId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("highlight");
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [commentId, comments?.length]);

  const [replyTo, setReplyTo] = useState<{
    immediateId: string;
    username: string;
    parentIdToSend: string;
  } | null>(null);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggleExpanded = (id: string) =>
    setExpanded((prev) => {
      if (prev[id]) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: true };
    });

  const listRef = useRef<HTMLUListElement | null>(null);

  useModalStack(() => onClose());

  if (typeof window !== "undefined") {
    window.addEventListener("load", () => {});
  }

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus({ preventScroll: true });
    return () => prev?.focus();
  }, []);

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999999999] u-flex-center   "
      aria-modal="true"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onPointerDown={() => onClose()}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-label="Comments"
        className="relative   u-bg-deep  z-[9999999999] rounded-lg w-full h-full sm:w-[60vw] sm:h-auto sm:max-w-xl sm:max-h-[80vh] flex flex-col"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* */}
        <div className="p-md flex-1 overflow-y-auto">
          <div className="u-flex-between mb-md">
            <h2 className="u-text-lg u-text-secondary">Comments</h2>
            <button onClick={onClose} className="u-text-tertiary u-text-xl">
              ✕
            </button>
          </div>
          {isLoading ? (
            <p>Loading...</p>
          ) : comments?.length ? (
            <ul className="space-y-md ">
              {comments.map((c) => {
                return (
                  <li
                    key={c.id}
                    className="w-full  "
                    id={`comment-${String(c.id)}`}
                  >
                    <div className="w-full ">
                      <CommentItem
                        {...c}
                        postId={postId}
                        isExpanded={Boolean(expanded[c.id])}
                        onToggleReplies={() => toggleExpanded(c.id)}
                        expandedMap={expanded}
                        toggleExpanded={toggleExpanded}
                        replyTo={replyTo}
                        setReplyTo={setReplyTo}
                      />
                    </div>
                  </li>
                );
              })}
              {hasNextPage && (
                <div className="block w-full u-flex-center">
                  <Button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    size={"sm"}
                    className="h-lg rounded-2xl"
                  >
                    {isFetchingNextPage ? "Loading more..." : "Load more"}
                  </Button>
                </div>
              )}
            </ul>
          ) : (
            <p className="u-text-tertiary">No comments yet</p>
          )}
        </div>
        <div className="border-t u-border p-md w-full">
          <CommentForm
            postId={postId}
            autoFocus={true}
            onSuccess={() => {}}
            className="w-full "
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
