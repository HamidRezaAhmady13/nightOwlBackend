"use client";
import clsx from "clsx";
import { forwardRef } from "react";
import { buttonStyles } from "./styles";
import { ButtonProps } from "./button.types";

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    label,
    children,
    className,
    intent,
    size,
    full,
    focusRing,
    height,
    flex,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      className={clsx(
        buttonStyles({ intent, size, full, focusRing, flex, height }),
        className
      )}
      {...props}
    >
      {children ?? label}
    </button>
  );
});

export default Button;
