import { FormInputProps as InitalFormInputProps } from "@/features/types";
import clsx from "clsx";

import React, {
  forwardRef,
  useRef,
  useEffect,
  useImperativeHandle,
} from "react";
import { inputStyles } from "./styles";

interface FormInputProps extends InitalFormInputProps {
  wrapperClassName?: string;
  onKeyDown?: React.KeyboardEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  >;
  onMouseDown?: React.MouseEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onClick?: React.MouseEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  autoFocus?: boolean;

  onPointerDown?: React.PointerEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  >;
}

const FormInput = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  FormInputProps
>(
  (
    {
      type = "text",
      name,
      autoFocus,
      value,
      onChange,
      placeholder,
      error,
      required = false,
      disabled = false,
      multiline = false,
      rows = 4,
      className = "",
      onKeyDownCapture,
      wrapperClassName = "",
      onKeyDown,
      onMouseDown,
      onClick,
      accept,
      onPointerDown,
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Expose the correct ref to parent
    useImperativeHandle(ref, () => {
      return (multiline ? textareaRef.current : inputRef.current) as
        | HTMLInputElement
        | HTMLTextAreaElement;
    });

    // Auto-resize for textarea
    const handleInput = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height =
          textareaRef.current.scrollHeight + "px";
        textareaRef.current.style.maxHeight = "120px";
      }
    };

    // when clearing, reset to initial rows height (approximate)
    const resetHeightToRows = (rowsCount = rows) => {
      if (!textareaRef.current) return;
      const lineHeightPx = 32; // adjust if your CSS uses a different line-height
      textareaRef.current.style.height = `${rowsCount * lineHeightPx}px`;
    };

    useEffect(() => {
      if (multiline) {
        if (value) {
          handleInput();
        } else {
          resetHeightToRows(rows);
        }
      }
    }, [value, multiline, rows]);

    const classes = clsx(
      inputStyles({
        intent: error ? "error" : "default",
        disabled,
        size: "md",
      }),
      className // allow ad-hoc overrides like clickable/pseudo tweaks
    );

    return (
      <div className={clsx("space-y-xs", wrapperClassName)}>
        {multiline ? (
          <textarea
            ref={textareaRef as React.Ref<HTMLTextAreaElement>}
            name={name}
            onKeyDownCapture={onKeyDownCapture}
            onKeyDown={onKeyDown}
            onMouseDown={onMouseDown}
            onClick={onClick}
            value={value}
            onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
            onInput={handleInput}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`${classes} ${className}  `}
            rows={rows}
            autoFocus={autoFocus} // Pass autoFocus to textarea
            onPointerDown={onPointerDown} // Pass onPointerDown to textarea
          />
        ) : type === "file" ? (
          <input
            ref={inputRef}
            type="file"
            name={name}
            accept={accept}
            onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
            required={required}
            disabled={disabled}
            className={`${classes} ${className}`}
          />
        ) : (
          <input
            ref={inputRef}
            type={type}
            name={name}
            value={value ?? ""}
            onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
            onKeyDownCapture={onKeyDownCapture}
            onKeyDown={onKeyDown}
            onMouseDown={onMouseDown}
            onClick={onClick}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`${classes} ${className}`}
            autoFocus={autoFocus} // Pass autoFocus to input
            onPointerDown={onPointerDown} // Pass onPointerDown to input
          />
        )}
        <div className="h-xl">
          {error && <p className="u-text-error">{error}</p>}
        </div>
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
export default FormInput;
