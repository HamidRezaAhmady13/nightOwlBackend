import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../lib/api";

type ResetHandlers = {
  resetContent?: () => void;
  resetMedia?: () => void;
  resetValidation?: () => void;
};

export function useCreatePostMutation(handlers: ResetHandlers = {}) {
  const mutation = useMutation<any, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      const res = await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Post created!");
      handlers.resetContent?.();
      handlers.resetMedia?.();
      handlers.resetValidation?.();
    },
    onError: () => {
      toast.error("Failed to create post");
    },
  });

  // Optional helper to build and mutate from content + media
  const createFrom = (content: string, media: File | null) => {
    const fd = new FormData();
    fd.append("content", content);
    if (media) fd.append("media", media);
    mutation.mutate(fd);
  };

  return {
    ...mutation,
    createFrom,
  };
}
