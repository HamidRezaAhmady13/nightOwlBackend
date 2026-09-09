"use client";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

export default function GlobalTopLoader() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const isLoading = isFetching > 0 || isMutating > 0;

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-[5px] z-[9999] overflow-hidden dark:bg-cobalt-100/30 bg-amber-900/30">
      <style>{`
        @keyframes slideRight {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* The glowing laser beam that shoots across the top */}
      <div
        className="h-full w-1/2 dark:bg-cobalt-300 dark:shadow-[0_0_10px_#616779] bg-amber-900 shadow-[0_0_10px_#f59e0b] rounded-full"
        style={{ animation: "slideRight 1s infinite linear" }}
      />
    </div>
  );
}
