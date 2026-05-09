"use client";
import { useEffect } from "react";

export default function SafeFullscreenShim() {
  useEffect(() => {
    const doc = document as any;

    if (doc.__safeExitFullscreenPatched) return;
    doc.__safeExitFullscreenPatched = true;
    const _exit = document.exitFullscreen?.bind(document);
    document.exitFullscreen = async () => {
      if (!document.fullscreenElement) return;
      try {
        return await _exit?.();
      } catch {
        /* ignore */
      }
    };
  }, []);
  return null;
}
