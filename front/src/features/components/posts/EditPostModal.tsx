"use client";
import { useRef, useEffect, useState } from "react";
import { useModalStack } from "@/features/hooks/useModalStack";
import Button from "@/features/components/shared/Button";
import { useClickOutside } from "@/features/hooks/useClickOutside";
import FormInput from "../forms/FormInput";

interface EditPostModalProps {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function EditPostModal({
  initialContent,
  onSave,
  onCancel,
  isLoading,
}: EditPostModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState(initialContent);

  useModalStack(onCancel);
  useClickOutside(modalRef, onCancel);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSave = () => {
    if (content.trim().length === 0) return;
    onSave(content);
  };

  return (
    <div className="fixed inset-0 z-50 u-flex-center bg-black/40">
      <div
        ref={modalRef}
        className="u-bg-deep rounded-lg p-md max-w-md w-full shadow-xl"
      >
        <h3 className="text-lg font-semibold mb-2">Edit Post</h3>
        <FormInput
          ref={textareaRef}
          multiline
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-xs border rounded-md mb-4 min-h-[100px]"
          autoFocus
        />
        <div className="flex justify-end gap-xs">
          <Button onClick={onCancel} size="sm" height={"md"} intent="ghost">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            size="sm"
            height={"md"}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
