"use client";
import { useRef, useEffect, useState } from "react";

export function SpritePreview({
  spriteUrl,
  frameWidth,
  frameHeight,
  columns,
  totalFrames,
}: {
  spriteUrl: string;
  frameWidth: number;
  frameHeight: number;
  columns: number;
  totalFrames: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spriteImg, setSpriteImg] = useState<HTMLImageElement | null>(null);
  const [visible, setVisible] = useState(false);
  console.log(document.querySelector(".tuby-progress-bar"));
  console.log(document.querySelector(".tuby-seek"));

  // Load sprite
  useEffect(() => {
    console.log("useffect1");
    const img = new Image();
    img.src = spriteUrl;
    img.onload = () => {
      console.log("✅ Sprite loaded:", spriteUrl);
      setSpriteImg(img);
    };
    img.onerror = () => console.error("❌ Failed to load sprite:", spriteUrl);
  }, [spriteUrl]);

  // Attach listeners after sprite loads
  useEffect(() => {
    console.log("useffect2");

    if (!spriteImg || !canvasRef.current) return;

    // Wait until the progress bar exists
    const poll = setInterval(() => {
      const timeline = document.querySelector(
        ".tuby-seek"
      ) as HTMLElement | null;
      if (!timeline) return;

      clearInterval(poll);
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;

      const handleMouseMove = (e: Event) => {
        const mouseEvent = e as MouseEvent;
        const rect = timeline.getBoundingClientRect();
        const x = mouseEvent.clientX - rect.left;
        const percent = x / rect.width;
        const frameIndex = Math.min(
          Math.floor(percent * totalFrames),
          totalFrames - 1
        );
        const col = frameIndex % columns;
        const row = Math.floor(frameIndex / columns);

        // Position canvas above cursor
        canvas.style.left = `${mouseEvent.clientX}px`;
        canvas.style.top = `${rect.top - frameHeight - 8}px`;

        // Show it
        setVisible(true);
        console.log(visible, "at useEffect!");

        // Draw frame
        ctx.clearRect(0, 0, frameWidth, frameHeight);
        ctx.drawImage(
          spriteImg,
          col * frameWidth,
          row * frameHeight,
          frameWidth,
          frameHeight,
          0,
          0,
          frameWidth,
          frameHeight
        );
      };

      const handleMouseLeave = () => {
        setVisible(false);
      };

      timeline.addEventListener("mousemove", handleMouseMove as EventListener);
      timeline.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        timeline.removeEventListener(
          "mousemove",
          handleMouseMove as EventListener
        );
        timeline.removeEventListener("mouseleave", handleMouseLeave);
      };
    }, 100);

    return () => clearInterval(poll);
  }, [spriteImg, frameWidth, frameHeight, columns, totalFrames]);

  console.log("Canvas visible state:", visible);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={frameWidth}
        height={frameHeight}
        style={{
          position: "fixed",
          display: visible ? "block" : "none",
          pointerEvents: "none",
          zIndex: 9999,
          transform: "translateX(-50%)",
        }}
      />
    </>
  );
}
