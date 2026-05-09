import { useCallback, useEffect, useRef } from "react";

export function useCanvasDraw(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  opts: { imgSrc?: string; width?: number; height?: number; visible?: boolean }
) {
  const redrawRef = useRef(() => {});
  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const w = opts.width ?? canvas.width;
      const h = opts.height ?? canvas.height;
      ctx.clearRect(0, 0, w, h);
      if (opts.imgSrc) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = opts.imgSrc;
        img.onload = () => {
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          canvas.style.display = opts.visible ? "block" : "none";
        };
        img.onerror = () => {
          ctx.fillStyle = "#222";
          ctx.fillRect(0, 0, w, h);
          canvas.style.display = opts.visible ? "block" : "none";
        };
      } else {
        ctx.fillStyle = "#222";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#fff";
        ctx.font = "12px sans-serif";
        ctx.fillText("thumbnail", 8, 20);
        canvas.style.display = opts.visible ? "block" : "none";
      }
    };
    redrawRef.current = draw;
    if (opts.visible) draw();
  }, [canvasRef, opts.imgSrc, opts.width, opts.height, opts.visible]);
  const redraw = useCallback(() => {
    redrawRef.current();
  }, []);
  return { redraw };
}
