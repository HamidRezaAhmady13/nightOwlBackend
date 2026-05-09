import { cva } from "class-variance-authority";

export const buttonStyles = cva(
  [
    "u-flex-center  ",
    "transition-all duration-slow ",
    "disabled:opacity-50 disabled:cursor-not-allowed  ",
    "rounded",
    "font-medium",
    "my-xs",
  ],
  {
    variants: {
      focusRing: {
        true: ["u-focus-visible"].join(" "),
        false: "",
      },
      intent: {
        primary: "u-text-btn u-bg-btn",
        ghost: "u-text-tertiary u-bg-ghost",
        invisible: [
          "bg-transparent text-inherit", // base look
          "hover:bg-transparent active:bg-transparent", // disable hover/active
          "focus:outline-none focus:ring-0 ring-0", // remove focus ring
          "shadow-none", // remove any shadow
        ].join(" "),
      },
      flex: {
        start: "justify-start",
        center: "justify-center",
      },
      size: {
        xs: "py-xs px-sm text-xxs",
        sm: "py-xs px-sm text-xs",
        md: "py-sm px-md text-sm",
        lg: "py-sm px-md text-lg",
        xlg: "py-md px-md text-xl",
      },
      height: {
        xs: "h-md",
        sm: "h-lg",
        md: "h-xl",
        lg: "h-2xl",
        xlg: "h-3xl",
      },
      full: {
        true: "w-full",
        half: "w-[70%]",
        false: "w-auto",
      },
    },
    defaultVariants: {
      flex: "center",
      intent: "primary",
      size: "md",
      full: false,
      focusRing: true,
      height: "lg",
    },
  }
);
