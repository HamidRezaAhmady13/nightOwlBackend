"use client";

import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import FormInput from "@/features/components/forms/FormInput";
import FileUploadInput from "@/features/components/forms/FileUploadInput";
import Button from "@/features/components/shared/Button";
import { useCreatePostMutation } from "@/features/hooks/useCreatePostMutation";

export default function CreatePostPage() {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const contentRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(
    null
  );

  const { isPending, createFrom } = useCreatePostMutation({
    resetContent: () => setContent(""),
    resetMedia: () => setMedia(null),
    resetValidation: () => setValidationError(null),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && !media) {
      const msg = "Please add text or attach media before posting.";
      setValidationError(msg);
      toast.error(msg);
      contentRef.current?.focus();
      return;
    }

    setValidationError(null);
    createFrom(content, media);
  };

  return (
    <div className="o-post max-w-xl mx-auto">
      <h1 className="u-text-xl u-text-secondary">Create a Post</h1>

      <form onSubmit={handleSubmit} className="space-y-md  mt-sm">
        <FormInput
          ref={contentRef}
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          multiline
          error={validationError ?? undefined}
        />

        <div className="u-flex-start">
          <FileUploadInput
            name="media-upload"
            label="Choose Media"
            accept="image/*,video/*"
            selectedFile={media}
            onChange={(file) => setMedia(file)}
          />
        </div>
        <div className="u-flex-center  pt-xl">
          <Button
            size={"md"}
            height={"md"}
            full={"half"}
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Posting..." : "Share your post"}
          </Button>
        </div>
      </form>
    </div>
  );
}
