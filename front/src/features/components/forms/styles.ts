import { cva } from "class-variance-authority";

export const inputStyles = cva(
  [
    "transition-all duration-slow",
    "w-full rounded",

    /* base colors */
    "u-bg-deep",
    "text-cobalt-950 dark:text-amber-50",

    /* subtle ring on ANY focus (click or Tab) */
    "u-focus-visible",

    /* border color controlled by intent */
    "border",

    /* file‐input styles… */
    "file:transition-all file:duration-slow file:ease-in-out",
    "file:mr-md file:py-sm file:px-md file:rounded file:border-0",
    "file:text-sm file:font-semibold",
    "file:bg-amber-700 file:hover:bg-amber-800 file:text-amber-50",
    "file:dark:bg-cobalt-500 file:dark:hover:bg-cobalt-600 file:dark:text-amber-100",
    "file:focus:outline-none file:focus:ring-1 file:focus:ring-primary",
  ].join(" "),
  {
    variants: {
      intent: {
        default: "u-border",
        error: "border-red-500",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed",
      },
      size: {
        sm: "px-sm py-xm text-sm",
        md: "px-md py-sm text-base", // matches your base
        lg: "px-lg py-md text-lg",
      },
    },
    defaultVariants: {
      intent: "default",
      disabled: false,
      size: "md",
    },
  }
);
