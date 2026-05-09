export type FormInputProps = {
  value?: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  name?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  accept?: string;
  onKeyDownCapture?: (e: React.KeyboardEvent<any>) => void;
  onKeyDown?: React.KeyboardEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  >;
  onMouseDown?: React.MouseEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onClick?: React.MouseEventHandler<HTMLInputElement | HTMLTextAreaElement>;
};
