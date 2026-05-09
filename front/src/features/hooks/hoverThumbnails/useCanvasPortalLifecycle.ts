import { useCallback, useEffect, useRef, useState } from "react";

export function useCanvasPortalLifecycle({
  canvasRef,
  showCanvasPortal,
  seek, // optional object with lastRect()
  lastPointerRef,
  width,
  height,
  onRemount,
}: any) {
  const cachedRect = useRef<DOMRect | null>(null);
  const tidy = useRef<number | null>(null);
  const seekRef = useRef<any>(null);

  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [transform, setTransform] = useState("");

  // stable attach for seek
  const attachSeek = useCallback((s: any) => {
    seekRef.current = s;
  }, []);

  // small helper that reads seek from seekRef first, then fallback to passed seek
  const measureRectFromSeek = useCallback(() => {
    return seekRef.current?.lastRect?.() ?? seek?.lastRect?.() ?? null;
  }, [seek]);

  // Show-effect: measure (via seek), retry once, then set transform + mounted+visible together
  useEffect(() => {
    if (!showCanvasPortal) return;
    const raf = requestAnimationFrame(() => {
      let rect = measureRectFromSeek();
      if (!rect) {
        // single short retry so portal doesn't measure itself
        return requestAnimationFrame(() => {
          const r = measureRectFromSeek();
          if (!r) return;
          rect = r;
          cachedRect.current = rect;
          const cachedTop = Math.max(
            8,
            Math.min(rect.top - height - 8, window.innerHeight - height - 8)
          );
          const clientX =
            (lastPointerRef?.current as any)?.clientX ??
            rect.left + rect.width / 2;
          setTransform(
            `translate(${Math.round(clientX - width / 2)}px, ${Math.round(
              cachedTop
            )}px) scale(0.98)`
          );
          setIsMounted(true);
          setIsVisible(true);
          onRemount?.();
        });
      }

      cachedRect.current = rect;
      const cachedTop = Math.max(
        8,
        Math.min(rect.top - height - 8, window.innerHeight - height - 8)
      );
      const clientX =
        (lastPointerRef?.current as any)?.clientX ?? rect.left + rect.width / 2;
      setTransform(
        `translate(${Math.round(clientX - width / 2)}px, ${Math.round(
          cachedTop
        )}px) scale(0.98)`
      );
      setIsMounted(true);
      setIsVisible(true);
      onRemount?.();
    });
    return () => cancelAnimationFrame(raf);
  }, [
    showCanvasPortal,
    measureRectFromSeek,
    lastPointerRef,
    width,
    height,
    onRemount,
  ]);

  // Hide cleanup & clear cached rect — only run when mounted AND NOT visible AND NOT being asked to show
  useEffect(() => {
    if (!isMounted || isVisible || showCanvasPortal) return;
    const el = canvasRef.current;
    if (!el) return;

    const done = () => {
      setIsMounted(false);
      if (tidy.current) {
        clearTimeout(tidy.current);
        tidy.current = null;
      }
      cachedRect.current = null;
    };

    el.addEventListener("transitionend", done, { once: true });
    tidy.current = window.setTimeout(done, 400);
    setTransform((s) => s.replace(/scale\([^)]+\)/, "scale(0.98)"));

    return () => {
      el.removeEventListener("transitionend", done);
      if (tidy.current) {
        clearTimeout(tidy.current);
        tidy.current = null;
      }
    };
  }, [isVisible, isMounted, canvasRef, showCanvasPortal]);

  // Public: update X only, keep Y from cached rect (prefer cachedRect; fall back to seek)
  const updatePointerX = useCallback(
    (clientX: number) => {
      const rect = cachedRect.current ?? measureRectFromSeek();
      if (!rect) return;
      const cachedTop = Math.max(
        8,
        Math.min(rect.top - height - 8, window.innerHeight - height - 8)
      );
      const left = Math.round(clientX - width / 2);
      setTransform(
        `translate(${left}px, ${Math.round(cachedTop)}px) scale(0.98)`
      );
    },
    [measureRectFromSeek, height, width]
  );

  return {
    isMounted,
    isVisible,
    transform,
    setIsVisible,
    updatePointerX,
    attachSeek,
  };
}
