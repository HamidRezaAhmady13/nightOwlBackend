// // src/features/components/posts/PostTile.tsx
"use client";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { GeneralLink } from "../shared/GeneralLink";
import { MdOndemandVideo } from "react-icons/md";
import { BACKEND_BASE } from "@/features/lib/api";

function isVideo(url?: string | null) {
  if (!url) return false;
  return /\.(mp4|mov|webm|mkv|webp)(\?.*)?$/i.test(url);
}

function isImage(url?: string | null) {
  if (!url) return false;
  return /\.(png|jpe?g|gif|svg|bmp|ico|tiff)(\?.*)?$/i.test(url);
}

export default function PostTile({
  post,
}: {
  post: { id: string; imageUrl?: string | null; content?: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const openModalByQuery = (e?: React.MouseEvent) => {
    if (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      e.stopPropagation();
    }
    const params = new URLSearchParams(String(search ?? ""));
    params.set("postId", post.id);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    openModalByQuery(e);
  };

  return (
    <GeneralLink
      href={`/post/${post.id}/${post.content}`}
      className="relative w-full aspect-square u-focus-not-visible"
      onClick={handleLinkClick}
    >
      <div
        role="button"
        onClick={(e) => {
          openModalByQuery();
        }}
        className="relative w-full aspect-square overflow-hidden u-bg-grey rounded-md"
        aria-label="Open post"
      >
        {post.imageUrl ? (
          isImage(post.imageUrl) ? (
            <Image
              src={`${BACKEND_BASE}${post.imageUrl}`}
              alt="Post media"
              fill
              style={{ objectFit: "cover" }}
            />
          ) : isVideo(post.imageUrl) ? (
            <>
              <video
                src={`${BACKEND_BASE}${post.imageUrl}`}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
              <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
                <MdOndemandVideo className="text-white w-lg h-lg" />
              </div>
            </>
          ) : (
            <div className="h-full w-full u-flex-center u-text-md u-text-tertiary">
              📄 file
            </div>
          )
        ) : (
          <div className="h-full w-full u-flex-center u-text-md u-text-tertiary">
            No media
          </div>
        )}
      </div>
    </GeneralLink>
  );
}
