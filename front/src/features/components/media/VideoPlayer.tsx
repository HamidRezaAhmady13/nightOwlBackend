"use client";

import React, { forwardRef } from "react";

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ src, poster, className = "" }, ref) => {
    return (
      <video
        ref={ref}
        controls
        preload="metadata"
        poster={poster}
        className={`w-full rounded shadow-md   ${className}`}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
