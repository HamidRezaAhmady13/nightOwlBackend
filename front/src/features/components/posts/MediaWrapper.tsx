import React from "react";
import type { PostMode } from "@/features/types";

const modalMaxHeight = "calc(85vh - 160px)";

export default function MediaWrapper({
  mode = "feed",
  aspectClass = "",
  children,
}: {
  mode?: PostMode;
  aspectClass?: string;
  children: React.ReactNode;
}) {
  if (mode === "feed") {
    return (
      <div
        className={`relative w-full ${aspectClass} overflow-hidden rounded-2xl`}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-3xl mx-auto"
      style={{
        maxHeight: modalMaxHeight,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        className="w-full max-w-3xl mx-auto "
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}
