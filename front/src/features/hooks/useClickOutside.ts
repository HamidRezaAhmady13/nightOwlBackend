import { useEffect } from "react";

export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
) {
  useEffect(() => {
    if (!ref) return;

    const listener = (event: Event) => {
      try {
        if ((event as any).defaultPrevented) return;

        const path =
          (event as any).composedPath?.() || ([] as EventTarget[] | undefined);
        if (path && path.length > 0) {
          if (ref.current && path.includes(ref.current)) return;
        } else {
          if (!ref.current) return;
          const target = event.target as Node | null;
          if (target && ref.current.contains(target)) return;
        }

        handler();
      } catch (err) {
        console.warn("useClickOutside listener error", err);
      }
    };

    document.addEventListener("pointerdown", listener);
    document.addEventListener("touchstart", listener, { passive: true });

    return () => {
      document.removeEventListener("pointerdown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
