import { useEffect, useRef } from "react";
import { modalStack } from "../lib/modalStack";

export function useModalStack(onEscape: () => void) {
  const idRef = useRef<string>(
    "m_" + Math.random().toString(36).slice(2)
  ) as any;

  useEffect(() => {
    const id = idRef.current;
    modalStack.push(id);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // only topmost modal handles Escape
        if (modalStack.top() === id) {
          onEscape();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      modalStack.pop(id);
    };
  }, [onEscape]);
}
