"use client";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import ReactDOM from "react-dom";
// import { useClickOutside } from "@/app/(protected)/hooks/useClickOutside";
import { usePathname } from "next/navigation";
import { useModalStack } from "@/features/hooks/useModalStack";
import { useClickOutside } from "@/features/hooks/useClickOutside";
// import { useModalStack } from "@/app/(protected)/hooks/useModalStack";

type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
  ariaLabel?: string;
};
const FOCUSABLE_SELECTOR =
  'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

export default function PostModal({
  children,
  onClose,
  ariaLabel = "Dialog",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const prevOverflowRef = useRef<string>("");
  const pathname = usePathname();
  useModalStack(() => onClose());

  function restoreBodyOverflow() {
    if (prevOverflowRef.current !== undefined) {
      document.body.style.overflow = prevOverflowRef.current || "";
      prevOverflowRef.current = "";
    }
  }

  useLayoutEffect(() => {
    prevOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => restoreBodyOverflow();
  }, []);

  useEffect(() => () => restoreBodyOverflow(), [pathname]);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const focusable =
      dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    focusable?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const nodes =
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (!nodes || nodes.length === 0) {
        e.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused.current?.focus();
    };
  }, [onClose]);

  useClickOutside(dialogRef as React.RefObject<HTMLElement>, onClose);

  const handleOverlayMouseDown = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const modal = (
    <div
      ref={overlayRef}
      onMouseDown={handleOverlayMouseDown}
      className="fixed inset-0 z-50  p-lg"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "24px",
      }}
      aria-modal="true"
      role="presentation"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-label={ariaLabel}
        onPointerDown={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-4xl u-bg-deep rounded-md shadow-lg min-w-[70rem]  "
        style={{
          height: "95vh",
          maxHeight: "95vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* header / close button area (fixed) */}
        <div
          style={{
            position: "relative",
            zIndex: 20,
            padding: "16px 20px",
            flex: "0 0 auto",
          }}
        >
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute right-md top-md rounded p-xs u-text-lg u-text-secondary-soft focus:outline-none"
          >
            ✕
          </button>
          {/* optional header slot if needed */}
        </div>

        {/* main content: gives Post a full-height area to layout inside */}
        <div
          className="flex items-center justify-center "
          style={{
            flex: "1 1 auto",
            // display: "flex",
            // flexDirection: "column",
            overflow: "hidden",
            minHeight: 0,
            padding: "0 16px 16px 16px",
            // alignItems: "stretch",
            // justifyContent: "flex-center",
          }}
        >
          {/* children should be a PostShell or Post component that fills this area */}
          {children}
        </div>
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return ReactDOM.createPortal(modal, document.body);
}

//
// <div
//       ref={dialogRef}
//       role="dialog"
//       aria-label={ariaLabel}
//       onPointerDown={(e) => e.stopPropagation()}
//       className="relative z-10 w-full max-w-4xl u-bg-deep rounded-md shadow-lg"
//       style={{
//         maxHeight: "100vh",
//         minHeight: "95vh",
//         display: "flex",
//         flexDirection: "column",
//       }}
//     >
//       <div
//         className="p-md"
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           height: "100%",
//           gap: 12,
//         }}
//       >
//         <div style={{ position: "relative", zIndex: 20 }}>
//           <button
//             aria-label="Close"
//             onClick={onClose}
//             className="absolute right-md top-md rounded p-xs u-text-lg u-text-secondary-soft focus:outline-none"
//           >
//             ✕
//           </button>
//           {/* optional header insertion point */}
//         </div>

//         <div
//           className="px-md"
//           style={{
//             flex: 1,
//             overflow: "hidden", // media area will manage its scroll
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             minHeight: 0,
//           }}
//         >
//           <div
//             style={{
//               width: "100%",
//               height: "100%",
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//               minHeight: 0,
//             }}
//           >
//             {children}
//           </div>
//         </div>
//       </div>
//     </div>
