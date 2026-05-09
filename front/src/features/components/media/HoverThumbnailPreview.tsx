"use client";

import { useEffect, useRef, useState } from "react";
import { findSeekBar } from "@/features/utils/thumbnailUtils";
import { clampPosition, snapTime } from "@/features/utils/thumbnailMath";
import { drawImageToCanvas } from "@/features/utils/thumbnailDrawing";
import { ThumbnailPreviewProps } from "./preview.types";

export function HoverThumbnailPreview({
  videoRef,
  thumbUrlFn,
  intervalSec = 30,
  seekBarSelector,
  width = 160,
  height = 90,
}: ThumbnailPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const imageCache = useRef<Record<number, HTMLImageElement>>({});
  const lastSnapRef = useRef<number>(-1);

  useEffect(() => {
    if (!videoRef.current) return;

    let cleanup: (() => void) | undefined;

    findSeekBar(seekBarSelector).then((bar) => {
      cleanup = attachListeners(bar);
    });

    function attachListeners(bar: HTMLElement) {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      const videoEl = videoRef.current!;
      let duration = videoEl.duration || 0;

      if (videoEl.readyState < 1) {
        videoEl.addEventListener("loadedmetadata", () => {
          duration = videoEl.duration;
        });
      }

      const handleMove = (e: MouseEvent) => {
        const rect = bar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const hoveredTime = percent * duration;
        const snapped = Math.min(
          snapTime(hoveredTime, intervalSec),
          Math.floor(duration / intervalSec) * intervalSec
        );

        if (
          snapped === lastSnapRef.current &&
          imageCache.current[snapped] &&
          visible
        )
          return;
        lastSnapRef.current = snapped;

        const canvas = canvasRef.current!;
        canvas.style.left = `${clampPosition(
          e.clientX,
          width,
          window.innerWidth
        )}px`;
        canvas.style.top = `${Math.max(0, rect.top - height - 8)}px`;
        setVisible(true);

        if (imageCache.current[snapped]) {
          drawImageToCanvas(ctx, imageCache.current[snapped], width, height);
        } else {
          const img = new Image();
          img.src = thumbUrlFn(snapped);
          img.decode().then(() => {
            imageCache.current[snapped] = img;
            drawImageToCanvas(ctx, img, width, height);
          });
        }

        // Prefetch neighbours
        for (let offset = -2; offset <= 2; offset++) {
          if (offset === 0) continue;
          const neighborSnap = snapped + offset * intervalSec;
          if (
            neighborSnap >= 0 &&
            neighborSnap <= duration &&
            !imageCache.current[neighborSnap]
          ) {
            const preload = new Image();
            preload.src = thumbUrlFn(neighborSnap);
            imageCache.current[neighborSnap] = preload;
          }
        }
      };
      const handleLeave = () => {
        lastSnapRef.current = -1; // force next move to redraw
        setVisible(false);
      };

      bar.addEventListener("mousemove", handleMove);
      bar.addEventListener("mouseleave", handleLeave);

      return () => {
        bar.removeEventListener("mousemove", handleMove);
        bar.removeEventListener("mouseleave", handleLeave);
      };
    }

    return () => {
      if (cleanup) cleanup();
    };
  }, [
    videoRef,
    seekBarSelector,
    thumbUrlFn,
    intervalSec,
    width,
    height,
    visible,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: "fixed",
        display: visible ? "block" : "none",
        pointerEvents: "none",
        zIndex: 9999,
        transform: "translateX(-50%)",
        border: "1px solid rgba(0,0,0,0.3)",
        background: "#000",
        borderRadius: "5px",
      }}
    />
  );
}
