"use client";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useSeekHoverListeners } from "./useSeekHoverListeners";
import { useCanvasPortalLifecycle } from "./useCanvasPortalLifecycle";

export default function CanvasPortal({
  canvasRef,
  width = 160,
  height = 90,
  style,
  postId,
  onRemount,
  lastPointerRef,
  showCanvasPortal,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  postId?: string;
  onRemount?: () => void;
  lastPointerRef?: React.RefObject<PointerEvent | null>;
  showCanvasPortal: boolean;
}) {
  const updatePointerX = React.useCallback((clientX: number) => {
    // forward to lifecycle hook later via seek or state
    // temporarily just log to verify wiring
    console.log("MOVE clientX", clientX);
  }, []);

  const seek = useSeekHoverListeners(
    `#video-container-${postId} .tuby-seek-bar`,
    updatePointerX
  );

  const [mountEl, setMountEl] = useState<HTMLElement | null>(() =>
    typeof document !== "undefined" ? document.body : null
  );
  const { isMounted, isVisible, transform } = useCanvasPortalLifecycle({
    canvasRef,
    mountEl,
    postId,
    seek,
    lastPointerRef,
    showCanvasPortal,
    width,
    height,
    onRemount,
  });

  // console.log(transform, "Portal");

  const canvasStyle: React.CSSProperties = {
    position: "fixed",
    left: 0,
    top: 0,
    pointerEvents: "none",
    zIndex: 99999,
    willChange: "transform, opacity",
    borderRadius: 4,
    transition: "opacity 120ms ease, transform 120ms ease",
    background: "rgba(255,0,0,0.8)", // debug - remove later
    ...style,
  };

  if (!mountEl || !isMounted) return null;

  return ReactDOM.createPortal(
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      aria-hidden
      style={{
        ...canvasStyle,
        opacity: isVisible ? 1 : 0,
        transform: transform,
      }}
    />,
    mountEl
  );
}
