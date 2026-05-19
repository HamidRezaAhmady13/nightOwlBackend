"use client";
import { useEffect, useRef } from "react";
import { useModalStack } from "@/features/hooks/useModalStack";
import Button from "@/features/components/shared/Button";
import { useClickOutside } from "@/features/hooks/useClickOutside";

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  isLoading,
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useModalStack(onCancel);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <div
      className="fixed inset-0 z-50 u-flex-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="u-bg-deep rounded-lg p-lg max-w-sm w-full shadow-xl"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-xs">{title}</h3>
        <p className="u-text-secondary  mb-md">{message}</p>
        <div className="flex justify-end gap-xs">
          <Button onClick={onCancel} size="sm" intent="ghost" height="md">
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            type="button"
            size="sm"
            height="md"
            className="!bg-red-600 hover:!bg-red-700"
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
