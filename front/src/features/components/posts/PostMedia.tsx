// components/PostMedia.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

import PostGallery from "./PostGallery";
import type { Post, PostMode } from "@/features/types";

import MediaWrapper from "./MediaWrapper";
import {
  LANDSCAPE_RATIO,
  PORTRAIT_RATIO,
  SQUARE_RATIO,
} from "@/features/types";
import PlayerThemed from "./PlayerThemed";
import {
  getPosterImage,
  getPostFiles,
  getPostImages,
  getVideoVariants,
} from "@/features/utils/extractPostMedia";
import { API_URL } from "@/features/lib/api";
import PostFiles from "./PostFiles";

export default function PostMedia({
  post,
  mode,
}: {
  post: Post;
  mode: PostMode;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRootRef = useRef<HTMLDivElement | null>(null);

  const videoVariants = getVideoVariants(post);
  const poster = getPosterImage(post);
  const images = getPostImages(post);
  const files = getPostFiles(post);
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const m = document.cookie
      .split("; ")
      .find((c) => c.startsWith("theme="))
      ?.split("=")[1];
    const theme =
      m ||
      (document.documentElement.classList.contains("dark") ? "dark" : "light");
    const color = theme === "dark" ? "#4f46e5" : "#ffa000";
    document.documentElement.style.setProperty("--player-accent", color);
  }, []);

  useEffect(() => {
    const container = document.getElementById(`video-container-${post.id}`);
    if (container) videoRef.current = container.querySelector("video");
  }, [post.id]);

  const posterImg = poster ? `${API_URL}${poster.url}` : undefined;
  const known = poster ? { w: 1200, h: 900 } : undefined;
  const isVertical = known ? known.h > known.w : false;
  const isSquare = known ? known.h === known.w : false;
  const ratioClass =
    mode === "feed"
      ? isSquare
        ? SQUARE_RATIO
        : isVertical
        ? PORTRAIT_RATIO
        : LANDSCAPE_RATIO
      : "";

  return (
    <div className="space-y-md" id={`post-media-${post.id}`}>
      {images && <PostGallery mode={mode} images={images} />}
      {videoVariants.length > 0 && (
        <div
          className="w-full max-w-3xl mx-auto"
          id={`video-container-${post.id}`}
        >
          <MediaWrapper mode={mode} aspectClass={ratioClass}>
            <div
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                zIndex: 130,
              }}
            >
              <div
                className="player-wrapper"
                ref={playerRootRef}
                tabIndex={-1}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "1rem",
                  overflow: "hidden",
                }}
              >
                <PlayerThemed
                  keyboardShortcut={false}
                  src={videoVariants.map((v) => ({
                    quality: v.quality ?? "auto",
                    url: `${API_URL}${v.url}`,
                  }))}
                  poster={posterImg}
                  isDark={isDark}
                  themed={"var(--player-accent)"}
                />
              </div>
            </div>
          </MediaWrapper>
        </div>
      )}
      {/* {files.length > 0 && <p>asd</p>} */}
      {files.length > 0 && (
        <>
          <PostFiles files={post.media} />
        </>
      )}
    </div>
  );
}
