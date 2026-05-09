"use client";
type SpinnerProps = { message?: string; size?: number; padding?: boolean };

export default function Spinner({
  message,
  size = 50,
  padding = true,
}: SpinnerProps) {
  return (
    <div>
      <div className={`u-flex-col-center ${padding ? "py-xl" : ""}   `}>
        <div
          style={{ width: size, height: size }}
          className={` border-4 border-amber-600 dark:border-cobalt-600
        border-t-transparent dark:border-t-transparent rounded-full animate-spin  `}
        />
        {message && <p className="mt-md u-text-tertiary">{message}</p>}
      </div>
    </div>
  );
}
