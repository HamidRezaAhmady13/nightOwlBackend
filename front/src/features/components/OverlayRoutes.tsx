// app/components/OverlayRoutes.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import PostDetailModal from "./posts/PostDetailModal";
import { toSingleString } from "../lib/toSingleString";
// import { toSingleString } from "../../app/lib/toSingleString";

export default function OverlayRoutes() {
  const search = useSearchParams();
  const router = useRouter();
  const postId = toSingleString(search?.get("postId"));

  if (postId) {
    return (
      <PostDetailModal
        postId={postId}
        onClose={() => {
          const url = new URL(window.location.href);
          url.searchParams.delete("postId");
          router.replace(url.pathname + url.search);
        }}
      />
    );
  }

  return null;
}
