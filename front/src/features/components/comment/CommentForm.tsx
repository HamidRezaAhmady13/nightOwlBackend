import { useRef, useState } from "react";
import FormInput from "../forms/FormInput";
import Button from "../shared/Button";
import { useAddComment } from "@/features/hooks/useAddComment";
import { CommentFormProps } from "@/features/types";
import { useCurrentUser } from "../AuthContext";

const limit = process.env.PAGE_LIMIT_ENV || 10;

export default function CommentForm({
  postId,
  parentCommentId = null,
  initialText = "",
  onSuccess,
  className,
  autoFocus,
  limit,
}: CommentFormProps) {
  const { user: currentUser } = useCurrentUser();
  const [commentText, setCommentText] = useState(initialText || "");
  const addCommentMutation = useAddComment(currentUser, limit);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const submittingRef = useRef(false);

  const doSubmit = () => {
    if (submittingRef.current) return;
    if (!commentText.trim()) return;
    submittingRef.current = true;

    addCommentMutation.mutate(
      { text: commentText, parentCommentId, postId },
      {
        onSuccess: () => {
          setCommentText("");
          submittingRef.current = false;
          onSuccess?.();
        },
        onError: () => {
          submittingRef.current = false;
        },
      }
    );
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    doSubmit();
  };

  const handleInputKeyDown: React.KeyboardEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (e) => {
    if (e.key === "Enter") {
      if (!e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        doSubmit();
      } else {
        e.stopPropagation();
      }
    } else if (e.key === "Escape") {
      e.stopPropagation();
      setCommentText("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`u-flex-center gap-sm w-full ${className || ""}`}
    >
      <div className="flex-1 h-2xl u-flex-center">
        <FormInput
          autoFocus={autoFocus}
          ref={inputRef}
          value={commentText}
          placeholder="Write a comment..."
          multiline
          rows={1}
          onChange={(e) => setCommentText(e.target.value)}
          wrapperClassName="flex-1 h-2xl u-flex-center"
          onKeyDown={handleInputKeyDown}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <Button
        type="submit"
        disabled={addCommentMutation.isPending}
        height="md"
        onClick={(e) => e.stopPropagation()}
      >
        {addCommentMutation.isPending ? "..." : "Post"}
      </Button>
    </form>
  );
}
