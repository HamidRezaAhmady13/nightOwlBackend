// import { HoverPreviewSetupProps } from "@/features/components/media/HoverPreviewSetupProps.types";

import { HoverPreviewSetupProps } from "../components/media/preview.types";

export function setupHoverPreview({
  bar,
  canvasRef,
  videoRef,
  setVisible,
  thumbUrlFn,
  intervalSec,
  width,
  height,
  imageCache,
}: HoverPreviewSetupProps) {
  const ctx = canvasRef.current?.getContext("2d");
  if (!ctx) return;

  const videoEl = videoRef.current;
  let videoDuration = videoEl?.duration || 0;

  let lastSnap = -1;

  const handleMove = (e: MouseEvent) => {
    // same logic as before, but cleanly scoped
  };

  const handleLeave = () => setVisible(false);

  bar.addEventListener("mousemove", handleMove);
  bar.addEventListener("mouseleave", handleLeave);

  return () => {
    bar.removeEventListener("mousemove", handleMove);
    bar.removeEventListener("mouseleave", handleLeave);
  };
}
