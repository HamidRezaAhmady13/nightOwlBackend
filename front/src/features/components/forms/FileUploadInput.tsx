"use client";
import { useRef } from "react";
import { FileUploadInputProps } from "./forms.types";
import Button from "../shared/Button";

export default function FileUploadInput({
  name,
  label = "Choose File",
  accept = "image/*,video/*",
  onChange,
  selectedFile,
  className = "",
}: FileUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`space-y-sm w-full ${className}`}>
      <div className="u-flex-start gap-md py-xs px-sm u-border">
        <Button
          type="button"
          height="sm"
          size="xs"
          aria-label="Choose file"
          onClick={() => inputRef.current?.click()}
        >
          {label}
        </Button>
        <p className="u-text-tertiary">
          {selectedFile ? `Selected: ${selectedFile.name}` : "No file chosen"}
        </p>
      </div>

      <input
        ref={inputRef}
        id={name}
        name={name}
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          onChange(file);
          e.currentTarget.value = "";
        }}
        className="hidden"
      />
    </div>
  );
}
