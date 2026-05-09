import { VariantProps } from "class-variance-authority";
import { buttonStyles } from "./styles";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles> & {
    label?: string;
    className?: string;
  };
