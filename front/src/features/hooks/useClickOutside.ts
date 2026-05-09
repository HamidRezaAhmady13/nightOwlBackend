import { useEffect } from "react";

export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void
) {
  useEffect(() => {
    if (!ref) return;

    const listener = (event: Event) => {
      try {
        // ignore if already prevented by other logic
        if ((event as any).defaultPrevented) return;

        const path =
          (event as any).composedPath?.() || ([] as EventTarget[] | undefined);
        // if composedPath exists and contains the ref, it's an inside click
        if (path && path.length > 0) {
          if (ref.current && path.includes(ref.current)) return;
        } else {
          // fallback to contains
          if (!ref.current) return;
          const target = event.target as Node | null;
          if (target && ref.current.contains(target)) return;
        }

        handler();
      } catch (err) {
        // swallow to avoid breaking UI
        console.warn("useClickOutside listener error", err);
      }
    };

    // pointerdown covers mouse/touch/stylus; include touchstart for older browsers
    document.addEventListener("pointerdown", listener);
    document.addEventListener("touchstart", listener, { passive: true });

    return () => {
      document.removeEventListener("pointerdown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
