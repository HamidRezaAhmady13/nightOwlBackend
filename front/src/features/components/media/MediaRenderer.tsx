import Image from "next/image";
// import { Player } from "react-tuby";
import VideoPlayer from "./VideoPlayer";

import { useEffect, useRef } from "react";
import FocusAwarePlayer from "./FocusAwarePlayer";
import FileLink from "../posts/FileLink";
import { API_URL } from "@/features/lib/api";

function normalizeUrl(raw: string) {
  if (raw.startsWith("http")) return raw;
  const slash = raw.startsWith("/") ? "" : "/";
  return `${API_URL}${slash}${raw}`;
}

export default function MediaRenderer({
  media,

  isActive,
  onActivate,
}: {
  media: any[];

  isActive: boolean;
  onActivate: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Only respond if the player container is the active element or contains it
      if (
        containerRef.current &&
        containerRef.current.contains(document.activeElement)
      ) {
        if (e.code === "Space") {
          e.preventDefault();
          // toggle play/pause here
        }
        if (e.code.toLowerCase() === "keyf") {
          e.preventDefault();
          // toggle fullscreen here
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const videoVariants = media.filter(
    (m) => m.type === "video" && m.quality !== "original"
  );
  const originalVideo = media.find(
    (m) => m.type === "video" && m.quality === "original"
  );
  const poster = media.find(
    (m) => m.type === "image" && m.url.includes("thumbnail")
  );
  const files = media.filter((m) => m.type === "file");
  const images = media.filter(
    (m) => m.type === "image" && !m.url.includes("thumbnail")
  );

  return (
    <div className="space-y-4 rounded-2xl " ref={containerRef} tabIndex={0}>
      {images.length > 0 &&
        videoVariants.length === 0 &&
        !originalVideo &&
        images.map((img) => (
          <Image
            key={img.id}
            src={`${API_URL}${img.url}`}
            alt="Post image"
            width={600}
            height={400}
            className="rounded-2xl"
          />
        ))}
      {videoVariants.length > 0 ? (
        <div className="rounded-2xl overflow-hidden  ">
          <FocusAwarePlayer
            isActive={isActive}
            onActivate={onActivate}
            src={videoVariants.map((v) => ({
              quality: v.quality,
              url: `${API_URL}${v.url}`,
            }))}
            poster={poster ? `${API_URL}${poster.url}` : undefined}
            primaryColor="#84fc90"
          />
        </div>
      ) : originalVideo ? (
        <div className="rounded-2xl overflow-hidden ">
          <VideoPlayer
            src={normalizeUrl(originalVideo.url)}
            poster={poster ? `${API_URL}${poster.url}` : undefined}
          />
        </div>
      ) : null}
      {files.map((file) => (
        <FileLink key={file.id} url={`${API_URL}${file.url}`} />
      ))}
    </div>
  );
}
