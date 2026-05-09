// components/media/ThumbnailPreview.tsx
"use client";
import React, { RefObject, useEffect, useState } from "react";
import ReactDOM from "react-dom";

type Props = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  videoRef?: RefObject<HTMLVideoElement | null>;
  width?: number;
  height?: number;
};

export default function ThumbnailPreview({
  canvasRef,
  width = 160,
  height = 90,
}: Props) {
  const [mountEl, setMountEl] = useState<HTMLElement | null>(() =>
    typeof document !== "undefined" ? document.body : null
  );

  useEffect(() => {
    const updateMount = () => {
      const fs = document.fullscreenElement;
      setMountEl(fs && fs instanceof HTMLElement ? fs : document.body);
    };
    updateMount();
    document.addEventListener("fullscreenchange", updateMount);
    return () => document.removeEventListener("fullscreenchange", updateMount);
  }, []);

  if (!mountEl) return null;

  const canvas = (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      aria-hidden
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        pointerEvents: "none",
        border: "4px solid #b1987f",
        borderRadius: "3px",
      }}
    />
  );

  return ReactDOM.createPortal(canvas, mountEl);
}
