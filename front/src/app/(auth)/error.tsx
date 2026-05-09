"use client";

import Button from "@/features/components/shared/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="p-6 text-center">
      <h2 className="u-text-error ">Something went wrong</h2>
      <p className="u-text-secondary">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
